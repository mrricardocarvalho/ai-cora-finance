"use server"

import { createClient } from '../supabase/server'
import { startOfMonth } from 'date-fns'

export interface HealthScoreResult {
  score: number // 0-100
  status: 'excellent' | 'good' | 'fair' | 'poor'
  factors: {
    name: string
    score: number // 0-100 contribution
    weight: number // percentage weight
    status: 'positive' | 'neutral' | 'negative'
    description: string
  }[]
  trend: 'up' | 'down' | 'stable'
  lastMonthScore?: number
}

interface FinancialData {
  netWorth: number
  liquidAssets: number
  totalDebt: number
  comfortFloor: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsRate: number
  recurringBills: number
  emergencyFundMonths: number
}

async function getFinancialData(userId: string): Promise<FinancialData> {
  const supabase = await createClient()
  const now = new Date()
  const monthStart = startOfMonth(now)
  
  // Get accounts
  const { data: accounts } = await supabase
    .from('accounts')
    .select('type, balance')
    .eq('user_id', userId)
  
  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('comfort_floor')
    .eq('id', userId)
    .single()
  
  // Get this month's summary
  const { data: monthlySummary } = await supabase
    .from('monthly_summaries')
    .select('total_in, total_out, savings_rate')
    .eq('user_id', userId)
    .eq('month', monthStart.toISOString())
    .single()
  
  // Get recurring patterns
  const { data: recurringPatterns } = await supabase
    .from('recurring_patterns')
    .select('amount')
    .eq('user_id', userId)
    .eq('is_active', true)
  
  // Calculate totals
  const accountList = accounts || []
  let liquidAssets = 0
  let totalDebt = 0
  
  for (const acc of accountList) {
    const balance = Number(acc.balance || 0)
    if (acc.type === 'checking' || acc.type === 'savings') {
      liquidAssets += balance
    } else if (acc.type === 'credit_card' || acc.type === 'loan') {
      totalDebt += Math.abs(balance)
    }
  }
  
  const netWorth = liquidAssets - totalDebt
  const comfortFloor = Number(profile?.comfort_floor || 0)
  const monthlyIncome = Number(monthlySummary?.total_in || 0)
  const monthlyExpenses = Number(monthlySummary?.total_out || 0)
  const savingsRate = Number(monthlySummary?.savings_rate || 0)
  
  const recurringBills = (recurringPatterns || []).reduce(
    (sum, r) => sum + Math.abs(Number(r.amount || 0)),
    0
  )
  
  // Emergency fund = how many months of expenses could be covered
  const avgMonthlyExpenses = monthlyExpenses || recurringBills || 1
  const emergencyFundMonths = liquidAssets / avgMonthlyExpenses
  
  return {
    netWorth,
    liquidAssets,
    totalDebt,
    comfortFloor,
    monthlyIncome,
    monthlyExpenses,
    savingsRate,
    recurringBills,
    emergencyFundMonths
  }
}

