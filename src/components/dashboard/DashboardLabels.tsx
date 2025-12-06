"use client"
import React from 'react'
import { useTranslations } from '../../lib/i18n'
import QuickStatCard from './QuickStatCard'
import { formatCurrency } from '../../lib/utils'

export function NetWorthLabel() {
  const t = useTranslations()
  return <>{t.dashboard.netWorth}</>
}

export function ThisMonthSpendingLabel() {
  const t = useTranslations()
  return <>{t.pages.dashboard.thisMonthSpending}</>
}

export function SavingsRateLabel() {
  const t = useTranslations()
  return <>{t.dashboard.savingsRate}</>
}

interface QuickStats {
  netWorth: number
  thisMonth: { total_out: number }
  spendingTrendPercent: number
  savingsRate: number
}

export function DashboardKPICards({ quick }: { quick: QuickStats | null }) {
  const t = useTranslations()
  
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <QuickStatCard 
        label={t.dashboard.netWorth} 
        value={quick ? formatCurrency(quick.netWorth) : '—'} 
        trend='neutral' 
      />
      <QuickStatCard 
        label={t.pages.dashboard.thisMonthSpending} 
        value={quick ? formatCurrency(quick.thisMonth.total_out) : '—'} 
        trend={(quick && quick.spendingTrendPercent > 0) ? 'up' : 'down'} 
        trendValue={quick ? `${Math.round(quick.spendingTrendPercent)}%` : undefined} 
      />
      <QuickStatCard 
        label={t.dashboard.savingsRate} 
        value={quick ? `${Math.round(quick.savingsRate)}%` : '—'} 
        trend={(quick && quick.savingsRate > 0) ? 'down' : 'up'} 
        trendValue={quick ? `${Math.round(quick.savingsRate)}%` : undefined} 
      />
    </section>
  )
}

export default function DashboardLabels() {
  return null
}
