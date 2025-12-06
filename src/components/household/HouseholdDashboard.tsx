'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Users, TrendingUp, TrendingDown, Wallet, 
  PiggyBank, Target, CreditCard, Building2,
  ChevronRight
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatting'
import { HouseholdSummary } from '@/lib/household/summary'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Props {
  summary: HouseholdSummary
}

export function HouseholdDashboard({ summary }: Props) {
  const { combined_metrics, shared_goals, combined_accounts, members, household_name } = summary

  const formatValue = (value: number) => formatCurrency(value)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{household_name}</h1>
            <p className="text-[var(--text-muted)]">
              {members.length} member{members.length !== 1 ? 's' : ''} • Combined household view
            </p>
          </div>
        </div>
        <Link 
          href="/settings/household"
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Manage <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Net Worth Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">
                Combined Net Worth
              </p>
              <p className="text-4xl font-bold text-primary">
                {formatValue(combined_metrics.total_net_worth)}
              </p>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm">
                    Assets: {formatValue(combined_metrics.total_assets)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-sm">
                    Liabilities: {formatValue(combined_metrics.total_liabilities)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Monthly Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-[var(--text-muted)] mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium">Monthly Income</span>
            </div>
            <p className="text-xl font-bold text-green-600">
              {formatValue(combined_metrics.monthly_income)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-[var(--text-muted)] mb-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-xs font-medium">Monthly Expenses</span>
            </div>
            <p className="text-xl font-bold text-red-600">
              {formatValue(combined_metrics.monthly_expenses)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-[var(--text-muted)] mb-2">
              <PiggyBank className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium">Savings Rate</span>
            </div>
            <p className="text-xl font-bold text-blue-600">
              {combined_metrics.savings_rate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-[var(--text-muted)] mb-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium">Safe to Spend</span>
            </div>
            <p className="text-xl font-bold text-primary">
              {formatValue(combined_metrics.safe_to_spend)}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Shared Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Shared Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {shared_goals.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No shared goals yet</p>
                <p className="text-sm mt-1">
                  Create a goal and mark it as &quot;shared&quot; to track together.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {shared_goals.map(goal => (
                  <div key={goal.id} className="p-4 bg-[var(--bg-subtle)] rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{goal.name}</h4>
                        <p className="text-sm text-[var(--text-muted)]">
                          {formatValue(goal.current_amount)} of {formatValue(goal.target_amount)}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-primary">
                        {goal.progress}%
                      </span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    
                    {/* Contribution breakdown */}
                    {goal.contributions.length > 1 && (
                      <div className="flex gap-2 mt-3">
                        {goal.contributions.map((c, idx) => (
                          <div 
                            key={c.user_id}
                            className="flex items-center gap-1 text-xs bg-[var(--bg-hover)] px-2 py-1 rounded-full"
                          >
                            <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-primary' : 'bg-blue-400'}`} />
                            {formatValue(c.amount)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Shared Accounts Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Shared Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {combined_accounts.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No shared accounts</p>
                <p className="text-sm mt-1">
                  Mark accounts as &quot;shared&quot; to include them here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {combined_accounts.map(account => (
                  <div 
                    key={account.id}
                    className="flex items-center justify-between p-3 bg-[var(--bg-subtle)] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[var(--bg-hover)] rounded-lg">
                        {account.type === 'credit_card' ? (
                          <CreditCard className="w-4 h-4 text-[var(--text-muted)]" />
                        ) : (
                          <Building2 className="w-4 h-4 text-[var(--text-muted)]" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{account.name}</p>
                        <p className="text-xs text-[var(--text-muted)] capitalize">
                          {account.type.replace('_', ' ')} • {account.visibility}
                        </p>
                      </div>
                    </div>
                    <p className={`font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatValue(account.balance)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Fair Share Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Contribution Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {members.map((member, idx) => {
                const memberAccounts = combined_accounts.filter(a => a.owner_id === member.user_id)
                const memberTotal = memberAccounts.reduce((sum, a) => sum + a.balance, 0)
                const totalAssets = combined_accounts.reduce((sum, a) => sum + Math.max(0, a.balance), 0)
                const share = totalAssets > 0 ? (Math.max(0, memberTotal) / totalAssets) * 100 : 50

                return (
                  <div key={member.user_id} className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-primary' : 'bg-blue-400'}`} />
                      <span className="text-sm font-medium">
                        {member.role === 'admin' ? 'Admin' : 'Member'} {idx + 1}
                      </span>
                    </div>
                    <div className="h-3 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${idx === 0 ? 'bg-primary' : 'bg-blue-400'} rounded-full transition-all`}
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {formatValue(memberTotal)} ({share.toFixed(0)}%)
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
