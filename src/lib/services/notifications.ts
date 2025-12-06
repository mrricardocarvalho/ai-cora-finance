"use server"
import webpush from 'web-push'
import { createClient as createServerSupabase } from '../supabase/server'

function initVapid(){
  const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if(!publicKey || !privateKey) throw new Error('VAPID keys not configured')
  webpush.setVapidDetails('mailto:admin@corafinance.com', publicKey, privateKey)
}

export async function sendNotificationToUser(userId: string, title: string, body: string, url?: string){
  initVapid()
  const supabase = await createServerSupabase()
  const profile = await supabase.from('profiles').select('push_subscription').eq('id', userId).maybeSingle()
  if(profile.error) throw profile.error
  if(!profile.data) return { success: false, error: 'Profile not found' }
  const sub = profile.data?.push_subscription
  if(!sub) return { success: false, error: 'No push subscription' }
  try{
    await webpush.sendNotification(sub, JSON.stringify({ title, body, url }))
    return { success: true }
  }catch(e: any){
    console.warn('sendNotification failed', e)
    // If subscription is no longer valid (410 Gone or 404 Not Found), remove it from DB
    const code = e?.statusCode || e?.status || null
    if(code === 404 || code === 410){
      try{ await supabase.from('profiles').update({ push_subscription: null }).eq('id', userId) }catch(err){ console.warn('failed to clear push_subscription', err) }
    }
    return { success: false, error: e?.message || String(e) }
  }
}
