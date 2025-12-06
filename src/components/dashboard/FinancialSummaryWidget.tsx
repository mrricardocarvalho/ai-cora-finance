"use client"
import React from 'react'
import Link from 'next/link'
import { Briefcase, Target, CreditCard, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import { useTranslations } from '../../lib/i18n'

type Props = {
  portfolio?: {
    totalValue: number
    totalUnrealized: number
    totalReturnPercent: number
  } | null
  goals?: {
    total: number
    onTrack: number
    totalProgress: number
  } | null
  debt?: {
    totalOwed: number
    monthlyPayment: number
  } | null
}

export default function FinancialSummaryWidget({ portfolio, goals, debt }: Props) {
  const t = useTranslations()
  const w = t.widgets.overview
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Portfolio */}
      <Link 
        href="/portfolio"
        className="bg-surface border border-[var(--border)] rounded-xl p-4 hover:border-[var(--primary)]/50 hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
            <Briefcase size={16} className="text-[var(--primary)]" />
          </div>
          <span className="text-sm text-[var(--text-secondary)]">{w.investments}</span>
        </div>
        {portfolio && portfolio.totalValue > 0 ? (
          <>
            <div className="text-lg font-semibold text-[var(--text-primary)]">
              {formatCurrency(portfolio.totalValue)}
            </div>
            <div className={`text-xs flex items-center gap-1 ${portfolio.totalUnrealized >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
              {portfolio.totalUnrealized >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {portfolio.totalUnrealized >= 0 ? '+' : ''}{formatCurrency(portfolio.totalUnrealized)} ({portfolio.totalReturnPercent.toFixed(1)}%)
            </div>
          </>
        ) : (
          <div className="text-sm text-[var(--text-muted)]">{w.noInvestments}</div>
        )}
      </Link>
      
      {/* Goals */}
      <Link 
        href="/planning/goals"
        className="bg-surface border border-[var(--border)] rounded-xl p-4 hover:border-[var(--accent)]/50 hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
            <Target size={16} className="text-[var(--accent)]" />
          </div>
          <span className="text-sm text-[var(--text-secondary)]">{w.goals}</span>
        </div>
        {goals && goals.total > 0 ? (
          <>
            <div className="text-lg font-semibold text-[var(--text-primary)]">
              {goals.onTrack}/{goals.total} {w.onTrack}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              {goals.totalProgress.toFixed(0)}% {w.totalProgress}
            </div>
          </>
        ) : (
          <div className="text-sm text-[var(--text-muted)]">{w.noGoals}</div>
        )}
      </Link>
      
      {/* Debt */}
      <Link 
        href="/planning/debt"
        className="bg-surface border border-[var(--border)] rounded-xl p-4 hover:border-[var(--warning)]/50 hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--warning)]/10 flex items-center justify-center">
            <CreditCard size={16} className="text-[var(--warning)]" />
          </div>
          <span className="text-sm text-[var(--text-secondary)]">{w.debts}</span>
        </div>
        {debt && debt.totalOwed > 0 ? (
          <>
            <div className="text-lg font-semibold text-[var(--text-primary)]">
              {formatCurrency(Math.abs(debt.totalOwed))}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              {formatCurrency(debt.monthlyPayment)}/{w.monthMin}
            </div>
          </>
        ) : (
          <div className="text-sm text-[var(--success)]">{w.noDebts} 🎉</div>
        )}
      </Link>
    </div>
  )
}
