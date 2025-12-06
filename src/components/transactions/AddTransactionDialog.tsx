"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '../ui/toast-provider'
import { addTransaction } from '../../lib/actions/transactions'
import { categories as defaultCategories } from '../../lib/ai/category-list'
import { parseLocalizedNumber, formatCurrency } from '../../lib/utils'
import Sheet from '../ui/sheet'
import Button from '../ui/button'
import { useTranslations } from '../../lib/i18n'

type Props = {
  open: boolean
  onClose: () => void
  accounts: Array<{ id: string; name: string }>
  onSuccess?: () => void
}

export default function AddTransactionDialog({ open, onClose, accounts, onSuccess }: Props) {
  const t = useTranslations()
  const router = useRouter()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [category, setCategory] = useState('')
  const [accountId, setAccountId] = useState('')
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense')
  
  const amount = parseLocalizedNumber(amountInput) || 0
  
  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0])
    setDescription('')
    setAmountInput('')
    setCategory('')
    setAccountId('')
    setTransactionType('expense')
  }
  
  const handleClose = () => {
    resetForm()
    onClose()
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!date || !description || !amountInput || !accountId) {
      toast('error', t.transactions.fillRequired)
      return
    }
    
    const parsedAmount = parseLocalizedNumber(amountInput)
    if (parsedAmount === null || parsedAmount <= 0) {
      toast('error', t.transactions.validAmount)
      return
    }
    
    // Make amount negative for expenses
    const finalAmount = transactionType === 'expense' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount)
    
    setIsSubmitting(true)
    try {
      const res = await addTransaction({
        date,
        description,
        amount: finalAmount,
        category: category || 'Uncategorized',
        accountId
      })
      
      if (res.success) {
        toast('success', t.transactions.addSuccess)
        resetForm()
        router.refresh()
        onSuccess?.()
        onClose()
      } else {
        toast('error', res.error || t.transactions.addFailed)
      }
    } catch (e) {
      console.error('Add transaction failed', e)
      toast('error', t.transactions.addFailed)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Sheet open={open} onClose={handleClose} title={t.transactions.addTransaction}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type Toggle */}
        <div>
          <label className="text-sm text-[var(--text-secondary)] mb-1 block">{t.transactions.type}</label>
          <div className="flex gap-2">
            <button
              type="button"
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                transactionType === 'expense'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)]'
              }`}
              onClick={() => setTransactionType('expense')}
            >
              {t.transactions.expense}
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                transactionType === 'income'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)]'
              }`}
              onClick={() => setTransactionType('income')}
            >
              {t.transactions.income}
            </button>
          </div>
        </div>
        
        {/* Date */}
        <div>
          <label htmlFor="tx-date" className="text-sm text-[var(--text-secondary)] mb-1 block">
            {t.transactions.date} <span className="text-red-400">*</span>
          </label>
          <input
            id="tx-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full input"
            required
          />
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="tx-description" className="text-sm text-[var(--text-secondary)] mb-1 block">
            {t.transactions.description} <span className="text-red-400">*</span>
          </label>
          <input
            id="tx-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ex: Supermercado, Salário, Café"
            className="w-full input"
            required
          />
        </div>
        
        {/* Amount */}
        <div>
          <label htmlFor="tx-amount" className="text-sm text-[var(--text-secondary)] mb-1 block">
            {t.transactions.amount} <span className="text-red-400">*</span>
          </label>
          <input
            id="tx-amount"
            type="text"
            inputMode="decimal"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            placeholder="0,00"
            className="w-full input"
            required
          />
          {amount > 0 && (
            <div className={`text-sm mt-1 ${transactionType === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
              {transactionType === 'expense' ? '-' : '+'}{formatCurrency(amount)}
            </div>
          )}
        </div>
        
        {/* Account */}
        <div>
          <label htmlFor="tx-account" className="text-sm text-[var(--text-secondary)] mb-1 block">
            {t.transactions.account} <span className="text-red-400">*</span>
          </label>
          <select
            id="tx-account"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full input"
            required
          >
            <option value="">{t.transactions.selectAccount}</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        
        {/* Category */}
        <div>
          <label htmlFor="tx-category" className="text-sm text-[var(--text-secondary)] mb-1 block">
            {t.transactions.category}
          </label>
          <select
            id="tx-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full input"
          >
            <option value="">{t.transactions.noCategory}</option>
            {defaultCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        
        {/* Submit */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            {t.common.cancel}
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? t.transactions.adding : t.transactions.addTransaction}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
