'use server'

import { createClient } from '@/lib/supabase/server'

export interface HouseholdMember {
  user_id: string
  role: 'admin' | 'member'
  joined_at: string
  display_name?: string
}

export interface HouseholdSummary {
  household_id: string
  household_name: string
  members: HouseholdMember[]
  combined_metrics: {
    total_net_worth: number
    total_assets: number
    total_liabilities: number
    monthly_income: number
    monthly_expenses: number
    savings_rate: number
    safe_to_spend: number
  }
  shared_goals: {
    id: string
    name: string
    target_amount: number
    current_amount: number
    progress: number
    contributions: { user_id: string; amount: number }[]
    deadline?: string
  }[]
  combined_accounts: {
    id: string
    name: string
    balance: number
    type: string
    owner_id: string
    visibility: string
  }[]
}

export async function getHouseholdSummary(): Promise<HouseholdSummary | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's household
  const { data: membership } = await supabase
    .from('household_members')
    .select(`
      household_id,
      households (
        id,
        name,
        household_members (
          user_id,
          role,
          joined_at
        )
      )
    `)
    .eq('user_id', user.id)
    .single()

  if (!membership?.households) return null

  // Supabase single() returns object but TS infers array - cast properly
  const householdData = membership.households as unknown as {
    id: string
    name: string
    household_members: HouseholdMember[]
  }
  
  if (!householdData?.id) return null
  
  const memberIds = householdData.household_members.map(m => m.user_id)

  // Get shared + personal accounts for household members
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, name, balance, type, user_id, visibility')
    .in('user_id', memberIds)
    .or('visibility.eq.shared,visibility.eq.household')
  
  const householdAccounts = accounts || []

  // Calculate combined metrics
  const assetTypes = ['checking', 'savings', 'investment', 'brokerage']
  const liabilityTypes = ['credit_card', 'loan', 'mortgage']

  const totalAssets = householdAccounts
    .filter(a => assetTypes.includes(a.type))
    .reduce((sum, a) => sum + Number(a.balance), 0)

  const totalLiabilities = householdAccounts
    .filter(a => liabilityTypes.includes(a.type))
    .reduce((sum, a) => sum + Math.abs(Number(a.balance)), 0)

  // Get monthly summaries for all household members
  const currentMonth = new Date()
  currentMonth.setDate(1)
  currentMonth.setHours(0, 0, 0, 0)

  const { data: monthlySummaries } = await supabase
    .from('monthly_summaries')
    .select('user_id, total_in, total_out, savings_rate')
    .in('user_id', memberIds)
    .gte('month', currentMonth.toISOString())

  const summaries = monthlySummaries || []
  const monthlyIncome = summaries.reduce((sum, s) => sum + Number(s.total_in || 0), 0)
  const monthlyExpenses = summaries.reduce((sum, s) => sum + Number(s.total_out || 0), 0)
  const avgSavingsRate = summaries.length > 0
    ? summaries.reduce((sum, s) => sum + Number(s.savings_rate || 0), 0) / summaries.length
    : 0

  // Get shared goals with visibility = 'shared' for household members
  const { data: sharedGoals } = await supabase
    .from('goals')
    .select('id, name, target_amount, current_amount, deadline, user_id')
    .in('user_id', memberIds)
    .eq('visibility', 'shared')

  const goals = (sharedGoals || []).map(g => ({
    id: g.id,
    name: g.name,
    target_amount: Number(g.target_amount),
    current_amount: Number(g.current_amount),
    progress: Number(g.target_amount) > 0 
      ? Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100)
      : 0,
    contributions: [{ user_id: g.user_id, amount: Number(g.current_amount) }], // Simplified
    deadline: g.deadline
  }))

  // Calculate safe-to-spend (simplified)
  const safeToSpend = Math.max(0, monthlyIncome - monthlyExpenses)

  return {
    household_id: householdData.id,
    household_name: householdData.name,
    members: householdData.household_members,
    combined_metrics: {
      total_net_worth: totalAssets - totalLiabilities,
      total_assets: totalAssets,
      total_liabilities: totalLiabilities,
      monthly_income: monthlyIncome,
      monthly_expenses: monthlyExpenses,
      savings_rate: avgSavingsRate,
      safe_to_spend: safeToSpend
    },
    shared_goals: goals,
    combined_accounts: householdAccounts.map(a => ({
      id: a.id,
      name: a.name,
      balance: Number(a.balance),
      type: a.type,
      owner_id: a.user_id,
      visibility: a.visibility || 'personal'
    }))
  }
}
