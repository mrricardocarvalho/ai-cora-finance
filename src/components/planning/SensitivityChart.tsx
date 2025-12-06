"use client"

import React from 'react'
import { EnhancedFIREProjection } from '@/lib/planning/fire-enhanced'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Props {
  pessimistic: EnhancedFIREProjection
  expected: EnhancedFIREProjection
  optimistic: EnhancedFIREProjection
}

export function SensitivityChart({ pessimistic, expected, optimistic }: Props) {
  const getYears = (p: EnhancedFIREProjection) => p.yearsToFI ?? 'Never'
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Sensitivity Analysis</CardTitle>
        <CardDescription>How market returns impact your timeline</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="flex justify-center mb-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-sm font-medium text-red-700">Pessimistic (5%)</div>
            <div className="text-2xl font-bold text-red-900 mt-1">{getYears(pessimistic)}</div>
            <div className="text-xs text-red-600">Years to FIRE</div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex justify-center mb-2">
              <Minus className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-sm font-medium text-blue-700">Expected (7%)</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">{getYears(expected)}</div>
            <div className="text-xs text-blue-600">Years to FIRE</div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="flex justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-sm font-medium text-green-700">Optimistic (9%)</div>
            <div className="text-2xl font-bold text-green-900 mt-1">{getYears(optimistic)}</div>
            <div className="text-xs text-green-600">Years to FIRE</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
