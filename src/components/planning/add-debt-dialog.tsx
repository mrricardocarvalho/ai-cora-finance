"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '../ui/toast-provider'
import { parseLocalizedNumber, formatCurrency } from '../../lib/utils'
import Sheet from '../ui/sheet'
import Button from '../ui/button'
import { getSupabaseClient } from '../../lib/supabase/client'
import { useTranslations } from '../../lib/i18n'

type Props = {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AddDebtDialog({ open, onClose, onSuccess }: Props) {
  const router = useRouter()
  const toast = useToast()
  const t = useTranslations()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Debt types with translations
  const DEBT_TYPES = [
    { value: 'credit_card', label: t.planning.creditCard },
    { value: 'loan', label: t.planning.personalLoan },
    { value: 'mortgage', label: t.planning.mortgage },
    { value: 'auto_loan', label: t.planning.autoLoan },
    { value: 'student_loan', label: t.planning.studentLoan },
  ]
  
  // Form state
  const [name, setName] = useState('')
  const [debtType, setDebtType] = useState('credit_card')
  const [balanceInput, setBalanceInput] = useState('')
  const [interestRateInput, setInterestRateInput] = useState('')
  const [minPaymentInput, setMinPaymentInput] = useState('')
  const [dueDateInput, setDueDateInput] = useState('')
  
  const balance = parseLocalizedNumber(balanceInput) || 0
  const interestRate = parseLocalizedNumber(interestRateInput) || 0
  const minPayment = parseLocalizedNumber(minPaymentInput) || 0
  const dueDate = parseInt(dueDateInput) || null
  
  const resetForm = () => {
    setName('')
    setDebtType('credit_card')
    setBalanceInput('')
    setInterestRateInput('')
    setMinPaymentInput('')
    setDueDateInput('')
  }
  
  const handleClose = () => {
    resetForm()
    onClose()
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !balanceInput) {
      toast('error', t.planning.fillNameBalance)
      return
    }
    
    const parsedBalance = parseLocalizedNumber(balanceInput)
    if (parsedBalance === null || parsedBalance <= 0) {
      toast('error', t.planning.invalidBalance)
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const client = getSupabaseClient()
      if (!client) {
        toast('error', t.planning.dbConnectionFailed)
        setIsSubmitting(false)
        return
      }
      
      const { data: { user } } = await client.auth.getUser()
      if (!user) {
        toast('error', t.planning.pleaseLogin)
        setIsSubmitting(false)
        return
      }
      
      // Insert the debt as an account with negative balance (for credit cards) or positive (for loans that decrease)
      // Convention: debts are stored with positive balance representing amount owed
      const { error } = await client
        .from('accounts')
        .insert({
          user_id: user.id,
          name,
          type: debtType,
          balance: -Math.abs(parsedBalance), // Negative balance for debts
          interest_rate: interestRate > 0 ? interestRate : null,
          min_payment: minPayment > 0 ? minPayment : null,
          due_date: dueDate
        })
      
      if (error) {
        toast('error', error.message)
        setIsSubmitting(false)
        return
      }
      
      toast('success', t.planning.debtAdded)
      resetForm()
      router.refresh()
      onSuccess?.()
      onClose()
    } catch (e) {
      console.error('Add debt failed', e)
      toast('error', t.planning.addDebtFailed)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Sheet open={open} onClose={handleClose} title={t.planning.addDebt}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="debt-name" className="text-sm text-[var(--text-secondary)] mb-1 block">
            {t.planning.debtName} <span className="text-red-400">*</span>
          </label>
          <input
            id="debt-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: Visa, Auto Loan"
            className="w-full input"
            required
          />
        </div>
        
        {/* Debt Type */}
        <div>
          <label htmlFor="debt-type" className="text-sm text-[var(--text-secondary)] mb-1 block">
            {t.planning.debtType} <span className="text-red-400">*</span>
          </label>
          <select
            id="debt-type"
            value={debtType}
            onChange={(e) => setDebtType(e.target.value)}
            className="w-full input"
            required
          >
            {DEBT_TYPES.map((dt) => (
              <option key={dt.value} value={dt.value}>{dt.label}</option>
            ))}
          </select>
        </div>
        
        {/* Balance */}
        <div>
          <label htmlFor="debt-balance" className="text-sm text-[var(--text-secondary)] mb-1 block">
            {t.planning.balance} <span className="text-red-400">*</span>
          </label>
          <input
            id="debt-balance"
            type="text"
            inputMode="decimal"
            value={balanceInput}
            onChange={(e) => setBalanceInput(e.target.value)}
            placeholder="0,00"
            className="w-full input"
            required
          />
          {balance > 0 && (
            <div className="text-sm mt-1 text-red-400">
              {t.planning.youOwe} {formatCurrency(balance)}
            </div>
          )}
        </div>
        
        {/* Interest Rate */}
        <div>
          <label htmlFor="debt-interest" className="text-sm text-[var(--text-secondary)] mb-1 block">
            {t.planning.interestRate}
          </label>
          <input
            id="debt-interest"
            type="text"
            inputMode="decimal"
            value={interestRateInput}
            onChange={(e) => setInterestRateInput(e.target.value)}
            placeholder="ex: 19,9"
            className="w-full input"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {t.planning.interestRateNote}
          </p>
        </div>
        
        {/* Minimum Payment */}
        <div>
          <label htmlFor="debt-min-payment" className="text-sm text-[var(--text-secondary)] mb-1 block">
            {t.planning.minPayment}
          </label>
          <input
            id="debt-min-payment"
            type="text"
            inputMode="decimal"
            value={minPaymentInput}
            onChange={(e) => setMinPaymentInput(e.target.value)}
            placeholder="0,00"
            className="w-full input"
          />
        </div>
        
        {/* Due Date */}
        <div>
          <label htmlFor="debt-due-date" className="text-sm text-[var(--text-secondary)] mb-1 block">
            {t.planning.dueDay}
          </label>
          <input
            id="debt-due-date"
            type="number"
            min="1"
            max="31"
            value={dueDateInput}
            onChange={(e) => setDueDateInput(e.target.value)}
            placeholder="ex: 15"
            className="w-full input"
          />
        </div>
        
        {/* Submit */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            {t.common.cancel}
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? t.planning.adding : t.planning.addDebt}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
