"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { generateInsights } from '../intelligence/insights'
import { revalidatePath } from 'next/cache'

export async function updateProfile(userId: string, updates: { comfort_floor?: number; email?: string; push_subscription?: any }){
  if(!userId) throw new Error('userId required')
  const supabase = await createServerSupabase()
  const existing = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if(existing.error) throw existing.error
  
  // If profile doesn't exist, create it
  if (!existing.data) {
    const insertRes = await supabase.from('profiles').insert({
      id: userId,
      ...updates,
      comfort_floor: updates.comfort_floor ?? 500
    }).select()
    if(insertRes.error) throw insertRes.error
    await revalidatePath('/')
    return insertRes.data
  }
  
  const prevFloor = Number(existing.data?.comfort_floor || 0)
  const res = await supabase.from('profiles').update(updates).eq('id', userId).select()
  if(res.error) throw res.error
  // If comfort floor changed, regenerate insights
  if(updates && updates.comfort_floor !== undefined && updates.comfort_floor !== prevFloor){
    try{ await generateInsights(userId) }catch(e){ console.warn('generateInsights failed:', e) }
  }
  await revalidatePath('/')
  return res.data
}
