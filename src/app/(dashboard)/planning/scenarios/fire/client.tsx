"use client"

import React, { useState, useEffect } from 'react'
import { FinancialBaseline } from '@/lib/planning/types'
import { FIREScenario, calculateEnhancedFIRE, calculateSensitivity, EnhancedFIREProjection } from '@/lib/planning/fire-enhanced'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { SensitivityChart } from '@/components/planning/SensitivityChart'
import { FIREScenarioComparison } from '@/components/planning/FIREScenarioComparison'
import { formatCurrency } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  baseline: FinancialBaseline
}

export default function FIREPageClient({ baseline }: Props) {
  const [scenario, setScenario] = useState<FIREScenario>({
    type: 'full',
    monthlySavings: baseline.monthlyIncome - baseline.monthlyExpenses,
    expectedReturn: 0.07,
    withdrawalRate: 0.04,
    targetAnnualSpending: baseline.monthlyExpenses * 12,
    currentAge: 30, // Default, should ideally come from profile
    retirementAge: 65
  })

  const [projection, setProjection] = useState<EnhancedFIREProjection | null>(null)
  const [sensitivity, setSensitivity] = useState<{ pessimistic: EnhancedFIREProjection, expected: EnhancedFIREProjection, optimistic: EnhancedFIREProjection } | null>(null)
  const [comparisons, setComparisons] = useState<EnhancedFIREProjection[]>([])

  useEffect(() => {
    const proj = calculateEnhancedFIRE(baseline.netWorth, scenario)
    setProjection(proj)
    setSensitivity(calculateSensitivity(baseline.netWorth, scenario))

    // Generate comparisons
    const full = calculateEnhancedFIRE(baseline.netWorth, { ...scenario, type: 'full' })
    const coast = calculateEnhancedFIRE(baseline.netWorth, { ...scenario, type: 'coast' })
    const barista = calculateEnhancedFIRE(baseline.netWorth, { 
      ...scenario, 
      type: 'barista',
      partTimeIncome: scenario.targetAnnualSpending * 0.4 // Assume 40% covered by part-time
    })
    setComparisons([coast, full, barista])

  }, [baseline, scenario])

  if (!projection || !sensitivity) return null

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">FIRE Simulator</h1>
        <p className="text-muted-foreground">
          Explore your path to Financial Independence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assumptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Monthly Savings</Label>
                  <span className="font-medium">{formatCurrency(scenario.monthlySavings)}</span>
                </div>
                <Slider 
                  value={[scenario.monthlySavings]} 
                  min={0} 
                  max={baseline.monthlyIncome} 
                  step={50}
                  onValueChange={([v]) => setScenario(s => ({ ...s, monthlySavings: v }))}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Target Annual Spending</Label>
                  <span className="font-medium">{formatCurrency(scenario.targetAnnualSpending)}</span>
                </div>
                <Slider 
                  value={[scenario.targetAnnualSpending]} 
                  min={12000} 
                  max={120000} 
                  step={1000}
                  onValueChange={([v]) => setScenario(s => ({ ...s, targetAnnualSpending: v }))}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Expected Return</Label>
                  <span className="font-medium">{(scenario.expectedReturn * 100).toFixed(1)}%</span>
                </div>
                <Slider 
                  value={[scenario.expectedReturn * 100]} 
                  min={2} 
                  max={12} 
                  step={0.5}
                  onValueChange={([v]) => setScenario(s => ({ ...s, expectedReturn: v / 100 }))}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Withdrawal Rate</Label>
                  <span className="font-medium">{(scenario.withdrawalRate * 100).toFixed(1)}%</span>
                </div>
                <Slider 
                  value={[scenario.withdrawalRate * 100]} 
                  min={2} 
                  max={6} 
                  step={0.1}
                  onValueChange={([v]) => setScenario(s => ({ ...s, withdrawalRate: v / 100 }))}
                />
              </div>
            </CardContent>
          </Card>

          <SensitivityChart {...sensitivity} />
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          <FIREScenarioComparison scenarios={comparisons} />

          <Card className="h-[400px]">
            <CardHeader>
              <CardTitle>Net Worth Projection</CardTitle>
              <CardDescription>Path to {formatCurrency(projection.fiNumber)}</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projection.series} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNW" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" tickFormatter={(val) => `Year ${val}`} />
                  <YAxis tickFormatter={(val) => `€${val / 1000}k`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip formatter={(val: number) => formatCurrency(val)} labelFormatter={(label) => `Year ${label}`} />
                  <Area 
                    type="monotone" 
                    dataKey="netWorth" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorNW)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
