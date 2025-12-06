"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { goalSchema, GoalForm } from '../validations/goals'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'

export async function createGoal(form: GoalForm){
  const parsed = goalSchema.parse(form)
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return { success: false, error: 'Not authenticated' }
  let currentAmount = parsed.current_amount || 0
  if(parsed.linked_account_id){
    const acctRes = await supabase.from('accounts').select('balance').eq('id', parsed.linked_account_id).single()
    if(acctRes.error) return { success: false, error: acctRes.error.message }
    currentAmount = Number(acctRes.data?.balance || 0)
  }
  const row = { id: crypto.randomUUID(), user_id: user.id, name: parsed.name, visibility: parsed.visibility, target_amount: parsed.target_amount, current_amount: currentAmount, deadline: parsed.deadline || null, linked_account_id: parsed.linked_account_id || null }
  const res = await supabase.from('goals').insert([row]).select()
  if(res.error) return { success: false, error: res.error.message }
  await revalidatePath('/planning')
  return { success: true, data: res.data }
}

export async function getGoals(userId?: string, view: 'personal' | 'household' = 'personal'){
  const supabase = await createServerSupabase()
  if(!userId){
    const u = await supabase.auth.getUser(); userId = u.data.user?.id
  }
  if(!userId) return { success: false, error: 'userId required' }
  let query = supabase.from('goals').select('*').order('created_at', { ascending: false })
  if (view === 'personal') query = query.eq('user_id', userId)
  const res = await query
  if(res.error) return { success: false, error: res.error.message }
  return { success: true, data: res.data }
}

export async function updateGoal(id: string, form: Partial<GoalForm>){
  const supabase = await createServerSupabase()
  // If linked_account_id provided, update current_amount to match the account balance at the time
  if(form.linked_account_id){
    const acctRes = await supabase.from('accounts').select('balance').eq('id', form.linked_account_id as string).single()
    if(acctRes.error) return { success: false, error: acctRes.error.message }
    form.current_amount = Number(acctRes.data?.balance || 0)
  }
  const res = await supabase.from('goals').update(form as any).eq('id', id).select()
  if(res.error) return { success: false, error: res.error.message }
  await revalidatePath('/planning')
  return { success: true, data: res.data }
}

export async function deleteGoal(id: string){
  const supabase = await createServerSupabase()
  const res = await supabase.from('goals').delete().eq('id', id).select()
  if(res.error) return { success: false, error: res.error.message }
  await revalidatePath('/planning')
  return { success: true, data: res.data }
}

export async function syncGoalsForAccount(accountId: string, balance: number){
  const supabase = await createServerSupabase()
  const res = await supabase.from('goals').update({ current_amount: balance }).eq('linked_account_id', accountId).select()
  if(res.error) return { success: false, error: res.error.message }
  await revalidatePath('/planning')
  return { success: true, data: res.data }
}

export async function unlinkGoalsForAccount(accountId: string){
  const supabase = await createServerSupabase()
  const res = await supabase.from('goals').update({ linked_account_id: null }).eq('linked_account_id', accountId).select()
  if(res.error) return { success: false, error: res.error.message }
  await revalidatePath('/planning')
  return { success: true, data: res.data }
}
