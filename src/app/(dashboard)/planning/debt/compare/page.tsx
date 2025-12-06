import React from 'react'
import { LoanComparisonCalculator } from '@/components/planning/LoanComparisonCalculator'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LoanComparisonPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/planning/debt">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loan Comparison Calculator</h1>
          <p className="text-muted-foreground">
            Compare different loan scenarios to find the best option for your financial goals.
          </p>
        </div>
      </div>

      <LoanComparisonCalculator />
    </div>
  )
}
