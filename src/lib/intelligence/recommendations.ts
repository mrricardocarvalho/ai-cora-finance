import { createClient } from '../supabase/server'
import crypto from 'crypto'
import { addMonths } from 'date-fns'

export type Recommendation = {
  id: string
  type: string
  title: string
  description: string
  priority: 'urgent' | 'important' | 'optimization'
  action_link?: string
  impact_score: number
  status: 'active' | 'completed' | 'dismissed' | 'snoozed'
}

export async function generateRecommendations(userId: string) {
  const supabase = await createClient()
  
  // 1. Fetch User State
  const { data: accounts } = await supabase.from('accounts').select('*').eq('user_id', userId)
  const { data: goals } = await supabase.from('goals').select('*').eq('user_id', userId)
  const { data: existing } = await supabase.from('recommendations')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'completed') // Don't regenerate completed ones immediately (maybe cooldown?)
  
  if (!accounts) return { success: false }

  const recommendations: Omit<Recommendation, 'id' | 'status'>[] = []

  // Helper to check if recommendation exists (active or snoozed)
  const hasRec = (type: string) => existing?.some(r => r.type === type && (r.status === 'active' || (r.status === 'snoozed' && new Date(r.snoozed_until!) > new Date())))

  // 2. Analyze State

  // A. Emergency Fund
  // Heuristic: Do we have a goal named "Emergency Fund"? Or savings > 1000?
  const emergencyGoal = goals?.find(g => g.name.toLowerCase().includes('emergency'))
  const savingsBalance = accounts.filter(a => a.type === 'savings').reduce((sum, a) => sum + Number(a.balance), 0)
  
  if (!emergencyGoal && savingsBalance < 1000) {
    if (!hasRec('emergency_fund_start')) {
      recommendations.push({
        type: 'emergency_fund_start',
        title: 'Build an Emergency Fund',
        description: 'Start by saving €1,000 for unexpected expenses. This prevents you from going into debt when life happens.',
        priority: 'urgent',
        action_link: '/goals/new?template=emergency',
        impact_score: 10
      })
    }
  } else if (emergencyGoal && Number(emergencyGoal.current_amount) < Number(emergencyGoal.target_amount)) {
    // Check progress
    const progress = Number(emergencyGoal.current_amount) / Number(emergencyGoal.target_amount)
    if (progress < 0.5 && !hasRec('emergency_fund_boost')) {
      recommendations.push({
        type: 'emergency_fund_boost',
        title: 'Boost Your Safety Net',
        description: `You're ${(progress * 100).toFixed(0)}% of the way to your emergency fund. Keep going!`,
        priority: 'important',
        action_link: `/goals/${emergencyGoal.id}`,
        impact_score: 8
      })
    }
  }

  // B. High Interest Debt
  const highInterestDebt = accounts.filter(a => (a.type === 'credit_card' || a.type === 'loan') && Number(a.interest_rate) > 10 && Number(a.balance) > 0)
  if (highInterestDebt.length > 0) {
    if (!hasRec('debt_payoff_high')) {
      recommendations.push({
        type: 'debt_payoff_high',
        title: 'Attack High-Interest Debt',
        description: `You have ${highInterestDebt.length} accounts with interest > 10%. Paying these off is your best guaranteed return.`,
        priority: 'urgent',
        action_link: '/planning/debt',
        impact_score: 9
      })
    }
  }

  // C. Investing
  const investmentAccounts = accounts.filter(a => a.type === 'broker')
  if (investmentAccounts.length === 0 && savingsBalance > 5000 && highInterestDebt.length === 0) {
    if (!hasRec('investing_start')) {
      recommendations.push({
        type: 'investing_start',
        title: 'Start Investing',
        description: 'You have a solid cash cushion and no high-interest debt. It\'s time to make your money grow.',
        priority: 'important',
        action_link: '/portfolio',
        impact_score: 7
      })
    }
  }

  // D. Optimization (Tax Loss Harvesting - check if opportunity exists)
  // We can query insights for 'opportunity' type related to tax
  const { data: taxOpp } = await supabase.from('insights')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'opportunity')
    .ilike('title', '%tax%')
    .eq('status', 'new')
    .limit(1)
  
  if (taxOpp && taxOpp.length > 0) {
    if (!hasRec('tax_harvesting')) {
      recommendations.push({
        type: 'tax_harvesting',
        title: 'Optimize Taxes',
        description: 'You have tax-loss harvesting opportunities available. Review them to save on your tax bill.',
        priority: 'optimization',
        action_link: '/portfolio',
        impact_score: 5
      })
    }
  }

  // 3. Save Recommendations
  const created = []
  for (const rec of recommendations) {
    const { error } = await supabase.from('recommendations').insert([{
      id: crypto.randomUUID(),
      user_id: userId,
      ...rec,
      status: 'active'
    }])
    if (!error) created.push(rec)
  }

  return { success: true, created }
}

export async function getRecommendations(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('recommendations')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active'])
    .order('impact_score', { ascending: false }) // Priority by impact
  
  return { success: true, data }
}

export async function updateRecommendationStatus(id: string, status: 'completed' | 'dismissed' | 'snoozed') {
  const supabase = await createClient()
  const updates: any = { status, updated_at: new Date().toISOString() }
  
  if (status === 'snoozed') {
    updates.snoozed_until = addMonths(new Date(), 1).toISOString()
  }

  const { error } = await supabase.from('recommendations').update(updates).eq('id', id)
  return { success: !error }
}
