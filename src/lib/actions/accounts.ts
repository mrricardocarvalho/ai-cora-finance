'use server'
import { createClient as createServerSupabase } from '../supabase/server'
import { syncGoalsForAccount, unlinkGoalsForAccount } from './goals'
import { accountSchema, AccountForm } from '../validations/accounts'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function createAccount(form: AccountForm) {
  const parsed = accountSchema.parse(form)
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Convert balance string to numeric for DB
  const dbRow = { id: crypto.randomUUID(), user_id: user.id, ...parsed, balance: parsed.balance ? Number(parsed.balance) : 0, interest_rate: parsed.interest_rate ? Number(parsed.interest_rate) : null, min_payment: parsed.min_payment ? Number(parsed.min_payment) : null, due_date: parsed.due_date ?? null }
  const res = await supabase.from('accounts').insert([dbRow]).select()
  
  // Check for errors
  if (res.error) {
    console.error('Account creation failed:', res.error)
    throw new Error(res.error.message)
  }
  
  // After creating an account, sync goals that might reference this account id
  const newId = res.data?.[0]?.id
  if(newId){ try{ await syncGoalsForAccount(newId, dbRow.balance) }catch(e){ console.warn('failed to sync goals for created account', e) } }
  await revalidatePath('/data')
  return res.data
}

export async function updateAccount(id: string, form: AccountForm) {
  const parsed = accountSchema.parse(form)
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const updateRow = { ...parsed, balance: parsed.balance ? Number(parsed.balance) : 0, interest_rate: parsed.interest_rate ? Number(parsed.interest_rate) : null, min_payment: parsed.min_payment ? Number(parsed.min_payment) : null, due_date: parsed.due_date ?? null }
  const res = await supabase.from('accounts').update(updateRow).eq('id', id).select()
  // Sync any linked goals to the new balance
  if(updateRow.balance !== undefined){ try{ await syncGoalsForAccount(id, updateRow.balance) }catch(e){ console.warn('failed to sync goals for account update', e) } }
  await revalidatePath('/data')
  return res.data
}

export async function deleteAccount(id: string) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const res = await supabase.from('accounts').delete().eq('id', id).select()
  // Unlink goals that referenced this account
  try{ await unlinkGoalsForAccount(id) }catch(e){ console.warn('failed to unlink goals after account delete', e) }
  await revalidatePath('/data')
  return res.data
}

export async function getAccounts() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  const res = await supabase.from('accounts').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
  if (res.error) return { success: false, error: res.error.message }
  return { success: true, data: res.data }
}

/**
 * Recalculate account balance from starting_balance + sum of all transactions.
 * 
 * Formula: balance = starting_balance + sum(transaction amounts)
 * 
 * The starting_balance is the account balance as of when you linked the account.
 * Transactions imported after that date are added to get the current balance.
 */
export async function recalculateAccountBalance(accountId: string) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get the account's starting balance
  const { data: account, error: accError } = await supabase
    .from('accounts')
    .select('starting_balance, starting_balance_date')
    .eq('id', accountId)
    .eq('user_id', user.id)
    .single()

  if (accError) {
    console.error('Failed to fetch account for balance recalc:', accError)
    throw accError
  }

  const startingBalance = Number(account?.starting_balance || 0)
  const startingDate = account?.starting_balance_date

  // Sum all transaction amounts for this account
  // Only count transactions AFTER the starting_balance_date if set
  let query = supabase
    .from('transactions')
    .select('amount, date')
    .eq('account_id', accountId)
    .eq('user_id', user.id)

  // If we have a starting balance date, only sum transactions after that date
  // The starting balance already includes transactions up to that date
  if (startingDate) {
    query = query.gt('date', startingDate)
  }

  const { data: transactions, error: txError } = await query

  if (txError) {
    console.error('Failed to fetch transactions for balance recalc:', txError)
    throw txError
  }

  // Calculate total from transactions after starting date
  const totalFromTransactions = (transactions || []).reduce((sum, tx) => {
    return sum + Number(tx.amount || 0)
  }, 0)

  // New balance = starting balance + transactions after starting date
  const newBalance = Math.round((startingBalance + totalFromTransactions) * 100) / 100

  // Update the account balance
  const { error: updateError } = await supabase
    .from('accounts')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('id', accountId)
    .eq('user_id', user.id)

  if (updateError) {
    console.error('Failed to update account balance:', updateError)
    throw updateError
  }

  // Sync goals linked to this account
  try {
    await syncGoalsForAccount(accountId, newBalance)
  } catch (e) {
    console.warn('Failed to sync goals after balance recalc:', e)
  }

  return newBalance
}

/**
 * Recalculate balances for all accounts belonging to a user.
 */
export async function recalculateAllAccountBalances(userId: string) {
  const supabase = await createServerSupabase()
  
  // Get all accounts for user
  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', userId)

  if (error) {
    console.error('Failed to fetch accounts for balance recalc:', error)
    throw error
  }

  const results: { accountId: string; newBalance: number }[] = []
  
  for (const acc of accounts || []) {
    try {
      const newBalance = await recalculateAccountBalance(acc.id)
      results.push({ accountId: acc.id, newBalance })
    } catch (e) {
      console.warn(`Failed to recalculate balance for account ${acc.id}:`, e)
    }
  }

  await revalidatePath('/data')
  return results
}

export async function getHouseholdAccounts() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Fetch all accounts visible to the user (RLS handles the filtering)
  // We also fetch profile info to know who owns the account
  // Note: This assumes a foreign key relationship exists or can be inferred. 
  // If 'profiles' relationship is not defined in Supabase, this might fail.
  // However, usually user_id references auth.users. profiles usually also references auth.users.
  // We might need to join manually or ensure the FK exists.
  // For now, let's try to fetch just accounts and we can fetch profiles separately if needed, 
  // or assume the UI handles the user_id.
  
  const res = await supabase
    .from('accounts')
    .select('*')
    .order('updated_at', { ascending: false })

  if (res.error) return { success: false, error: res.error.message }
  return { success: true, data: res.data }
}

