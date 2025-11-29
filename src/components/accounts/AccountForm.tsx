"use client"
import React, { useState } from 'react'
import { AccountForm } from '../../lib/validations/accounts'
import { createAccount, updateAccount } from '../../lib/actions/accounts'
import { useRouter } from 'next/navigation'
import Button from '../ui/Button'

type Props = {
  initial?: Partial<AccountForm>
  accountId?: string
  onClose?: () => void
}

export default function AccountFormComponent({ initial, accountId, onClose }: Props) {
  const router = useRouter()
  const uid = React.useId()
  const [form, setForm] = useState<AccountForm>({
    name: initial?.name || '',
    institution: initial?.institution || '',
    type: initial?.type ?? 'checking',
    balance: initial?.balance || '0.00'
  })
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (accountId) {
        await updateAccount(accountId, form as AccountForm)
        window.alert('Account updated')
      } else {
        await createAccount(form as AccountForm)
        window.alert('Account created')
      }
      router.refresh()
      onClose?.()
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor={`account-name-${uid}`} className="block text-sm font-medium">Name</label>
        <input id={`account-name-${uid}`} title="Account name" placeholder="e.g., My Checking Account" value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} className="mt-1 block w-full" />
      </div>
      <div>
        <label htmlFor={`account-institution-${uid}`} className="block text-sm font-medium">Institution</label>
        <input id={`account-institution-${uid}`} title="Institution" placeholder="e.g., Moey" value={form.institution} onChange={(e)=>setForm({ ...form, institution: e.target.value })} className="mt-1 block w-full" />
      </div>
      <div>
        <label htmlFor={`account-type-${uid}`} className="block text-sm font-medium">Type</label>
        <select id={`account-type-${uid}`} title="Account type" value={form.type} onChange={(e)=>setForm({ ...form, type: e.target.value as AccountForm['type'] })} className="mt-1 block w-full">
          <option value="checking">Conta à Ordem</option>
          <option value="savings">Conta Poupança</option>
          <option value="credit_card">Cartão de Crédito</option>
          <option value="loan">Empréstimo</option>
          <option value="broker">Investimentos</option>
        </select>
      </div>
      <div>
        <label htmlFor={`account-balance-${uid}`} className="block text-sm font-medium">Balance</label>
        <input id={`account-balance-${uid}`} title="Balance" placeholder="0.00" value={form.balance} onChange={(e)=>setForm({ ...form, balance: e.target.value })} className="mt-1 block w-full" />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (accountId ? 'Update Account' : 'Add Account')}</Button>
      </div>
    </form>
  )
}
