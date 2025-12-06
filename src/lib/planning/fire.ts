"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { getPortfolioData } from '../actions/portfolio'
import { computeFIREProjection } from './fire-utils'
import { startOfDay } from 'date-fns'

export type FIREProjectionResult = {
  currentNetWorth: number
  currentInvestments: number
  fiNumber: number
  annualSavings: number
  yearsToFI: number | null
  retirementDate: string | null
  series: { year: number; date: string; netWorth: number }[]
}

export async function calculateFIREProjection(userId: string, monthlySavingsOverride?: number, growthRate = 0.07, withdrawalRate = 0.04, avgMonthlyExpenseOverride?: number){
  if(!userId) return { success: false, error: 'userId required' }
  const supabase = await createServerSupabase()
  // holdings total via portfolio helper
  const pf = await getPortfolioData(userId)
  const holdingsValue = pf?.success ? pf.data?.totals?.totalValue || 0 : 0
  // accounts balances
  const accRes = await supabase.from('accounts').select('balance, type').eq('user_id', userId)
  if(accRes.error) return { success: false, error: accRes.error.message }
  const balances = (accRes.data || []).map((r:any)=> Number(r.balance || 0))
  const accountsTotal = balances.reduce((s,n)=> s + n, 0)

  const netWorth = Math.round((holdingsValue + accountsTotal) * 100) / 100
  const currentInvestments = Math.round(holdingsValue * 100) / 100

  // monthly summaries to get avg monthly savings and expenses
  const msRes = await supabase.from('monthly_summaries').select('total_in, total_out').eq('user_id', userId).order('month', { ascending: false }).limit(6)
  if(msRes.error) return { success: false, error: msRes.error.message }
  const rows = (msRes.data || []) as any[]
  const monthsToUse = rows.slice(0, Math.min(3, rows.length))
  let avgMonthlySavings = 0
  let avgMonthlyExpense = 0
  if(monthsToUse.length > 0){
    const sumSavings = monthsToUse.reduce((s, r) => s + (Number(r.total_in || 0) - Number(r.total_out || 0)), 0)
    const sumOut = monthsToUse.reduce((s, r) => s + Number(r.total_out || 0), 0)
    avgMonthlySavings = Math.round((sumSavings / monthsToUse.length) * 100) / 100
    avgMonthlyExpense = Math.round((sumOut / monthsToUse.length) * 100) / 100
  }
  // fallback: use 0 if no data
  // override monthlySavings if provided
  const monthlySavings = (typeof monthlySavingsOverride === 'number') ? monthlySavingsOverride : avgMonthlySavings
  const annualSavings = Math.round(monthlySavings * 12 * 100) / 100

  // FI Number: annual expenses * 25
  const fiNumber = Math.round((avgMonthlyExpense * 12 * 25) * 100) / 100

  // compute projection via helper
  const avgExpenseFinal = typeof avgMonthlyExpenseOverride === 'number' && avgMonthlyExpenseOverride > 0 ? avgMonthlyExpenseOverride : avgMonthlyExpense
  const projection = computeFIREProjection(netWorth, avgExpenseFinal, annualSavings, growthRate, withdrawalRate)
  return { success: true, data: { ...projection, currentInvestments } }
}

export default calculateFIREProjection
