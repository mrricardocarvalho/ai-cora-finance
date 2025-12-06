"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { notificationPreferencesSchema, NotificationPreferences } from '../validations/notifications'
import { revalidatePath } from 'next/cache'

export async function updateNotificationPreferences(prefs: NotificationPreferences) {
  const parsed = notificationPreferencesSchema.parse(prefs)
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return { success: false, error: 'Not authenticated' }
  const res = await supabase.from('profiles').update({ notification_preferences: parsed }).eq('id', user.id).select()
  if(res.error) return { success: false, error: res.error.message }
  await revalidatePath('/settings')
  return { success: true, data: res.data }
}

export async function getNotificationPreferences(){
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return { success: false, error: 'Not authenticated' }
  const res = await supabase.from('profiles').select('notification_preferences').eq('id', user.id).limit(1).maybeSingle()
  if(res.error) return { success: false, error: res.error.message }
  return { success: true, data: res.data?.notification_preferences }
}
