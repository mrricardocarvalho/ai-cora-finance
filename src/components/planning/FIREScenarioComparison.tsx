"use client"

import React from 'react'
import { EnhancedFIREProjection } from '@/lib/planning/fire-enhanced'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface Props {
  scenarios: EnhancedFIREProjection[]
}

export function FIREScenarioComparison({ scenarios }: Props) {
  if (scenarios.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {scenarios.map((scenario, idx) => (
        <Card key={idx} className={idx === 1 ? 'border-primary shadow-md' : ''}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg capitalize">{scenario.type} FIRE</CardTitle>
              {idx === 1 && <Badge>Selected</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Target Number</div>
              <div className="text-xl font-bold">{formatCurrency(scenario.fiNumber)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Time to FIRE</div>
              <div className="text-xl font-bold text-primary">
                {scenario.yearsToFI !== null ? `${scenario.yearsToFI} Years` : 'Never'}
              </div>
            </div>
            {scenario.type === 'coast' && (
              <div className="pt-2 border-t text-xs text-muted-foreground">
                Coast Number: <span className="font-medium text-foreground">{formatCurrency(scenario.coastFireNumber || 0)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
