"use client"

import React from 'react'
import { FinancialBaseline } from '@/lib/planning/types'
import { PurchaseDecisionHelper } from '@/components/planning/PurchaseDecisionHelper'

interface Props {
  baseline: FinancialBaseline
}

export default function PurchasePageClient({ baseline }: Props) {
  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Purchase Advisor</h1>
        <p className="text-muted-foreground">
          Can you afford it? Let&apos;s analyze the impact on your financial health.
        </p>
      </div>
      
      <PurchaseDecisionHelper baseline={baseline} />
    </div>
  )
}
