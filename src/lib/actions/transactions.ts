"use server"
import { revalidatePath } from 'next/cache'
import { createClient as createServerSupabase } from '../supabase/server'

export type GetTransactionsParams = {
  page?: number
  pageSize?: number
  accountId?: string
}

export async function getTransactions(params: GetTransactionsParams = {}) {
  const { page = 1, pageSize = 20, accountId } = params
  const supabase = await createServerSupabase()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let q = supabase.from('transactions').select('*', { count: 'exact' }).order('date', { ascending: false }).range(from, to)
  if (accountId) q = q.eq('account_id', accountId)

  const res = await q
  if (res.error) throw res.error
  const data = res.data || []
  const total = res.count ?? data.length
  const totalPages = Math.ceil((total || 0) / pageSize)

  return { data, metadata: { total, totalPages, page, pageSize } }
}

export async function bulkUpdateCategories(ids: string[], category: string) {
  if (!ids || ids.length === 0) return { success: false, updated: 0 }
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
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  const res = await supabase.from('transactions').delete().in('id', ids).eq('user_id', user.id).select()
  if (res.error) return { success: false, error: res.error.message }
  await revalidatePath('/data')
  return { success: true, deleted: res.data?.length || 0 }
}
