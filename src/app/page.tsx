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
import CoraHeader from '../components/shared/CoraHeader'
import CoraPrompt, { CORA_PROMPTS } from '../components/shared/CoraPrompt'
import HomeChatInput from '../components/shared/HomeChatInput'
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

  // Check if user has accounts (for contextual prompts)
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
  const hasAccounts = accounts && accounts.length > 0

  // Check if user has transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
  const hasTransactions = transactions && transactions.length > 0
  
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

  // Determine contextual prompt based on user state
  const getContextualPrompt = () => {
    if (!hasAccounts) return CORA_PROMPTS.noAccounts
    if (!hasTransactions) return CORA_PROMPTS.noTransactions
    if (insightsList.length === 0) return CORA_PROMPTS.allCaughtUp
    return null
  }
  const contextualPrompt = getContextualPrompt()
  
  // Render Cora-centric layout: Hero → Insights → Quick Stats → Chat Input
  return (
    <div className="flex h-screen bg-mesh-gradient">
      <aside className="hidden md:flex">
        <Sidebar />
      </aside>
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-4 pb-32 md:pb-4">
          <div className="max-w-2xl mx-auto">
            {/* Story 6.7 & 6.9: Cora Hero Section - She speaks first */}
            <div className="mb-6">
              <CoraHeader 
                context="home" 
                data={{ 
                  insightSummary: proactiveInsights?.greeting || undefined 
                }} 
              />
            </div>
            
            {/* Story 6.7: Insight Feed is PRIMARY (above widgets) */}
            {insightsList.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wide">
                  What I noticed
                </h2>
                <CompactInsightList insights={insightsList} maxItems={5} />
              </div>
            )}

            {/* Story 6.8: Contextual Next-Step Prompt */}
            {contextualPrompt && (
              <div className="mb-6">
                <CoraPrompt {...contextualPrompt} />
              </div>
            )}
            
            {/* Quick Stats Row (secondary to insights) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <SafeToSpendWidget data={safeToSpendData} />
              <HealthScoreWidget data={healthScoreData} />
            </div>
            
            {/* Financial Summary - Portfolio, Goals, Debt */}
            <div className="mb-6">
              <h2 className="text-sm font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wide">
                Overview
              </h2>
              <FinancialSummaryWidget 
                portfolio={financialSummary?.portfolio}
                goals={financialSummary?.goals}
                debt={financialSummary?.debt}
              />
            </div>
          </div>
        </div>
        
        {/* Story 6.7: Sticky Chat Input at bottom (mobile) */}
        <div className="fixed bottom-16 left-0 right-0 md:hidden px-4 pb-2 bg-gradient-to-t from-[var(--bg-mesh-1)] to-transparent pt-4">
          <HomeChatInput />
        </div>
        
        <div className="md:hidden">
          <BottomNav />
        </div>
      </main>
    </div>
  )
}
