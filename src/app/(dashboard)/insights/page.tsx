import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import InsightFeed from '../../../components/insights/InsightFeed'
import { getInsights } from '../../../lib/actions/insights'

type InsightRow = { id: string; type: string; title: string; message: string; created_at?: string }
type InsightsResult = { success: boolean; data?: InsightRow[]; error?: string }

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/login')
  }
  
  let insightsRes: InsightsResult = { success: true, data: [] }
  
  try {
    const result = await getInsights(user.id)
    insightsRes = result as InsightsResult
  } catch (e) {
    console.warn('getInsights failed:', e)
  }
  
  const insightsList: InsightRow[] = insightsRes.success && Array.isArray(insightsRes.data) ? insightsRes.data : []
  
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Insights da Cora</h1>
        <p className="mt-1 text-[var(--text-secondary)]">
          Todas as análises e recomendações personalizadas sobre as tuas finanças.
        </p>
      </header>
      
      {/* Insight Feed */}
      {insightsList.length === 0 ? (
        <div className="bg-surface border border-[var(--border)] rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Tudo em dia!</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Não há insights pendentes. A Cora vai analisar as tuas transações e criar novos insights automaticamente.
          </p>
          <a href="/data" className="text-[var(--primary)] hover:underline font-medium">
            Carregar mais dados →
          </a>
        </div>
      ) : (
        <InsightFeed initial={insightsList} />
      )}
    </div>
  )
}
