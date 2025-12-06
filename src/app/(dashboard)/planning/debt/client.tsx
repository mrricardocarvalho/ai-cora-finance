"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Calculator } from 'lucide-react'
import Button from '../../../../components/ui/button'
import { ExtraPaymentSimulator } from '../../../../components/planning/ExtraPaymentSimulator'
import { DebtProgressCard } from '../../../../components/planning/DebtProgressCard'
import AddDebtDialog from '../../../../components/planning/add-debt-dialog'
import { useTranslations } from '../../../../lib/i18n'

type Account = {
  id: string
  name: string
  balance: number
  interest_rate: number | null
  min_payment: number | null
  type: string
}

type StrategyResult = {
  payoffDate: string | null
  totalInterestPaid: number
  months: number
  graphData: { month: number; date: string; totalBalance: number; balances: { id: string; balance: number }[] }[]
}

export default function DebtPageClient({ 
  accounts,
  baseline,
  defaultStrategy
}: { 
  accounts: Account[],
  baseline?: StrategyResult,
  defaultStrategy?: StrategyResult
}) {
  const router = useRouter()
  const t = useTranslations()
  const [showAddDebt, setShowAddDebt] = useState(false)
  
  const handleSuccess = () => {
    setShowAddDebt(false)
    router.refresh()
  }

  // Map accounts to Debt interface for simulator
  const debts = (accounts || []).map(a => ({
    id: a.id,
    name: a.name,
    balance: a.balance,
    interest_rate: a.interest_rate || 0,
    min_payment: a.min_payment || 0
  }));

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0)
  
  // Empty state
  if (!accounts || accounts.length === 0) {
    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{t.pages.debt.title}</h1>
            <p className="mt-1 text-[var(--text-secondary)]">{t.pages.debt.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/planning/debt/compare">
              <Button variant="secondary" className="flex items-center gap-2">
                <Calculator size={18} />
                <span>Compare Loans</span>
              </Button>
            </Link>
            <Button variant="primary" onClick={() => setShowAddDebt(true)} className="flex items-center gap-2">
              <Plus size={18} />
              <span>{t.pages.debt.addDebt}</span>
            </Button>
          </div>
        </div>
        
        <div className="bg-surface border border-[var(--border)] rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{t.pages.debt.noDebtTitle}</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            {t.pages.debt.noDebtDesc}
          </p>
          <Button variant="primary" onClick={() => setShowAddDebt(true)} className="mx-auto">
            {t.pages.debt.addFirst}
          </Button>
        </div>
        
        <AddDebtDialog 
          open={showAddDebt} 
          onClose={() => setShowAddDebt(false)} 
          onSuccess={handleSuccess}
        />
      </div>
    )
  }
  
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{t.pages.debt.title}</h1>
          <p className="mt-1 text-[var(--text-secondary)]">{t.pages.debt.subtitleWithData}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/planning/debt/compare">
            <Button variant="secondary" className="flex items-center gap-2">
              <Calculator size={18} />
              <span className="hidden sm:inline">Compare Loans</span>
            </Button>
          </Link>
          <Button variant="primary" onClick={() => setShowAddDebt(true)} className="flex items-center gap-2">
            <Plus size={18} />
            <span className="hidden sm:inline">{t.pages.debt.addDebt}</span>
          </Button>
        </div>
      </div>
      
      {defaultStrategy && (
        <DebtProgressCard strategy={defaultStrategy} totalDebt={totalDebt} />
      )}
      
      <ExtraPaymentSimulator debts={debts} />
      
      <AddDebtDialog 
        open={showAddDebt} 
        onClose={() => setShowAddDebt(false)} 
        onSuccess={handleSuccess}
      />
    </div>
  )
}