function calculateScore(data: FinancialData): HealthScoreResult {
  const factors: HealthScoreResult['factors'] = []
  
  // Factor 1: Savings Rate (25% weight)
  // Target: 20%+ is excellent, 10-20% is good, 0-10% is fair, negative is poor
  let savingsScore = 0
  let savingsStatus: 'positive' | 'neutral' | 'negative' = 'neutral'
  let savingsDesc = ''
  
  if (data.savingsRate >= 20) {
    savingsScore = 100
    savingsStatus = 'positive'
    savingsDesc = `Excelente! A poupar ${data.savingsRate.toFixed(0)}% do rendimento.`
  } else if (data.savingsRate >= 10) {
    savingsScore = 70
    savingsStatus = 'positive'
    savingsDesc = `Bom! A poupar ${data.savingsRate.toFixed(0)}% do rendimento.`
  } else if (data.savingsRate >= 0) {
    savingsScore = 40
    savingsStatus = 'neutral'
    savingsDesc = `A poupar ${data.savingsRate.toFixed(0)}%. Tenta chegar aos 20%.`
  } else {
    savingsScore = 10
    savingsStatus = 'negative'
    savingsDesc = 'A gastar mais do que ganha este mês.'
  }
  
  factors.push({
    name: 'Taxa de Poupança',
    score: savingsScore,
    weight: 25,
    status: savingsStatus,
    description: savingsDesc
  })
  
  // Factor 2: Comfort Floor Buffer (25% weight)
  // How much above the comfort floor?
  const bufferAboveFloor = data.liquidAssets - data.comfortFloor
  const bufferPercent = data.comfortFloor > 0 ? (bufferAboveFloor / data.comfortFloor) * 100 : 100
  
  let bufferScore = 0
  let bufferStatus: 'positive' | 'neutral' | 'negative' = 'neutral'
  let bufferDesc = ''
  
  if (data.comfortFloor <= 0) {
    bufferScore = 50
    bufferStatus = 'neutral'
    bufferDesc = 'Define um Comfort Floor nas definições.'
  } else if (bufferAboveFloor < 0) {
    bufferScore = 0
    bufferStatus = 'negative'
    bufferDesc = 'Abaixo do Comfort Floor!'
  } else if (bufferPercent >= 50) {
    bufferScore = 100
    bufferStatus = 'positive'
    bufferDesc = 'Muito acima do Comfort Floor.'
  } else if (bufferPercent >= 20) {
    bufferScore = 70
    bufferStatus = 'positive'
    bufferDesc = 'Buffer saudável acima do Comfort Floor.'
  } else {
    bufferScore = 40
    bufferStatus = 'neutral'
    bufferDesc = 'Perto do Comfort Floor. Cuidado!'
  }
  
  factors.push({
    name: 'Buffer de Segurança',
    score: bufferScore,
    weight: 25,
    status: bufferStatus,
    description: bufferDesc
  })
  
  // Factor 3: Emergency Fund (25% weight)
  // Target: 6 months is excellent, 3 months is good, 1 month is fair
  let emergencyScore = 0
  let emergencyStatus: 'positive' | 'neutral' | 'negative' = 'neutral'
  let emergencyDesc = ''
  
  if (data.emergencyFundMonths >= 6) {
    emergencyScore = 100
    emergencyStatus = 'positive'
    emergencyDesc = `${data.emergencyFundMonths.toFixed(1)} meses de despesas em reserva.`
  } else if (data.emergencyFundMonths >= 3) {
    emergencyScore = 70
    emergencyStatus = 'positive'
    emergencyDesc = `${data.emergencyFundMonths.toFixed(1)} meses. O objetivo são 6 meses.`
  } else if (data.emergencyFundMonths >= 1) {
    emergencyScore = 40
    emergencyStatus = 'neutral'
    emergencyDesc = `Apenas ${data.emergencyFundMonths.toFixed(1)} mês de reserva.`
  } else {
    emergencyScore = 10
    emergencyStatus = 'negative'
    emergencyDesc = 'Menos de 1 mês de despesas em reserva.'
  }
  
  factors.push({
    name: 'Fundo de Emergência',
    score: emergencyScore,
    weight: 25,
    status: emergencyStatus,
    description: emergencyDesc
  })
  
  // Factor 4: Debt-to-Income Ratio (25% weight)
  // Target: 0 is excellent, <30% is good, <50% is fair, >50% is poor
  const debtRatio = data.monthlyIncome > 0 
    ? (data.totalDebt / (data.monthlyIncome * 12)) * 100 
    : 0
  
  let debtScore = 0
  let debtStatus: 'positive' | 'neutral' | 'negative' = 'neutral'
  let debtDesc = ''
  
  if (data.totalDebt === 0) {
    debtScore = 100
    debtStatus = 'positive'
    debtDesc = 'Sem dívidas! Excelente.'
  } else if (debtRatio <= 30) {
    debtScore = 80
    debtStatus = 'positive'
    debtDesc = 'Nível de dívida saudável.'
  } else if (debtRatio <= 50) {
    debtScore = 50
    debtStatus = 'neutral'
    debtDesc = 'Dívida moderada. Considera reduzir.'
  } else {
    debtScore = 20
    debtStatus = 'negative'
    debtDesc = 'Dívida elevada. Prioriza a amortização.'
  }
  
  factors.push({
    name: 'Rácio de Dívida',
    score: debtScore,
    weight: 25,
    status: debtStatus,
    description: debtDesc
  })
  
  // Calculate weighted total score
  const totalScore = factors.reduce((sum, f) => sum + (f.score * f.weight / 100), 0)
  const roundedScore = Math.round(totalScore)
  
  // Determine status
  let status: HealthScoreResult['status'] = 'fair'
  if (roundedScore >= 80) status = 'excellent'
  else if (roundedScore >= 60) status = 'good'
  else if (roundedScore >= 40) status = 'fair'
  else status = 'poor'
  
  return {
    score: roundedScore,
    status,
    factors,
    trend: 'stable' // TODO: Compare with last month
  }
}

export async function getHealthScore(userId: string): Promise<{ success: boolean; data?: HealthScoreResult; error?: string }> {
  try {
    const financialData = await getFinancialData(userId)
    const result = calculateScore(financialData)
    return { success: true, data: result }
  } catch (error) {
    console.error('getHealthScore error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
