"use client"
import React, { useState } from 'react'
import type { Account as AccountType } from '../../lib/types'
import { formatCurrency, formatNumber } from '../../lib/utils'
import { Wallet, CreditCard, DollarSign, PieChart, RefreshCw, Plus, Pencil, Trash2 } from 'lucide-react'
import AccountFormComponent from './AccountForm'
import DeleteAccountDialog from './DeleteAccountDialog'
import { useTranslations } from '../../lib/i18n'

type Account = AccountType

const accountTypeIcons: Record<string, React.ReactNode> = {
  checking: <Wallet size={16} />,
  savings: <Wallet size={16} />,
  credit_card: <CreditCard size={16} />,
  loan: <DollarSign size={16} />,
  broker: <PieChart size={16} />,
}

export default function AccountList({ initialAccounts }: { initialAccounts: Account[] }) {
  const t = useTranslations()
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts || [])
  const [recalculating, setRecalculating] = useState(false)
  React.useEffect(() => { setAccounts(initialAccounts || []) }, [initialAccounts])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [deleting, setDeleting] = useState<Account | null>(null)
  // router is not used in this component; server actions perform revalidation

  // If the parent refreshes, this component will not automatically update. We rely
  // on server action calls triggering route refresh via router.refresh() in forms.

  React.useEffect(()=>{
    function handler(e: KeyboardEvent){
      if(e.key === 'Escape'){
        if(showForm) setShowForm(false)
        if(deleting) setDeleting(null)
      }
    }
    if(showForm || deleting) window.addEventListener('keydown', handler)
    return ()=> window.removeEventListener('keydown', handler)
  }, [showForm, deleting])

  const handleRecalculateBalances = async () => {
    setRecalculating(true)
    try {
      const resp = await fetch('/api/accounts/recalculate', { method: 'POST' })
      const data = await resp.json()
      if (data.success) {
        // Refresh the page to get updated balances
        window.location.reload()
      } else {
        alert(t.common.error + ': ' + (data.error || 'Unknown error'))
      }
    } catch {
      alert(t.common.error)
    } finally {
      setRecalculating(false)
    }
  }

  const isDebtAccount = (type: string | null | undefined) => ['credit_card', 'loan'].includes(type || '')

  // Get localized account type label
  const getAccountTypeLabel = (type: string | null | undefined): string => {
    const typeKey = (type || 'checking') as keyof typeof t.accounts.types
    return t.accounts.types[typeKey] || t.accounts.types.checking
  }

  return (
    <section className="bg-surface border border-[var(--border)] rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t.accounts.title}</h2>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleRecalculateBalances} 
            disabled={recalculating}
            title={t.accounts.recalculate}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={recalculating ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
          >
            <Plus size={14} />
            {t.common.add}
          </button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
            <Wallet size={24} className="text-[var(--text-muted)]" />
          </div>
          <p className="text-[var(--text-secondary)] mb-3">{t.accounts.noAccounts}</p>
          <button 
            onClick={() => setShowForm(true)} 
            className="text-sm text-[var(--primary)] hover:underline"
          >
            {t.accounts.addFirst}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.map(a => (
            <div 
              key={a.id} 
              className="group p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)]/50 hover:bg-[var(--bg-subtle)] transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                {/* Left side: icon + info */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDebtAccount(a.type) 
                      ? 'bg-[var(--danger)]/10 text-[var(--danger)]' 
                      : 'bg-[var(--primary)]/10 text-[var(--primary)]'
                  }`}>
                    {accountTypeIcons[a.type || 'checking']}
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <div className="font-medium text-sm text-[var(--text-primary)] truncate">{a.name}</div>
                    <div className="text-xs text-[var(--text-muted)] truncate">
                      {a.institution || getAccountTypeLabel(a.type)}
                    </div>
                  </div>
                </div>

                {/* Right side: balance + actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <div className={`font-semibold tabular-nums ${
                      isDebtAccount(a.type) && Number(a.balance) < 0
                        ? 'text-[var(--danger)]'
                        : 'text-[var(--text-primary)]'
                    }`}>
                      {formatCurrency(Number(a.balance || 0))}
                    </div>
                    {isDebtAccount(a.type) && a.interest_rate ? (
                      <div className="text-xs text-[var(--warning)]">
                        {formatNumber(Number(a.interest_rate), 1)}% APR
                      </div>
                    ) : null}
                  </div>
                  
                  {/* Action buttons - show on hover */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditing(a); setShowForm(true) }}
                      className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                      title={t.common.edit}
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={() => setDeleting(a)}
                      className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10"
                      title={t.common.delete}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
          <div className="bg-surface border border-[var(--border)] p-6 rounded-2xl w-full max-w-lg shadow-elevated">
            <AccountFormComponent
              initial={editing ? {
                name: editing.name,
                institution: editing.institution || '',
                type: editing.type,
                balance: Number(editing.balance ?? 0),
                interest_rate: editing.interest_rate ? Number(editing.interest_rate) : undefined,
                min_payment: editing.min_payment ? Number(editing.min_payment) : undefined,
                due_date: editing.due_date ?? undefined
              } : undefined}
              accountId={editing?.id}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
          <div className="bg-surface border border-[var(--border)] p-6 rounded-2xl w-full max-w-md shadow-elevated">
            <DeleteAccountDialog accountId={deleting.id} onClose={() => setDeleting(null)} />
          </div>
        </div>
      )}
    </section>
  )
}
