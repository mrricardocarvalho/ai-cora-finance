import { createClient as createServerSupabase } from '../supabase/server'
import getSafeToSpend from './safe-spend'
import { formatCurrency } from '../utils'

export type DebtInsight = {
  type: 'celebration' | 'opportunity' | 'warning' | 'info'
  title: string
  message: string
  actionable?: string
  priority: 'high' | 'medium' | 'low'
  score_impact: number
}

export async function detectDebtInsights(userId: string): Promise<DebtInsight[]> {
  const supabase = await createServerSupabase()
  const insights: DebtInsight[] = []

  // Fetch debts
  const { data: debts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .in('type', ['credit_card', 'loan', 'mortgage', 'auto_loan', 'student_loan'])
    .gt('balance', 0) // Only active debts

  if (!debts || debts.length === 0) return []

  // 1. Opportunity: Surplus to High Interest Debt
  try {
    const safeToSpendResult = await getSafeToSpend(userId)
    if (safeToSpendResult && 'value' in safeToSpendResult) {
      const surplus = safeToSpendResult.value
      // If surplus > 50€ and we have high interest debt (> 5%)
      if (surplus > 50) {
        const highInterestDebts = debts
          .filter(d => (d.interest_rate || 0) > 5)
          .sort((a, b) => (b.interest_rate || 0) - (a.interest_rate || 0))
        
        if (highInterestDebts.length > 0) {
          const targetDebt = highInterestDebts[0]
          const interestSaved = (surplus * (targetDebt.interest_rate || 0) / 100 / 12).toFixed(2)
          
          insights.push({
            type: 'opportunity',
            title: `Accelerate ${targetDebt.name} Payoff`,
            message: `You have ${formatCurrency(surplus)} extra in your Safe-to-Spend. Putting this toward ${targetDebt.name} could save you ~€${interestSaved} in interest this month alone.`,
            actionable: `Make an extra payment of ${formatCurrency(surplus)} to ${targetDebt.name}`,
            priority: 'medium',
            score_impact: 5
          })
        }
      }
    }
  } catch (e) {
    console.warn('Failed to check surplus for debt insight', e)
  }

  // 2. Interest Awareness
  let totalMonthlyInterest = 0
  for (const debt of debts) {
    if (debt.interest_rate && debt.balance) {
      const monthlyInterest = (debt.balance * (debt.interest_rate / 100)) / 12
      totalMonthlyInterest += monthlyInterest
    }
  }

  if (totalMonthlyInterest > 20) {
    insights.push({
      type: 'info',
      title: 'Interest Watch',
      message: `You are currently accruing approximately ${formatCurrency(totalMonthlyInterest)} in interest charges per month across your debts.`,
      actionable: 'Review your debt payoff strategy to minimize interest costs.',
      priority: 'low',
      score_impact: 0
    })
  }

  // 3. Milestone: Paid Off (Need history for this, but can check if balance is very low)
  // Or check if a debt was recently paid off (balance 0 in last 30 days? - hard without history table)
  // We'll skip "Paid Off" event for now unless we track it elsewhere.

  // 4. High Utilization Warning (Credit Cards)
  // Assuming we don't have credit limit, we can't calculate utilization accurately.
  // But if we did, we would add it here.

  return insights
}
