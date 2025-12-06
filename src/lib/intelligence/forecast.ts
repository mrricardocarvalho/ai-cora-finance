"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { addDays, format, startOfDay, subMonths, differenceInMonths } from 'date-fns'

// AC #3: Data structures for forecast
export interface ForecastEvent {
  type: 'income' | 'expense'
  description: string
  amount: number
  source: 'recurring' | 'predicted' | 'hypothetical'
}

export interface ForecastDay {
  date: string // ISO date YYYY-MM-DD
  projectedBalance: number
  events: ForecastEvent[]
  confidence: 'high' | 'medium' | 'low'
}

export interface CashFlowForecast {
  success: boolean
  days: ForecastDay[]
  startingBalance: number
  comfortFloor: number
  floorCrossingDate: string | null
  daysUntilFloor: number | null
  confidence: 'high' | 'medium' | 'low'
  error?: string
}

export interface WhatIfScenario {
  amount: number // negative for expense, positive for income
  date: string // ISO date
  description: string
}

// AC #5: Calculate confidence based on data quality
function calculateConfidence(dataMonths: number): 'high' | 'medium' | 'low' {
  if (dataMonths >= 6) return 'high'
  if (dataMonths >= 3) return 'medium'
  return 'low'
}

// Get the day of month for recurring patterns
function extractDayOfMonth(dateStr: string | null): number {
  if (!dateStr) return 15 // default mid-month
  const date = new Date(dateStr)
  return date.getDate()
}

