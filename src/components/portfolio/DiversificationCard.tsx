'use client'

import React from 'react'
import { PieChart, AlertTriangle, TrendingUp, Info, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { DiversificationAnalysis, RiskLevel } from '../../lib/intelligence/portfolio-analysis-types'
import { getRiskIndicator } from '../../lib/intelligence/portfolio-analysis-types'


interface DiversificationCardProps {
  analysis: DiversificationAnalysis | null
}

// AC #5: Risk badge component
function RiskBadge({ level }: { level: RiskLevel }) {
  const indicator = getRiskIndicator(level)
  
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-sm font-medium ${
      level === 'low' ? 'bg-green-100 dark:bg-green-900/30' :
      level === 'moderate' ? 'bg-amber-100 dark:bg-amber-900/30' :
      'bg-red-100 dark:bg-red-900/30'
    } ${indicator.color}`}>
      <span>{indicator.emoji}</span>
      <span>{indicator.label}</span>
    </div>
  )
}

// AC #2: Type allocation bar
function AllocationBar({ allocations }: { allocations: Array<{ type: string; percentage: number }> }) {
  const COLORS = [
    'bg-teal-500',
    'bg-indigo-500',
    'bg-amber-500',
    'bg-pink-500',
    'bg-purple-500'
  ]
  
  return (
    <div className="space-y-2">
      <div className="flex h-3 rounded-full overflow-hidden">
        {allocations.map((alloc, i) => (
          <div
            key={alloc.type}
            className={`${COLORS[i % COLORS.length]} transition-all`}
            style={{ width: `${alloc.percentage}%` }}
            title={`${alloc.type}: ${alloc.percentage.toFixed(1)}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        {allocations.map((alloc, i) => (
          <div key={alloc.type} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${COLORS[i % COLORS.length]}`} />
            <span className="text-[var(--text-secondary)]">{alloc.type}</span>
            <span className="font-medium text-[var(--text-primary)]">
              {alloc.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// AC #1: Concentration warning
function ConcentrationWarning({ holdings }: { holdings: Array<{ ticker: string; percentage: number; isConcentrated: boolean }> }) {
  const concentrated = holdings.filter(h => h.isConcentrated)
  
  if (concentrated.length === 0) return null
  
  return (
    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-medium text-amber-800 dark:text-amber-200">
          Concentration Alert
        </p>
        <p className="text-amber-700 dark:text-amber-300">
          {concentrated.map(h => `${h.ticker} (${h.percentage.toFixed(0)}%)`).join(', ')} 
          {concentrated.length === 1 ? ' exceeds' : ' exceed'} 25% of your portfolio
        </p>
      </div>
    </div>
  )
}

export default function DiversificationCard({ analysis }: DiversificationCardProps) {
  // Handle null/error state
  if (!analysis || !analysis.success) {
    return (
      <div className="p-4 border border-[var(--border)] rounded-xl bg-surface shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <PieChart className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="font-semibold text-[var(--text-primary)]">Diversification</h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          {analysis?.error || 'Unable to analyze portfolio'}
        </p>
      </div>
    )
  }
  
  // Empty portfolio
  if (analysis.holdings.length === 0) {
    return (
      <div className="p-4 border border-[var(--border)] rounded-xl bg-surface shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <PieChart className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="font-semibold text-[var(--text-primary)]">Diversification</h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Add investments to see diversification analysis
        </p>
      </div>
    )
  }
  
  return (
    <div className="p-4 border border-[var(--border)] rounded-xl bg-surface shadow-card space-y-4">
      {/* Header with risk indicator - AC #5 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="font-semibold text-[var(--text-primary)]">Diversification</h3>
        </div>
        <RiskBadge level={analysis.riskLevel} />
      </div>
      
      {/* AC #1: Concentration warning */}
      <ConcentrationWarning holdings={analysis.holdings} />
      
      {/* AC #2: Type allocation breakdown */}
      {analysis.typeAllocation.length > 0 && (
        <div>
          <p className="text-xs text-[var(--text-secondary)] mb-2">Asset Type Allocation</p>
          <AllocationBar allocations={analysis.typeAllocation} />
        </div>
      )}
      
      {/* Top Holdings */}
      <div>
        <p className="text-xs text-[var(--text-secondary)] mb-2">Top Holdings</p>
        <div className="space-y-1.5">
          {analysis.holdings.slice(0, 5).map(holding => (
            <div key={holding.ticker} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${holding.isConcentrated ? 'text-amber-600' : 'text-[var(--text-primary)]'}`}>
                  {holding.ticker}
                </span>
                {holding.isConcentrated && (
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                )}
              </div>
              <span className="text-[var(--text-secondary)]">
                {holding.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* AC #4: Recommendations */}
      {analysis.recommendations.length > 0 && analysis.riskLevel !== 'low' && (
        <div className="pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-2">
            <TrendingUp className="w-3 h-3" />
            <span>Recommendation</span>
          </div>
          <p className="text-sm text-[var(--text-primary)]">
            {analysis.recommendations[0]}
          </p>
          
          {/* AC #6: Learn more link */}
          <Link 
            href="/chat?topic=diversification" 
            className="inline-flex items-center gap-1 mt-2 text-xs text-[var(--primary)] hover:underline"
          >
            <Info className="w-3 h-3" />
            Learn about diversification
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}
      
      {/* Well diversified message */}
      {analysis.riskLevel === 'low' && (
        <div className="pt-3 border-t border-[var(--border)]">
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
            <span>✓</span>
            Your portfolio appears well diversified
          </p>
        </div>
      )}
    </div>
  )
}
