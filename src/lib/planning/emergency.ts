"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { startOfDay, subMonths } from 'date-fns'
import { computeEmergencyTargetsAndRunway } from './emergency-utils'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function calculateEmergencyTarget(userId: string, months = 3){
  if(!userId) return { success: false, error: 'userId required'}
  const supabase = await createServerSupabase()
  // Fetch up to 6 monthly summaries (latest)
  const res = await supabase.from('monthly_summaries').select('*').eq('user_id', userId).order('month', { ascending: false }).limit(6)
  if(res.error) return { success: false, error: res.error.message }
  const rows = res.data || []
  let avgExpense = 0
  if(rows.length >= 1){
    // Use up to last 3 months average if available
    const useRows = rows.slice(0, Math.min(3, rows.length))
    const sum = useRows.reduce((s:any, r:any)=> s + Number(r.total_out || 0), 0)
    avgExpense = Math.round((sum / useRows.length) * 100) / 100
  } else {
    // Fallback: compute last 30 days of transactions: sum of outflows
    const thirtyDaysAgo = subMonths(new Date(), 1).toISOString()
    const txRes = await supabase.from('transactions').select('amount').eq('user_id', userId).gte('date', thirtyDaysAgo)
    if(txRes.error) return { success: false, error: txRes.error.message }
    const txs = txRes.data || []
    const totalOut = txs.reduce((s:any, t:any)=> { const amt = Number(t.amount || 0); return s + (amt < 0 ? Math.abs(amt) : 0) }, 0)
    if(totalOut > 0) avgExpense = Math.round(totalOut * 100) / 100
    else {
      // last resort: estimate based on recent incomes * 0.8
      const income = txs.reduce((s:any, t:any)=> { const amt = Number(t.amount || 0); return s + (amt > 0 ? amt : 0) }, 0)
      avgExpense = Math.round((income * 0.8) * 100) / 100
    }
  }

  // Liquid cash: sum of checking + savings balances
  const accRes = await supabase.from('accounts').select('balance').eq('user_id', userId).in('type', ['checking','savings'])
  if(accRes.error) return { success: false, error: accRes.error.message }
  const balances = (accRes.data || []).map((a:any)=> Number(a.balance || 0))
  const liquidCash = Math.round(balances.reduce((s,n)=> s + n, 0) * 100) / 100

    const { target, targets, runway } = computeEmergencyTargetsAndRunway(liquidCash, avgExpense, months)

  return { success: true, data: { avgExpense, target, targets, liquidCash, months, runway } }
}

export async function ensureEmergencyWarning(userId: string, avgExpense: number, liquidCash: number){
  if(!userId) return { success: false, error: 'userId required' }
  const supabase = await createServerSupabase()
  const threeMonthTarget = avgExpense * 3
  if(liquidCash >= threeMonthTarget) return { success: true, created: false }
  const runway = avgExpense > 0 ? (liquidCash / avgExpense) : 0
  // Check idempotency, similar to insights generator: same title today
  const title = 'Emergency Fund Low'
  const message = `Emergency Fund Low. You have ${Math.round(runway*10)/10} months of runway.`
  const todayStart = startOfDay(new Date()).toISOString()
  const exists = await supabase.from('insights').select('id').eq('user_id', userId).eq('type', 'warning').eq('title', title).gte('created_at', todayStart).limit(1)
  if(exists.error) return { success: false, error: exists.error.message }
  if(exists.data && exists.data.length > 0) return { success: true, created: false }
  const insert = await supabase.from('insights').insert([{ id: crypto.randomUUID(), user_id: userId, type: 'warning', title, message, action_link: '/planning', score_impact: -5 }])
  if(insert.error) return { success: false, error: insert.error.message }
  try{ const { shouldSendNotification } = await import('../services/notification-guard'); const allowed = await shouldSendNotification(userId, 'opportunities'); if(allowed){ const { sendNotification } = await import('../actions/notifications'); await sendNotification(userId, title, message, '/planning') } }catch(e){ console.warn('send push failed', e) }
  await revalidatePath('/planning')
  return { success: true, created: true }
}
