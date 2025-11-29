import React from 'react'
import AccountList from '../../../components/accounts/AccountList'
import TransactionListContainer from '../../../components/transactions/TransactionListContainer'
import { getTransactions } from '../../../lib/actions/transactions'
import type { Transaction } from '../../../components/transactions/types'
import { createClient } from '../../../lib/supabase/server'
import StatementUpload from '../../../components/upload/StatementUpload'
import type { Account } from '../../../lib/types'

export default async function DataPage(){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let accounts: Account[] = []
  const txRes = await getTransactions({ page: 1, pageSize: 20 })
  const transactions = (txRes.data || []) as Transaction[]
  if (user) {
    const res = await supabase.from('accounts').select('*')
    accounts = res.data || []
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Data</h1>
      <p className="mt-2 text-slate-600">Manage accounts and transactions.</p>
      <div className="mt-4 lg:grid lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-1">
          <AccountList initialAccounts={accounts} />
          <div className="mt-4">
            <StatementUpload accounts={accounts.map(a=>({ id: a.id, name: a.name }))} />
          </div>
        </div>
        <div className="mt-6 lg:mt-0 lg:col-span-2">
          <TransactionListContainer initial={transactions} pageSize={20} />
        </div>
      </div>
    </div>
  )
}
