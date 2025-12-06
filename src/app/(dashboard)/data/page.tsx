import React from 'react'
import AccountList from '../../../components/accounts/AccountList'
import TransactionListContainer from '../../../components/transactions/TransactionListContainer'
import { getTransactions } from '../../../lib/actions/transactions'
import type { Transaction } from '../../../components/transactions/types'
import { createClient } from '../../../lib/supabase/server'
import StatementUpload from '../../../components/upload/StatementUpload'
import SafeToSpendWidget from '../../../components/dashboard/SafeToSpendWidget'
import getSafeToSpend from '../../../lib/intelligence/safe-spend'
import type { Account } from '../../../lib/types'
import { DataHeader } from '../../../components/shared/PageHeader'

export default async function DataPage(){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let accounts: Account[] = []
  const txRes = await getTransactions({ page: 1, pageSize: 10 })
  const transactions = (txRes.data || []) as Transaction[]
  if (user) {
    const res = await supabase.from('accounts').select('*').eq('user_id', user.id)
    accounts = res.data || []
  }
  const safeToSpendData = user ? await getSafeToSpend(user!.id) : null

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <DataHeader />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar - Accounts, Safe to Spend, Upload */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
          <AccountList initialAccounts={accounts} />
          <SafeToSpendWidget data={safeToSpendData} />
          <StatementUpload accounts={accounts.map(a=>({ id: a.id, name: a.name }))} />
        </aside>

        {/* Main Content - Transactions */}
        <main className="lg:col-span-8 xl:col-span-9">
          <TransactionListContainer 
            initial={transactions} 
            pageSize={10} 
            accounts={accounts.map(a => ({ id: a.id, name: a.name }))} 
          />
        </main>
      </div>
    </div>
  )
}