// AC #1 & #2: Main forecast calculation
export async function calculateCashFlowForecast(
  userId: string,
  days: number = 30,
  whatIfScenarios: WhatIfScenario[] = []
): Promise<CashFlowForecast> {
  if (!userId) {
    return { 
      success: false, 
      days: [], 
      startingBalance: 0, 
      comfortFloor: 0, 
      floorCrossingDate: null, 
      daysUntilFloor: null,
      confidence: 'low',
      error: 'userId required' 
    }
  }

  const supabase = await createServerSupabase()
  const now = startOfDay(new Date())

  // Get current liquid assets (checking + savings)
  const accRes = await supabase
    .from('accounts')
    .select('balance')
    .eq('user_id', userId)
    .in('type', ['checking', 'savings'])
  
  type AccountRow = { balance: string | number }
  const startingBalance = (accRes.data || []).reduce(
    (sum: number, a: AccountRow) => sum + Number(a.balance || 0), 
    0
  )

  // Get comfort floor from profile
  const profileRes = await supabase
    .from('profiles')
    .select('comfort_floor')
    .eq('id', userId)
    .maybeSingle()
  
  const comfortFloor = Number(profileRes.data?.comfort_floor ?? 500)

  // AC #1: Get recurring patterns for expenses
  const recurringRes = await supabase
    .from('recurring_patterns')
    .select('merchant_name, amount, next_date, frequency, last_date')
    .eq('user_id', userId)
    .eq('is_active', true)
  
  type RecurringRow = { 
    merchant_name: string
    amount: number | string
    next_date: string | null
    frequency: string
    last_date: string | null
  }
  const recurringExpenses = (recurringRes.data || []) as RecurringRow[]

  // AC #2: Detect income patterns from transaction history
  const sixMonthsAgo = subMonths(now, 6).toISOString()
  const incomeRes = await supabase
    .from('transactions')
    .select('amount, date, description')
    .eq('user_id', userId)
    .gt('amount', 0)
    .gte('date', sixMonthsAgo)
    .order('date', { ascending: true })
  
  type IncomeRow = { amount: number | string; date: string; description: string }
  const incomeTransactions = (incomeRes.data || []) as IncomeRow[]

  // Find recurring income (salary-like patterns)
  const incomeByDayOfMonth: Record<number, { amounts: number[]; lastDate: string; description: string }> = {}
  
  for (const tx of incomeTransactions) {
    const amount = Number(tx.amount)
    if (amount < 100) continue // Skip small deposits
    
    const dayOfMonth = new Date(tx.date).getDate()
    
    if (!incomeByDayOfMonth[dayOfMonth]) {
      incomeByDayOfMonth[dayOfMonth] = { amounts: [], lastDate: tx.date, description: tx.description }
    }
    incomeByDayOfMonth[dayOfMonth].amounts.push(amount)
    incomeByDayOfMonth[dayOfMonth].lastDate = tx.date
  }

  // Identify likely salary (regular income on same day of month)
  const predictedIncome: { dayOfMonth: number; amount: number; description: string }[] = []
  
  for (const [day, data] of Object.entries(incomeByDayOfMonth)) {
    if (data.amounts.length >= 2) { // At least 2 occurrences
      const avgAmount = data.amounts.reduce((s, n) => s + n, 0) / data.amounts.length
      predictedIncome.push({
        dayOfMonth: parseInt(day),
        amount: Math.round(avgAmount * 100) / 100,
        description: data.description || 'Salary'
      })
    }
  }

  // AC #5: Calculate confidence based on data history
  const oldestTxRes = await supabase
    .from('transactions')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: true })
    .limit(1)
  
  let dataMonths = 0
  if (oldestTxRes.data && oldestTxRes.data.length > 0) {
    const oldestDate = new Date(oldestTxRes.data[0].date)
    dataMonths = differenceInMonths(now, oldestDate)
  }
  
  const overallConfidence = calculateConfidence(dataMonths)

  // Build daily forecast
  const forecastDays: ForecastDay[] = []
  let runningBalance = startingBalance
  let floorCrossingDate: string | null = null
  let daysUntilFloor: number | null = null

  for (let i = 0; i <= days; i++) {
    const forecastDate = addDays(now, i)
    const dateStr = format(forecastDate, 'yyyy-MM-dd')
    const dayOfMonth = forecastDate.getDate()
    const events: ForecastEvent[] = []

    // AC #1: Schedule recurring expenses
    for (const pattern of recurringExpenses) {
      const patternDay = extractDayOfMonth(pattern.next_date || pattern.last_date)
      if (patternDay === dayOfMonth) {
        const amount = Math.abs(Number(pattern.amount))
        events.push({
          type: 'expense',
          description: pattern.merchant_name,
          amount: -amount,
          source: 'recurring'
        })
        runningBalance -= amount
      }
    }

    // AC #2: Schedule predicted income
    for (const income of predictedIncome) {
      if (income.dayOfMonth === dayOfMonth) {
        events.push({
          type: 'income',
          description: income.description,
          amount: income.amount,
          source: 'predicted'
        })
        runningBalance += income.amount
      }
    }

    // AC #6: Apply what-if scenarios
    for (const scenario of whatIfScenarios) {
      if (scenario.date === dateStr) {
        events.push({
          type: scenario.amount >= 0 ? 'income' : 'expense',
          description: scenario.description,
          amount: scenario.amount,
          source: 'hypothetical'
        })
        runningBalance += scenario.amount
      }
    }

    // AC #4: Detect floor crossing
    if (floorCrossingDate === null && runningBalance < comfortFloor) {
      floorCrossingDate = dateStr
      daysUntilFloor = i
    }

    forecastDays.push({
      date: dateStr,
      projectedBalance: Math.round(runningBalance * 100) / 100,
      events,
      confidence: overallConfidence
    })
  }

  return {
    success: true,
    days: forecastDays,
    startingBalance: Math.round(startingBalance * 100) / 100,
    comfortFloor,
    floorCrossingDate,
    daysUntilFloor,
    confidence: overallConfidence
  }
}

// AC #4: Generate floor crossing insight
export async function generateFloorCrossingInsight(
  userId: string,
  forecast: CashFlowForecast
): Promise<{ type: 'warning'; title: string; message: string } | null> {
  if (!forecast.floorCrossingDate || forecast.daysUntilFloor === null) {
    return null
  }

  const crossingDate = new Date(forecast.floorCrossingDate)
  const formattedDate = format(crossingDate, 'MMMM d')

  return {
    type: 'warning',
    title: 'Cash Flow Warning',
    message: `At current pace, you'll hit your comfort floor on ${formattedDate} (${forecast.daysUntilFloor} days). Consider reducing discretionary spending or reviewing upcoming bills.`
  }
}

export default calculateCashFlowForecast
