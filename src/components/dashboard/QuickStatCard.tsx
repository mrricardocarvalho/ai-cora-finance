"use client"
import React from 'react'

export default function QuickStatCard({ label, value, trend, trendValue, invertTrend }:{ label: string; value: string; trend?: 'up'|'down'|'neutral'; trendValue?: string; invertTrend?: boolean }){
  // 'up' is generally bad for spending (red), 'down' is good (green).
  // Some consumers (e.g., portfolio) want the opposite: up -> green. Use
  // `invertTrend` to flip the default color mapping where needed.
  const trendClass = trend === 'up'
    ? (invertTrend ? 'text-[var(--success)]' : 'text-[var(--danger)]')
    : trend === 'down'
      ? (invertTrend ? 'text-[var(--danger)]' : 'text-[var(--success)]')
      : 'text-[var(--text-secondary)]'
  return (
    <div className="p-4 border border-[var(--border)] rounded-xl bg-surface shadow-card h-full">
      <div className="flex justify-between items-center">
        <div className="min-w-0">
          <div className="text-xs text-[var(--text-muted)]">{label}</div>
          <div className="text-lg font-semibold mt-1 text-[var(--text-primary)]">{value}</div>
        </div>
        <div className={`text-sm flex-shrink-0 ${trendClass}`}>{trendValue || ''}</div>
      </div>
    </div>
  )
}
