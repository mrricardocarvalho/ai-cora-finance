"use server"
import { getInsights as getInsightsImpl, generateInsights as generateInsightsImpl } from '../intelligence/insights'
import { createClient as createServerSupabase } from '../supabase/server'
import { revalidatePath } from 'next/cache'

export async function getInsights(userId: string, view: 'personal' | 'household' = 'personal'){
  return await getInsightsImpl(userId, view)
}

export async function generateInsights(userId: string){
  return await generateInsightsImpl(userId)
}

export type ActionResult = { success: boolean; data?: unknown; error?: string }
export async function dismissInsight(id: string): Promise<ActionResult> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return { success: false, error: 'Not authenticated' }
  const res = await supabase.from('insights').update({ status: 'dismissed' }).eq('id', id).eq('user_id', user.id).select()
  await revalidatePath('/')
  if(res.error) return { success: false, error: res.error.message }
  return { success: true, data: res.data }
}

export async function actInsight(id: string): Promise<ActionResult> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return { success: false, error: 'Not authenticated' }
  const res = await supabase.from('insights').update({ status: 'acted' }).eq('id', id).eq('user_id', user.id).select()
  await revalidatePath('/')
  if(res.error) return { success: false, error: res.error.message }
  return { success: true, data: res.data }
}

// Named exports only
