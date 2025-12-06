"use server"
import { revalidatePath } from 'next/cache'
import { createClient as createServerSupabase } from '../supabase/server'

export type GetTransactionsParams = {
  page?: number
  pageSize?: number
  accountId?: string
  category?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export type AddTransactionParams = {
  date: string
  description: string
  amount: number
  category?: string
  accountId: string
}

export async function addTransaction(params: AddTransactionParams) {
  const { date, description, amount, category, accountId } = params
  
  // Validation
  if (!date || !description || amount === undefined || !accountId) {
    return { success: false, error: 'Missing required fields' }
  }
  
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  
  // Verify the account belongs to the user
  const { data: account } = await supabase
    .from('accounts')
    .select('id')
    .eq('id', accountId)
    .eq('user_id', user.id)
    .single()
  
  if (!account) {
    return { success: false, error: 'Account not found' }
  }
  
  // Insert the transaction
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      account_id: accountId,
      date,
      description,
      amount,
      category: category || 'Uncategorized',
      confidence_score: 1.0, // Manual entries have full confidence
      is_recurring: false,
      tax_deductible: false
    })
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  // Recalculate account balance
  try {
    await import('./accounts').then(mod => mod.recalculateAccountBalance(accountId))
  } catch (e) {
    console.warn('Recalculate account balance failed:', e)
  }
  
  // Recalculate monthly summary for the transaction's month
  try {
    const monthStart = new Date(date)
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    await import('./analytics').then(mod => mod.recalculateMonthlySummary(user.id, monthStart.toISOString()))
  } catch (e) {
    console.warn('Recalculate monthly summary failed:', e)
  }
  
  revalidatePath('/data')
  return { success: true, data }
}

export async function getTransactions(params: GetTransactionsParams = {}) {
  const { page = 1, pageSize = 20, accountId, category, dateFrom, dateTo, search } = params
  const supabase = await createServerSupabase()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Join with accounts to get account name (left join for transactions that may not have accounts)
  let q = supabase
    .from('transactions')
    .select('*, accounts(name)', { count: 'exact' })
    .order('date', { ascending: false })
    .range(from, to)
  
  // Apply filters
  if (accountId) q = q.eq('account_id', accountId)
  if (category) q = q.eq('category', category)
  if (dateFrom) q = q.gte('date', dateFrom)
  if (dateTo) q = q.lte('date', dateTo + 'T23:59:59')
  if (search) q = q.ilike('description', `%${search}%`)

  const res = await q
  if (res.error) throw res.error
  
  // Transform data to flatten account_name while preserving all fields
  interface TransactionRow {
    id: string
    account_id: string
    user_id: string
    amount: number
    date: string
    description: string
    category: string
    is_recurring: boolean
    tax_deductible: boolean
    updated_at: string
    accounts?: { name?: string } | null
  }
  
  const data = (res.data || []).map((row: TransactionRow) => {
    const { accounts: acct, ...rest } = row
    return {
      ...rest,
      account_name: acct?.name || 'Unknown'
    }
  })
  
  const total = res.count ?? data.length
  const totalPages = Math.ceil((total || 0) / pageSize)

  return { data, metadata: { total, totalPages, page, pageSize } }
}

const MAX_BULK_ITEMS = 500

export async function bulkUpdateCategories(ids: string[], category: string) {
  if (!ids || ids.length === 0) return { success: false, updated: 0 }
  if (ids.length > MAX_BULK_ITEMS) return { success: false, error: `Too many ids (${ids.length}). Max allowed: ${MAX_BULK_ITEMS}` }
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  const res = await supabase
    .from('transactions')
    .update({ category, confidence_score: 1.0 })
    .in('id', ids)
    .eq('user_id', user.id)
    .select()
  if (res.error) return { success: false, error: res.error.message }
  await revalidatePath('/data')
  return { success: true, updated: res.data?.length || 0 }
}

export async function bulkDeleteTransactions(ids: string[]) {
  if (!ids || ids.length === 0) return { success: false, deleted: 0 }
  if (ids.length > MAX_BULK_ITEMS) return { success: false, error: `Too many ids (${ids.length}). Max allowed: ${MAX_BULK_ITEMS}` }
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  
  // Get account_ids before deletion for balance recalculation
  const accountIds = new Set<string>()
  const beforeDelete = await supabase.from('transactions').select('account_id').in('id', ids).eq('user_id', user.id)
  if (beforeDelete.data) {
    beforeDelete.data.forEach((t: { account_id: string }) => accountIds.add(t.account_id))
  }
  
  const res = await supabase.from('transactions').delete().in('id', ids).eq('user_id', user.id).select()
  if (res.error) return { success: false, error: res.error.message }
  await revalidatePath('/data')
  
  // Recalculate monthly summaries for months impacted by deletions
  try{
    type TxRow = { date: string }
    const months = Array.from(new Set(((res.data || []) as TxRow[]).map((t)=> new Date(t.date).toISOString().slice(0,7))))
    for(const m of months){
      const d = new Date(`${m}-01`).toISOString()
      await import('./analytics').then(mod => mod.recalculateMonthlySummary(user.id, d))
    }
  }catch(e){ console.warn('Recalculate monthly summaries failed:', e) }
  
  // Recalculate account balances for affected accounts
  try {
    for (const accId of accountIds) {
      await import('./accounts').then(mod => mod.recalculateAccountBalance(accId))
    }
  } catch (e) { console.warn('Recalculate account balances failed:', e) }
  
  return { success: true, deleted: res.data?.length || 0 }
}

export async function bulkUpdateAllCategories(category: string) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  const res = await supabase
    .from('transactions')
    .update({ category, confidence_score: 1.0 })
    .eq('user_id', user.id)
    .select()
  if (res.error) return { success: false, error: res.error.message }
  await revalidatePath('/data')
  return { success: true, updated: res.data?.length || 0 }
}

export async function bulkDeleteAllTransactions() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  const res = await supabase
    .from('transactions')
    .delete()
    .eq('user_id', user.id)
    .select()
  if (res.error) return { success: false, error: res.error.message }
  await revalidatePath('/data')
  
  // Recalculate all account balances (they should all be 0 now)
  try {
    await import('./accounts').then(mod => mod.recalculateAllAccountBalances(user.id))
  } catch (e) { console.warn('Recalculate account balances failed:', e) }
  
  return { success: true, deleted: res.data?.length || 0 }
}

export async function getTransactionById(id: string) {
  if(!id) return null
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const res = await supabase
    .from('transactions')
    .select('*, accounts(name)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (res.error) throw res.error
  
  // Transform to flatten account_name
  if (res.data) {
    const { accounts: acct, ...rest } = res.data as Record<string, unknown> & { accounts?: { name?: string } | null }
    return {
      ...rest,
      account_name: acct?.name || 'Unknown'
    }
  }
  return res.data
}
