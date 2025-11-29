"use client"
import React, { useState } from 'react'
import type { Account as AccountType } from '../../lib/types'
import Button from '../ui/Button'
import AccountFormComponent from './AccountForm'
import DeleteAccountDialog from './DeleteAccountDialog'

type Account = AccountType

export default function AccountList({ initialAccounts }: { initialAccounts: Account[] }) {
  const [accounts] = useState<Account[]>(initialAccounts || [])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [deleting, setDeleting] = useState<Account | null>(null)
  // router is not used in this component; server actions perform revalidation

  // If the parent refreshes, this component will not automatically update. We rely
  // on server action calls triggering route refresh via router.refresh() in forms.

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Accounts</h2>
        <Button onClick={() => { setEditing(null); setShowForm(true) }}>Add Account</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {accounts.length === 0 && (
          <div className="p-6 border rounded-md text-center">
            <p>No accounts yet</p>
            <Button onClick={() => setShowForm(true)} className="mt-3">Add one</Button>
          </div>
        )}
        {accounts.map(a => (
          <div key={a.id} className="p-4 border rounded-md flex justify-between items-start">
            <div>
              <div className="text-sm text-muted-foreground">{a.type}</div>
              <div className="font-medium">{a.name}</div>
              <div className="text-sm text-slate-600">{a.institution}</div>
              <div className="mt-2 font-semibold">{typeof a.balance === 'number' ? a.balance.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' }) : a.balance}</div>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="ghost" onClick={() => { setEditing(a); setShowForm(true) }}>Edit</Button>
              <Button variant="ghost" onClick={() => setDeleting(a)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white p-4 rounded-md w-full max-w-lg">
            <AccountFormComponent
              initial={editing ? {
                name: editing.name,
                institution: editing.institution || '',
                type: editing.type,
                balance: typeof editing.balance === 'number' ? editing.balance.toString() : (editing.balance || '0.00')
              } : undefined}
              accountId={editing?.id}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white p-4 rounded-md w-full max-w-md">
            <DeleteAccountDialog accountId={deleting.id} onClose={() => setDeleting(null)} />
          </div>
        </div>
      )}
    </div>
  )
}
