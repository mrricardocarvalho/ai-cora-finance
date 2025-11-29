'use server'
import { createClient as createServerSupabase } from '../supabase/server'
import { accountSchema, AccountForm } from '../validations/accounts'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function createAccount(form: AccountForm) {
  const parsed = accountSchema.parse(form)
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const res = await supabase.from('accounts').insert([{ id: crypto.randomUUID(), user_id: user.id, ...parsed }]).select()
  await revalidatePath('/data')
  return res.data
}

export async function updateAccount(id: string, form: AccountForm) {
  const parsed = accountSchema.parse(form)
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const res = await supabase.from('accounts').update(parsed).eq('id', id).select()
  await revalidatePath('/data')
  return res.data
}

export async function deleteAccount(id: string) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const res = await supabase.from('accounts').delete().eq('id', id).select()
  await revalidatePath('/data')
  return res.data
}
