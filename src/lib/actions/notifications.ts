"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { sendNotificationToUser } from '../services/notifications'
import { revalidatePath } from 'next/cache'

export async function sendNotification(userId: string, title: string, body: string, url?: string){
  if(!userId) return { success: false, error: 'userId required' }
  const res = await sendNotificationToUser(userId, title, body, url)
  await revalidatePath('/')
  return res
}
