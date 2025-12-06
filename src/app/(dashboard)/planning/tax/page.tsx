import React from 'react'
import { createClient as createServerSupabase } from '../../../../lib/supabase/server'
import { getUpcomingTaxEvents, type TaxEventInstance } from '../../../../lib/tax/calendar'
import { getAnnualDeductionSummary, type AnnualDeductionSummary } from '../../../../lib/tax/deduction-scanner'
import TaxPlanningClient from './client'

export default async function TaxPlanningPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  let taxEvents: TaxEventInstance[] = []
  let deductionSummary: AnnualDeductionSummary | null = null
  
  if (user) {
    // Fetch tax events for next 120 days
    const eventsResult = await getUpcomingTaxEvents(user.id, 120)
    taxEvents = eventsResult.events
    
    // Fetch deduction summary for current year
    deductionSummary = await getAnnualDeductionSummary(user.id)
  }
  
  return (
    <TaxPlanningClient 
      initialEvents={taxEvents}
      initialDeductions={deductionSummary}
      userId={user?.id}
    />
  )
}
