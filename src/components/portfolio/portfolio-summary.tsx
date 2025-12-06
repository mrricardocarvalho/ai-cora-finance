"use client"
import React from 'react'
import QuickStatCard from '../dashboard/QuickStatCard'
import { formatCurrency } from '../../lib/utils'
import { useTranslations } from '../../lib/i18n'

export default function PortfolioSummary({ totals }:{ totals: { totalValue: number; totalCost: number; totalUnrealized: number; totalReturnPercent: number; totalDayChange?: number }}){
  const t = useTranslations()
  const { totalValue, totalUnrealized, totalReturnPercent, totalDayChange = 0 } = totals
  // For portfolios, an upward return is good — this component uses `invertTrend`
  // so `up` is styled green via QuickStatCard by passing `invertTrend`.
  const trend = totalUnrealized >= 0 ? 'up' : 'down'
  const trendValue = `${totalUnrealized >= 0 ? '+' : ''}${Math.round(totalReturnPercent)}%`
  
  const dayTrend = totalDayChange >= 0 ? 'up' : 'down'
  const dayTrendValue = totalDayChange !== 0 ? (totalDayChange >= 0 ? '+' : '') + formatCurrency(Math.abs(totalDayChange)) : undefined
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <QuickStatCard label={t.portfolio.totalValue} value={formatCurrency(Math.round(totalValue * 100) / 100)} trend='neutral' />
      <QuickStatCard label={t.portfolio.totalReturn} value={formatCurrency(Math.round(totalUnrealized * 100) / 100)} trend={trend} trendValue={trendValue} invertTrend />
      <QuickStatCard label={t.portfolio.dayChange} value={formatCurrency(Math.round(totalDayChange * 100) / 100)} trend={totalDayChange === 0 ? 'neutral' : dayTrend} trendValue={dayTrendValue} invertTrend />
    </div>
  )
}
