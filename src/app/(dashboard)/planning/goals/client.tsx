"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import Button from '../../../../components/ui/button'
import GoalCard from '../../../../components/planning/goal-card'
import AddGoalDialog from '../../../../components/planning/add-goal-dialog'
import { useTranslations } from '../../../../lib/i18n'
import CoraHeader from '../../../../components/shared/CoraHeader'

type Account = {
  id: string
  name: string
  balance: number | string
}

type Goal = {
  id: string
  name: string
  target_amount: number
  current_amount: number
  deadline?: string
  linked_account_id?: string
  visibility: 'personal' | 'shared'
}

type Props = {
  goals: Goal[]
  accounts: Account[]
}

export default function GoalsPageClient({ goals, accounts }: Props) {
  const router = useRouter()
  const t = useTranslations()
  const [showAddGoal, setShowAddGoal] = useState(false)
  
  const acctMap = new Map(accounts.map(a => [a.id, a]))
  
  const handleSuccess = () => {
    setShowAddGoal(false)
    router.refresh()
  }
  
  return (
    <div className="space-y-4 p-4">
      {/* Story 6.9: Cora Header */}
      <CoraHeader context="planning/goals" />
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t.pages.goals.title}</h2>
        <Button variant="primary" onClick={() => setShowAddGoal(true)} className="flex items-center gap-2">
          <Plus size={18} />
          <span>{t.pages.goals.addGoal}</span>
        </Button>
      </div>
      
      {goals.length === 0 ? (
        <div className="bg-surface border border-[var(--border)] rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{t.pages.goals.noGoalsTitle}</h3>
          <p className="text-[var(--text-secondary)] mb-6">
            {t.pages.goals.noGoalsDesc}
          </p>
          <Button variant="primary" onClick={() => setShowAddGoal(true)}>
            {t.pages.goals.createFirst}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const acct = g.linked_account_id ? acctMap.get(g.linked_account_id) : undefined
            const balance = acct ? Number(acct.balance || 0) : undefined
            return <GoalCard key={g.id} goal={g} accountBalance={balance} />
          })}
        </div>
      )}
      
      {/* Modal Dialog for Adding Goal */}
      {showAddGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAddGoal(false)}>
          <div 
            className="bg-surface border border-[var(--border)] rounded-xl shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{t.pages.goals.newGoal}</h3>
              <button 
                onClick={() => setShowAddGoal(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>
            <AddGoalDialog onSuccess={handleSuccess} accounts={accounts} />
          </div>
        </div>
      )}
    </div>
  )
}
