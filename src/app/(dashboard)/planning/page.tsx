import React from 'react'
import EmergencyFundWidget from '../../../components/planning/emergency-fund-widget'
import ClientFIRESim from '../../../components/planning/client-fire-sim'
import { calculateEmergencyTargetForUser } from '../../../lib/actions/planning'
import { createClient as createServerSupabase } from '../../../lib/supabase/server'
import { PlanningHeader, FireProjectionHeader } from '../../../components/shared/PageHeader'
import PlanningNavCards from '../../../components/planning/PlanningNavCards'

export default async function PlanningPage(){
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  const initial = user ? (await calculateEmergencyTargetForUser(user.id, 3)).data : undefined
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <PlanningHeader />

      {/* Quick Navigation Cards */}
      <PlanningNavCards />

      {/* Planning Widgets - Stack vertically for better split-screen experience */}
      <section className="space-y-4">
        {/* Emergency Fund Widget */}
        <EmergencyFundWidget initial={initial} />
        
        {/* FIRE Simulator */}
        <div className="p-4 sm:p-5 bg-surface border border-[var(--border)] rounded-xl shadow-card">
          <FireProjectionHeader />
          <ClientFIRESim />
        </div>
      </section>
    </div>
  )
}
