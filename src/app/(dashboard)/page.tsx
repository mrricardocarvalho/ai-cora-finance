import React from 'react'
import { redirect } from 'next/navigation'
import InsightFeed from '../../components/insights/InsightFeed'
import SafeToSpendWidget from '../../components/dashboard/SafeToSpendWidget'
import HealthScoreWidget from '../../components/dashboard/HealthScoreWidget'
import CashFlowForecastChart from '../../components/dashboard/CashFlowForecastChart'
import { fetchSafeToSpend } from '../../lib/actions/dashboard'
import { getInsights, generateInsights } from '../../lib/actions/insights'
import { getHealthScore } from '../../lib/actions/health-score'
import { createClient } from '../../lib/supabase/server'
import { Lightbulb, AlertTriangle, TrendingUp, PartyPopper } from 'lucide-react'
import { HomeGreeting, InsightHistoryHeader, NoInsightsMessage } from '../../components/shared/PageHeader'

type InsightRow = { id: string; type: string; title: string; message: string; created_at?: string }
type InsightsResult = { success: boolean; data?: InsightRow[]; error?: string }
type GenerateInsightsResult = { success?: boolean; proactiveAnalysis?: { greeting: string; insights: Array<{ type: string; title: string; message: string; actionable?: string; priority: number }> } | null }

const INSIGHT_ICONS: Record<string, typeof Lightbulb> = {
  observation: Lightbulb,
  warning: AlertTriangle,
  opportunity: TrendingUp,
  celebration: PartyPopper
}

const INSIGHT_COLORS: Record<string, string> = {
  observation: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  opportunity: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  celebration: 'bg-purple-50 border-purple-200 text-purple-800'
}

// This is the Home page (Insight Feed) - the main landing page after login
export default async function HomePage(){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Wrap data fetching in try-catch to handle new users with empty data
  let safeToSpendData = null
  let insightsRes: InsightsResult = { success: true, data: [] }
  let healthScoreData = null
  let proactiveInsights: { greeting: string; insights: Array<{ type: string; title: string; message: string; actionable?: string; priority: number }> } | null = null
  
  // Run all data fetches in parallel for better performance
  // NOTE: generateInsights already calls runProactiveAnalysis internally and returns proactiveAnalysis
  // so we don't need to call runProactiveAnalysis separately
  const [
    generateResult,
    safeToSpendResult,
    insightsResult,
    healthScoreResult
  ] = await Promise.allSettled([
    generateInsights(user.id),
    fetchSafeToSpend(user.id),
    getInsights(user.id),
    getHealthScore(user.id)
  ])
  
  // Extract proactive insights from generateInsights result
  if (generateResult.status === 'fulfilled') {
    const genRes = generateResult.value as GenerateInsightsResult
    if (genRes?.proactiveAnalysis) {
      proactiveInsights = genRes.proactiveAnalysis
    }
  } else {
    console.warn('generateInsights failed:', generateResult.reason)
  }
  
  // Extract results from settled promises
  if (safeToSpendResult.status === 'fulfilled') {
    safeToSpendData = safeToSpendResult.value
  } else {
    console.warn('fetchSafeToSpend failed:', safeToSpendResult.reason)
  }
  
  if (insightsResult.status === 'fulfilled') {
    insightsRes = insightsResult.value as InsightsResult
  } else {
    console.warn('getInsights failed:', insightsResult.reason)
  }
  
  if (healthScoreResult.status === 'fulfilled' && healthScoreResult.value.success) {
    healthScoreData = healthScoreResult.value.data ?? null
  } else if (healthScoreResult.status === 'rejected') {
    console.warn('getHealthScore failed:', healthScoreResult.reason)
  }
  
  const insightsList: InsightRow[] = insightsRes.success && Array.isArray(insightsRes.data) ? insightsRes.data : []
  
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Cora's Proactive Greeting */}
      {proactiveInsights && proactiveInsights.insights.length > 0 && (
        <section className="bg-gradient-to-br from-[var(--primary)]/10 via-[var(--surface-glass)] to-[var(--accent)]/10 backdrop-blur-lg rounded-2xl p-4 sm:p-5 border border-[var(--border-glass)] shadow-glass">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-lg flex-shrink-0 shadow-glass">
              🌿
            </div>
            <div className="min-w-0">
              <p className="font-medium text-[var(--text-primary)]">Cora</p>
              <p className="text-[var(--text-secondary)] text-sm">{proactiveInsights.greeting}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {proactiveInsights.insights.slice(0, 4).map((insight, i) => {
              const Icon = INSIGHT_ICONS[insight.type] || Lightbulb
              const colorClass = INSIGHT_COLORS[insight.type] || INSIGHT_COLORS.observation
              return (
                <div key={i} className={`p-3 rounded-xl border backdrop-blur-sm ${colorClass} hover:scale-[1.02] transition-all duration-200 ease-smooth`}>
                  <div className="flex items-start gap-2">
                    <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <p className="text-xs mt-1 opacity-90 line-clamp-2">{insight.message}</p>
                      {insight.actionable && (
                        <p className="text-xs mt-1 font-medium opacity-75">💡 {insight.actionable}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
      
      {/* Header */}
      <HomeGreeting />
      
      {/* Key Metrics Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SafeToSpendWidget data={safeToSpendData} />
        <HealthScoreWidget data={healthScoreData} />
      </section>
      
      {/* Cash Flow Forecast - Story 7.3 */}
      <section>
        <CashFlowForecastChart />
      </section>
      
      {/* Insight Feed */}
      <section>
        <InsightHistoryHeader />
        {insightsList.length === 0 ? (
          <NoInsightsMessage />
        ) : (
          <InsightFeed initial={insightsList} />
        )}
      </section>
    </div>
  )
}
