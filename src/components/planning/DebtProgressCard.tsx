"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy, Calendar, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { format, differenceInMonths, parseISO } from 'date-fns'

type StrategyResult = {
  payoffDate: string | null
  totalInterestPaid: number
  months: number
  graphData: { month: number; totalBalance: number }[]
}

interface DebtProgressCardProps {
  strategy: StrategyResult
  totalDebt: number
}

export function DebtProgressCard({ strategy, totalDebt }: DebtProgressCardProps) {
  if (!strategy || !strategy.payoffDate) return null

  const payoffDate = parseISO(strategy.payoffDate)
  const monthsLeft = strategy.months
  
  // Mock progress since we don't have original balance
  // In a real app, we'd store the starting balance of the debt journey
  const mockOriginalDebt = totalDebt * 1.1 // Assume they paid off 10% already for demo
  const progress = ((mockOriginalDebt - totalDebt) / mockOriginalDebt) * 100

  return (
    <Card variant="glass" className="bg-gradient-to-br from-[var(--surface-glass)] to-[var(--surface-elevated)] border-[var(--border-glass)]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-[var(--text-primary)]">
          <Trophy className="h-5 w-5 text-[var(--warning)]" />
          Debt Freedom Journey
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-muted)]">Progress</span>
            <span className="font-medium text-[var(--text-primary)]">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex flex-col gap-1 p-3 bg-[var(--surface-glass)] backdrop-blur-sm rounded-xl border border-[var(--border-glass)] shadow-[var(--shadow-glass)]">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Calendar className="h-3 w-3" />
              Debt Free Date
            </div>
            <div className="font-bold text-lg text-[var(--text-primary)]">
              {format(payoffDate, 'MMM yyyy')}
            </div>
            <div className="text-xs text-[var(--success)] font-medium">
              {monthsLeft} months to go
            </div>
          </div>

          <div className="flex flex-col gap-1 p-3 bg-[var(--surface-glass)] backdrop-blur-sm rounded-xl border border-[var(--border-glass)] shadow-[var(--shadow-glass)]">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <TrendingDown className="h-3 w-3" />
              Interest to Pay
            </div>
            <div className="font-bold text-lg text-[var(--text-primary)]">
              {formatCurrency(strategy.totalInterestPaid)}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              Total remaining interest
            </div>
          </div>
        </div>

        <div className="text-sm text-center text-[var(--text-muted)] pt-2">
          &quot;The secret to getting ahead is getting started.&quot;
        </div>
      </CardContent>
    </Card>
  )
}
