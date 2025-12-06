"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz'
import { isAfter, isBefore } from 'date-fns'

export async function evaluateShouldSendNotification(prefs: any = {}, timezone = 'Europe/Lisbon', type: 'urgent'|'opportunities'|'weekly_summary', nowDate?: Date){
  const prefsObj = prefs || {}
  // mapping defaults aligned with schema defaults
  const mapping: Record<string, boolean> = { urgent: true, opportunities: true, weekly_summary: false }
  const enabled = typeof prefsObj[type] === 'boolean' ? prefsObj[type] : (mapping[type] || false)
  if(!enabled) return false
  // check quiet hours
  if(prefsObj.quiet_hours_enabled){
    const nowUtc = nowDate || new Date()
    const nowLocal = utcToZonedTime(nowUtc, timezone)
    const [startH, startM] = (prefsObj.quiet_hours_start || '22:00').split(':').map((s:string)=>Number(s))
    const [endH, endM] = (prefsObj.quiet_hours_end || '08:00').split(':').map((s:string)=>Number(s))
    const todayStartLocal = new Date(nowLocal)
    todayStartLocal.setHours(startH, startM, 0, 0)
    const todayEndLocal = new Date(nowLocal)
    todayEndLocal.setHours(endH, endM, 0, 0)
    const inQuiet = (startH > endH) ? (nowLocal >= todayStartLocal || nowLocal <= todayEndLocal) : (nowLocal >= todayStartLocal && nowLocal <= todayEndLocal)
    if(inQuiet) return false
  }
  return true
}

export async function shouldSendNotification(userId: string, type: 'urgent'|'opportunities'|'weekly_summary'){
  if(!userId) return false
  const supabase = await createServerSupabase()
  const res = await supabase.from('profiles').select('notification_preferences, timezone').eq('id', userId).maybeSingle()
  if(res.error || !res.data) return false
  const prefs = res.data?.notification_preferences || {}
  const timezone = res.data?.timezone || 'Europe/Lisbon'
  return evaluateShouldSendNotification(prefs, timezone, type)
}
