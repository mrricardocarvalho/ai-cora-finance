import React from 'react'
import { WeeklySummary } from '@/lib/intelligence/weekly-summary'
import { formatCurrency } from '@/lib/utils'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface Props {
  summary: WeeklySummary
  onDismiss?: () => void
}

export default function WeeklySummaryCard({ summary, onDismiss }: Props) {
  const isSpendingUp = summary.percentChange > 0

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Weekly Review</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Your financial snapshot</p>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-zinc-400 hover:text-zinc-600">
            ×
          </button>
        )}
      </div>

      {/* Main Stat */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {formatCurrency(summary.totalSpent)}
        </span>
        <span className={`flex items-center text-sm font-medium ${isSpendingUp ? 'text-red-500' : 'text-emerald-500'}`}>
          {isSpendingUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          {Math.abs(summary.percentChange)}% vs last week
        </span>
      </div>

      {/* Top Categories */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Top Spending</h4>
        {summary.topCategories.map((cat, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">{cat.category}</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(cat.amount)}</span>
          </div>
        ))}
      </div>

      {/* Highlights */}
      {summary.highlights.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <ul className="space-y-2">
            {summary.highlights.map((h, i) => (
              <li key={i} className="text-sm text-blue-700 dark:text-blue-300 flex gap-2">
                <span>•</span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upcoming Bills */}
      {summary.upcomingBills.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Upcoming Bills</h4>
          {summary.upcomingBills.map((bill, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">{bill.name}</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(bill.amount)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {summary.actions.length > 0 && (
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">Suggested Actions</h4>
          <ul className="space-y-2">
            {summary.actions.map((action, i) => (
              <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex gap-2 items-start">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
