import React from 'react'
import CompactInsightList from '../../../components/insights/CompactInsightList'
import FinancialSummaryWidget from '../../../components/dashboard/FinancialSummaryWidget'
import DashboardSkeleton from '../../../components/skeletons/dashboard-skeleton'
import CashFlowForecastChart from '../../../components/dashboard/CashFlowForecastChart'
import { getQuickStats } from '../../../lib/actions/analytics'
import SafeToSpendWidget from '../../../components/dashboard/SafeToSpendWidget'
import { fetchSafeToSpend } from '../../../lib/actions/dashboard'
import { getInsights } from '../../../lib/actions/insights'
import { getFinancialSummary } from '../../../lib/actions/summary'
import { createClient } from '../../../lib/supabase/server'
import { DashboardHeader, DashboardOverviewHeader, DashboardRecentInsightsHeader } from '../../../components/shared/PageHeader'
import { DashboardKPICards } from '../../../components/dashboard/DashboardLabels'
import ViewToggle from '../../../components/dashboard/ViewToggle'

type InsightRow = { id: string; type: string; title: string; message: string; created_at?: string }
type InsightsResult = { success: boolean; data?: InsightRow[]; error?: string }
type QuickStatsResult = { success: boolean; data?: { netWorth: number; thisMonth: { total_out: number }; spendingTrendPercent: number; savingsRate: number }; error?: string }

export default async function DashboardPage({ searchParams }: { searchParams: { view?: string } }){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const view = (searchParams?.view === 'household' ? 'household' : 'personal') as 'personal' | 'household'
  
  // Wrap data fetching in try-catch to handle new users with empty data
  let safeToSpendData = null
  let insightsRes: InsightsResult = { success: true, data: [] }
  let quickRes: QuickStatsResult = { success: false }
  let financialSummary = null
  
  if (user) {
    try {
      safeToSpendData = await fetchSafeToSpend(user.id, view)
    } catch (e) {
      console.warn('fetchSafeToSpend failed:', e)
      safeToSpendData = null
    }
    
    try {
      const result = await getInsights(user.id, view)
      insightsRes = result as InsightsResult
    } catch (e) {
      console.warn('getInsights failed:', e)
    }
    
    try {
      const result = await getQuickStats(user.id, view)
      quickRes = result as QuickStatsResult
    } catch (e) {
      console.warn('getQuickStats failed:', e)
    }
    
    try {
      const result = await getFinancialSummary(user.id, view)
      if (result.success) {
        financialSummary = result.data ?? null
      }
    } catch (e) {
      console.warn('getFinancialSummary failed:', e)
    }
  }
  
  const quick = quickRes.success && quickRes.data ? quickRes.data : null
  const insightsList: InsightRow[] = insightsRes.success && Array.isArray(insightsRes.data) ? insightsRes.data : []
  
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <DashboardHeader />
        <ViewToggle />
      </div>

      {quick === null && <DashboardSkeleton />}

      {/* KPI Cards Row */}
      <DashboardKPICards quick={quick} />

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Safe to Spend Widget */}
        <div className="lg:col-span-1">
          <SafeToSpendWidget data={safeToSpendData} />
        </div>
        
        {/* Financial Summary - Portfolio, Goals, Debt */}
        <div className="lg:col-span-2">
          <DashboardOverviewHeader />
          <FinancialSummaryWidget 
            portfolio={financialSummary?.portfolio}
            goals={financialSummary?.goals}
            debt={financialSummary?.debt}
          />
        </div>
      </section>

      {/* Cash Flow Forecast - Story 7.3 */}
      <section>
        <CashFlowForecastChart />
      </section>

      {/* Compact Insight Feed */}
      {insightsList.length > 0 && (
        <section>
          <DashboardRecentInsightsHeader />
          <CompactInsightList insights={insightsList} maxItems={5} />
        </section>
      )}
    </div>
  )
}
