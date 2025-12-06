"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { startOfMonth, endOfMonth } from 'date-fns'
import { revalidatePath } from 'next/cache'

export async function recalculateMonthlySummary(userId: string, monthIso: string) {
  if(!userId) return { success: false, error: 'userId required' }
  const supabase = await createServerSupabase()
  const monthDate = new Date(monthIso)
  const start = startOfMonth(monthDate).toISOString()
  const end = endOfMonth(monthDate).toISOString()
  // Sum incomes and outflows for the user in that month
  const res = await supabase.from('transactions').select('amount').eq('user_id', userId).gte('date', start).lte('date', end)
  if(res.error) return { success: false, error: res.error.message }
  type TxRow = { amount: number | string }
  const txs = (res.data || []) as TxRow[]
  let total_in = 0
  let total_out = 0
  for(const t of txs){
    const amt = Number(t.amount || 0)
    if(amt >= 0) total_in += amt
    else total_out += Math.abs(amt)
  }
  const roundTwo = (v:number) => Math.round((v + Number.EPSILON) * 100) / 100
  total_in = roundTwo(total_in)
  total_out = roundTwo(total_out)
  const savings_rate_unrounded = total_in === 0 ? 0 : ((total_in - total_out) / total_in) * 100
  const savings_rate = roundTwo(savings_rate_unrounded)
  // Upsert monthly_summaries
  const insertRes = await supabase.from('monthly_summaries').upsert([{ user_id: userId, month: start, total_in, total_out, savings_rate }], { onConflict: 'user_id,month' }).select()
  if(insertRes.error) return { success: false, error: insertRes.error.message }
  await revalidatePath('/')
  return { success: true, data: insertRes.data }
}

export async function getMonthlySummary(userId: string, monthIso: string) {
  if(!userId) return { success: false, error: 'userId required' }
  const supabase = await createServerSupabase()
  const start = startOfMonth(new Date(monthIso)).toISOString()
  const res = await supabase.from('monthly_summaries').select('*').eq('user_id', userId).eq('month', start).limit(1)
  if(res.error) return { success: false, error: res.error.message }
  return { success: true, data: res.data?.[0] }
}

export async function getQuickStats(userId: string, view: 'personal' | 'household' = 'personal') {
  if(!userId) return { success: false, error: 'userId required' }
  const supabase = await createServerSupabase()
  // Net worth: sum accounts balances
  let accQuery = supabase.from('accounts').select('balance')
  if (view === 'personal') accQuery = accQuery.eq('user_id', userId)
  const acc = await accQuery
  if(acc.error) return { success: false, error: acc.error.message }
  type AccountRow = { balance: number | string }
  const balances = (acc.data || []).map((a:AccountRow)=>Number(a.balance || 0))
  const netWorth = balances.reduce((s,n)=>s+n, 0)
  // This month: total_out
  const now = new Date()
  const start = startOfMonth(now).toISOString()
  let thisMonthQuery = supabase.from('monthly_summaries').select('*').eq('month', start)
  if (view === 'personal') thisMonthQuery = thisMonthQuery.eq('user_id', userId)
  const resThis = await thisMonthQuery
  
  const thisMonthData = resThis.data || []
  const thisMonth = {
    total_in: thisMonthData.reduce((s, r) => s + Number(r.total_in || 0), 0),
    total_out: thisMonthData.reduce((s, r) => s + Number(r.total_out || 0), 0),
    savings_rate: 0
  }
  thisMonth.savings_rate = thisMonth.total_in === 0 ? 0 : ((thisMonth.total_in - thisMonth.total_out) / thisMonth.total_in) * 100

  // Last month
  const prev = new Date(now.getFullYear(), now.getMonth()-1, 1)
  const prevStart = startOfMonth(prev).toISOString()
  let prevMonthQuery = supabase.from('monthly_summaries').select('*').eq('month', prevStart)
  if (view === 'personal') prevMonthQuery = prevMonthQuery.eq('user_id', userId)
  const resPrev = await prevMonthQuery
  
  const prevMonthData = resPrev.data || []
  const prevMonth = {
    total_in: prevMonthData.reduce((s, r) => s + Number(r.total_in || 0), 0),
    total_out: prevMonthData.reduce((s, r) => s + Number(r.total_out || 0), 0),
  }

  const trend = prevMonth.total_out ? ((Number(thisMonth.total_out) - Number(prevMonth.total_out)) / Math.abs(Number(prevMonth.total_out))) * 100 : 0
  return {
    success: true,
    data: {
      netWorth,
      thisMonth: { total_out: Number(thisMonth.total_out || 0), total_in: Number(thisMonth.total_in || 0) },
      lastMonth: { total_out: Number(prevMonth.total_out || 0), total_in: Number(prevMonth.total_in || 0) },
      savingsRate: Number(thisMonth.savings_rate || 0),
      spendingTrendPercent: trend
    }
  }
}

// Named exports only (no default export in use server files)
