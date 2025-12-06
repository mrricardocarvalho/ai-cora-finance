import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '../lib/supabase/server'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import BottomNav from '../components/layout/BottomNav'
import CompactInsightList from '../components/insights/CompactInsightList'
import SafeToSpendWidget from '../components/dashboard/SafeToSpendWidget'
import HealthScoreWidget from '../components/dashboard/HealthScoreWidget'
import FinancialSummaryWidget from '../components/dashboard/FinancialSummaryWidget'
import CashFlowForecastChart from '../components/dashboard/CashFlowForecastChart'
import { RootHomeGreeting, RootOverviewHeader, RootRecentInsightsHeader, ViewDetailsLink } from '../components/shared/PageHeader'
import { fetchSafeToSpend } from '../lib/actions/dashboard'
import { getInsights, generateInsights } from '../lib/actions/insights'
import { getHealthScore } from '../lib/actions/health-score'
import { getFinancialSummary } from '../lib/actions/summary'

type InsightRow = { id: string; type: string; title: string; message: string; created_at?: string }
type InsightsResult = { success: boolean; data?: InsightRow[]; error?: string }

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/login')
  }
  
  // Check if user has completed onboarding
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .maybeSingle()
  
  if (profileError) {
    console.error('Profile query error:', profileError)
    redirect('/onboarding')
  }
  
  if (!profile || !profile.onboarding_completed) {
    redirect('/onboarding')
  }
  
  // Fetch data for Home page
  let safeToSpendData = null
  let insightsRes: InsightsResult = { success: true, data: [] }
  let healthScoreData = null
  let financialSummary = null
  let proactiveInsights: { greeting: string; insights: Array<{ type: string; title: string; message: string; actionable?: string; priority: number }> } | null = null
  
  // Generate insights (will use AI if possible, includes proactive analysis)
  try {
    const genResult = await generateInsights(user.id)
    if (genResult.proactiveAnalysis) {
      proactiveInsights = {
        greeting: genResult.proactiveAnalysis.greeting,
        insights: genResult.proactiveAnalysis.insights
      }
    }
  } catch (e) {
    console.warn('generateInsights failed:', e)
  }
  
  try {
    safeToSpendData = await fetchSafeToSpend(user.id)
  } catch (e) {
    console.warn('fetchSafeToSpend failed:', e)
  }
  
  try {
    const result = await getInsights(user.id)
    insightsRes = result as InsightsResult
  } catch (e) {
    console.warn('getInsights failed:', e)
  }
  
  try {
    const result = await getHealthScore(user.id)
    if (result.success) {
      healthScoreData = result.data ?? null
    }
  } catch (e) {
    console.warn('getHealthScore failed:', e)
  }
  
  try {
    const result = await getFinancialSummary(user.id)
    if (result.success) {
      financialSummary = result.data ?? null
    }
  } catch (e) {
    console.warn('getFinancialSummary failed:', e)
  }
  

  
  const insightsList: InsightRow[] = insightsRes.success && Array.isArray(insightsRes.data) ? insightsRes.data : []
  
  // Render with dashboard-style layout and mesh background
  return (
    <div className="flex h-screen bg-mesh-gradient">
      <aside className="hidden md:flex">
        <Sidebar />
      </aside>
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4">
          <div className="max-w-2xl mx-auto">
            {/* Cora's Greeting - Simplified */}
            {proactiveInsights && proactiveInsights.insights.length > 0 && (
              <div className="mb-6 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--accent)]/5 rounded-xl p-4 border border-[var(--primary)]/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-lg shadow-lg flex-shrink-0">
                    ✨
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--text-primary)]">Cora</p>
                    <p className="text-[var(--text-secondary)] text-sm truncate">{proactiveInsights.greeting}</p>
                  </div>
                  <ViewDetailsLink />
                </div>
              </div>
            )}
            
            <RootHomeGreeting />
            
            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <SafeToSpendWidget data={safeToSpendData} />
              <HealthScoreWidget data={healthScoreData} />
            </div>
            
            {/* Cash Flow Forecast - Story 7.3 */}
            <div className="mb-6">
              <CashFlowForecastChart />
            </div>
            
            {/* Financial Summary - Portfolio, Goals, Debt */}
            <div className="mb-6">
              <RootOverviewHeader />
              <FinancialSummaryWidget 
                portfolio={financialSummary?.portfolio}
                goals={financialSummary?.goals}
                debt={financialSummary?.debt}
              />
            </div>
            
            {/* Compact Insight Feed */}
            {insightsList.length > 0 && (
              <div>
                <RootRecentInsightsHeader />
                <CompactInsightList insights={insightsList} maxItems={3} />
              </div>
            )}
          </div>
        </div>
        <div className="md:hidden">
          <BottomNav />
        </div>
      </main>
    </div>
  )
}
