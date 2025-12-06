"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { createAdminSupabase } from '../supabase/admin'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function exportUserData(){
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return { success: false, error: 'Not authenticated' }
  const userId = user.id
  const profileRes = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  const accountsRes = await supabase.from('accounts').select('*').eq('user_id', userId)
  const txRes = await supabase.from('transactions').select('*').eq('user_id', userId)
  const holdingsRes = await supabase.from('holdings').select('*').eq('user_id', userId)
  const invTxRes = await supabase.from('investment_transactions').select('*').eq('user_id', userId)
  const goalsRes = await supabase.from('goals').select('*').eq('user_id', userId)
  // Profile may not exist for new users, don't fail on that
  if(profileRes.error && profileRes.error.code !== 'PGRST116') return { success: false, error: profileRes.error.message }
  return {
    success: true,
    data: {
      profile: profileRes.data || null,
      accounts: accountsRes.data || [],
      transactions: txRes.data || [],
      holdings: holdingsRes.data || [],
      investment_transactions: invTxRes.data || [],
      goals: goalsRes.data || []
    }
  }
}

export async function deleteAccountAndUser(){
  // Delete user using admin role - only server side
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return { success: false, error: 'Not authenticated' }
  const admin = createAdminSupabase()
  try{
    const res = await admin.auth.admin.deleteUser(user.id)
    return { success: true, data: res }
  }catch(e:any){ return { success: false, error: e?.message || 'Failed to delete' } }
}
