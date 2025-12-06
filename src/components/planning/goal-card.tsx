"use client"
import React from 'react'
import { formatCurrency, formatDate } from '../../lib/utils'
import { celebrate } from '../../lib/utils'
import Progress from '../ui/progress'
import { GoalForm } from '../../lib/validations/goals'
import { Users } from 'lucide-react'

type Goal = GoalForm & { 
  id: string
  visibility?: 'personal' | 'shared'
  contributions?: { user_id: string; amount: number; display_name?: string }[]
}

export default function GoalCard({ goal, accountBalance }: { goal: Goal; accountBalance?: number }){
  const current = accountBalance !== undefined ? accountBalance : Number(goal.current_amount || 0)
  const target = Number(goal.target_amount || 0)
  const pct = target === 0 ? 0 : Math.min(100, Math.round((current / target) * 100))
  const prevPctRef = React.useRef<number>(pct)
  const isShared = goal.visibility === 'shared'
  const contributions = goal.contributions || []
  
  React.useEffect(()=>{
    if(prevPctRef.current < 100 && pct >= 100){ celebrate() }
    prevPctRef.current = pct
  }, [pct])
  
  const monthsLeft = goal.deadline ? Math.max(1, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000*60*60*24*30))) : null
  const perMonth = monthsLeft ? ((target - current)/monthsLeft) : null

  return (
    <div className="p-5 border border-[var(--border-glass)] rounded-2xl bg-[var(--surface-glass)] backdrop-blur-lg shadow-[var(--shadow-glass)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-secondary)]">{goal.name}</span>
            {isShared && (
              <span className="flex items-center gap-1 text-xs bg-[var(--primary-glass)] text-[var(--primary)] px-2 py-0.5 rounded-full">
                <Users className="w-3 h-3" />
                Shared
              </span>
            )}
          </div>
          <div className="text-lg font-semibold mt-1 text-[var(--text-primary)]">{formatCurrency(current)} / {formatCurrency(target)}</div>
          <div className="text-sm text-[var(--text-muted)]">Deadline: {goal.deadline ? formatDate(goal.deadline) : 'No deadline'}</div>
        </div>
        <div className="text-right text-sm text-[var(--primary)] font-medium">{pct}%</div>
      </div>
      <div className="mt-3 h-2">
        <Progress value={pct} className="h-2 rounded" />
      </div>
      
      {/* Contribution visualization for shared goals */}
      {isShared && contributions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] mb-2">Contributions</p>
          <div className="flex gap-2">
            {contributions.map((c, idx) => {
              const contributionPct = current > 0 ? (c.amount / current) * 100 : 0
              return (
                <div key={c.user_id} className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-primary' : 'bg-blue-400'}`} />
                    <span className="text-xs text-[var(--text-secondary)]">
                      {c.display_name || `Member ${idx + 1}`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${idx === 0 ? 'bg-primary' : 'bg-blue-400'} rounded-full`}
                      style={{ width: `${contributionPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {formatCurrency(c.amount)} ({contributionPct.toFixed(0)}%)
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {monthsLeft ? <div className="text-sm text-[var(--text-secondary)] mt-2">Save {formatCurrency(Math.max(0, Number(perMonth || 0)))} / month to reach by {formatDate(goal.deadline ?? new Date())}</div> : null}    
    </div>
  )
}
