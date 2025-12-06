"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { getPortfolioData } from './portfolio'
import { getGoals } from './goals'

export async function getFinancialSummary(userId: string, view: 'personal' | 'household' = 'personal') {
  if (!userId) return { success: false, error: 'userId required' }
  
  const supabase = await createServerSupabase()
  
  // Get portfolio summary
  let portfolioSummary = null
  try {
    const portfolioRes = await getPortfolioData(userId, view)
    if (portfolioRes.success && portfolioRes.data) {
      const { totals } = portfolioRes.data
      portfolioSummary = {
        totalValue: totals.totalValue,
        totalUnrealized: totals.totalUnrealized,
        totalReturnPercent: totals.totalReturnPercent
      }
    }
  } catch (e) {
    console.warn('getPortfolioData failed:', e)
  }
  
  // Get goals summary
  let goalsSummary = null
  try {
    const goalsRes = await getGoals(userId, view)
    if (goalsRes.success && goalsRes.data && goalsRes.data.length > 0) {
      const goals = goalsRes.data as Array<{ target_amount: number; current_amount: number }>
      const total = goals.length
      const onTrack = goals.filter(g => {
        const progress = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0
        return progress >= 25 // Consider "on track" if at least 25% done
      }).length
      const totalProgress = goals.reduce((sum, g) => {
        const progress = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0
        return sum + Math.min(progress, 100)
      }, 0) / total
      
      goalsSummary = { total, onTrack, totalProgress }
    }
  } catch (e) {
    console.warn('getGoals failed:', e)
  }
  
  // Get debt summary
  let debtSummary = null
  try {
    let debtQuery = supabase
      .from('accounts')
      .select('balance, min_payment')
      .in('type', ['credit_card', 'loan', 'mortgage', 'auto_loan', 'student_loan'])
    
    if (view === 'personal') {
      debtQuery = debtQuery.eq('user_id', userId)
    }
    
    const debtRes = await debtQuery
    
    if (debtRes.data && debtRes.data.length > 0) {
      const debts = debtRes.data as Array<{ balance: number; min_payment: number | null }>
      const totalOwed = debts.reduce((sum, d) => sum + Number(d.balance || 0), 0)
      const monthlyPayment = debts.reduce((sum, d) => sum + Number(d.min_payment || 0), 0)
      
      if (totalOwed !== 0) {
        debtSummary = { totalOwed, monthlyPayment }
      }
    }
  } catch (e) {
    console.warn('getDebt failed:', e)
  }
  
  return {
    success: true,
    data: {
      portfolio: portfolioSummary,
      goals: goalsSummary,
      debt: debtSummary
    }
  }
}
