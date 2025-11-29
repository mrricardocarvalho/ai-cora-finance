import React from 'react'
import InsightCard from '../components/InsightCard'
import TransactionList from '../components/TransactionList'
import { Button } from '../components/ui'

type Insight = { id: number; priority: 'urgent' | 'opportunity' | 'tax' | 'info'; title: string; message: string; timestamp: string }
const insights: Insight[] = [
  { id: 1, priority: 'urgent', title: 'Projected to hit floor in 4 days.', message: 'Adjust spending or transfer funds to avoid hitting comfort floor.', timestamp: '2025-11-28' },
  { id: 2, priority: 'opportunity', title: 'Netflix subscription unused for 3 months.', message: 'Cancel or share subscription to save €12/month.', timestamp: '2025-11-20' },
  { id: 3, priority: 'tax', title: 'Upload health receipts for IRS.', message: 'You may be eligible for deductions.', timestamp: '2025-11-10' },
]

type Transaction = { id: string; merchant: string; date: string; amount: number; category: string }
const transactions: Transaction[] = [
  { id: 't1', merchant: 'Moey', date: '2025-11-25', amount: -15.3, category: 'Subscriptions' },
  { id: 't2', merchant: 'ActivoBank', date: '2025-11-22', amount: 250.0, category: 'Income' },
  { id: 't3', merchant: 'Supermarket', date: '2025-11-21', amount: -45.6, category: 'Groceries' },
]

export default function Page() {
  return (
    <div className="p-4">
      <header className="mb-6">
        <div className="rounded-md p-6 mb-4 bg-primary text-primary-foreground">
          <h1 className="text-2xl font-semibold">Hello Cora</h1>
          <p className="mt-1">Welcome to Cora Finance — your personal financial assistant.</p>
          <div className="mt-4">
            <Button>Get Started</Button>
          </div>
        </div>
        <h2 className="text-2xl font-semibold">Cora Finance — Home</h2>
        <div className="mt-2 flex gap-4">
          <div className="health card">Health: <strong>78/100</strong></div>
          <div className="safe card">Safe-to-Spend: <strong>420,00 €</strong></div>
        </div>
      </header>

      <section className="mb-6">
        <h2 className="text-lg mb-2">Insights</h2>
        <div className="space-y-3">
          {insights.map((i) => (
            <InsightCard key={i.id} priority={i.priority} title={i.title} message={i.message} timestamp={i.timestamp} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg mb-2">Recent Transactions</h2>
        <TransactionList items={transactions} />
      </section>
    </div>
  )
}
