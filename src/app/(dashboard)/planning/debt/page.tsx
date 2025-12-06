import React from 'react'
import { calculateDebtStrategyForUser } from '../../../../lib/actions/planning'
import { createClient as createServerSupabase } from '../../../../lib/supabase/server'
import DebtSimulator from '../../../../components/planning/debt-simulator'
import DebtPageClient from './client'
import type { StrategyResult } from '../../../../lib/planning/debt'

export default async function DebtPlanningPage(){
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return (<div className="p-4">Please sign in to see your debt planning</div>)
  const res = await calculateDebtStrategyForUser(user.id, 0)
  const accountsRes = await supabase.from('accounts').select('id, name, balance, interest_rate, min_payment, type').eq('user_id', user.id).in('type', ['credit_card','loan','mortgage','auto_loan','student_loan'])
  const accounts = (accountsRes.data || [])
  
  const fallbackStrategy: StrategyResult = { months: 0, totalInterestPaid: 0, graphData: [], payoffDate: null }
  let baseline: StrategyResult = fallbackStrategy
  let defaultStrategy: StrategyResult = fallbackStrategy

  if (res?.success) {
    const data = (res as any).data
    if (data) {
      baseline = data.baseline
      defaultStrategy = data.avalanche
    }
  }
  
  return (
    <DebtPageClient 
      accounts={accounts} 
      baseline={baseline} 
      defaultStrategy={defaultStrategy} 
    />
  )
}
