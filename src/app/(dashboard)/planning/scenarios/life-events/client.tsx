"use client"

import React, { useState, useMemo } from 'react'
import { FinancialBaseline } from '@/lib/planning/types'
import { calculateScenario } from '@/lib/planning/scenario-engine'
import { LIFE_EVENT_TEMPLATES } from '@/lib/planning/life-events'
import { LifeEventSimulator, AddedLifeEvent } from '@/components/planning/LifeEventSimulator'
import { EventTimeline } from '@/components/planning/EventTimeline'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info, AlertTriangle } from 'lucide-react'

interface Props {
  baseline: FinancialBaseline
}

export default function LifeEventPageClient({ baseline }: Props) {
  const [events, setEvents] = useState<AddedLifeEvent[]>([])

  // 1. Convert UI events to engine modifications
  const modifications = useMemo(() => {
    return events.flatMap(event => {
      const template = LIFE_EVENT_TEMPLATES.find(t => t.id === event.templateId)
      if (!template) return []
      
      const baseMods = template.defaultModifications(event.params)
      
      return baseMods.map(mod => ({
        ...mod,
        startMonth: (mod.startMonth || 0) + event.startMonth,
        endMonth: mod.endMonth !== undefined ? mod.endMonth + event.startMonth : undefined
      }))
    })
  }, [events])

  // 2. Calculate projections
  const baselineProjection = useMemo(() => calculateScenario(baseline, []), [baseline])
  const scenarioProjection = useMemo(() => calculateScenario(baseline, modifications), [baseline, modifications])

  // 3. Merge data for charts
  const chartData = useMemo(() => {
    return baselineProjection.months.map((base, i) => {
      const scenario = scenarioProjection.months[i]
      return {
        month: i,
        label: new Date(new Date().setMonth(new Date().getMonth() + i)).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
        BaselineNetWorth: base.netWorth,
        ScenarioNetWorth: scenario.netWorth,
        BaselineSavings: base.savings,
        ScenarioSavings: scenario.savings,
        BaselineDebt: base.debt,
        ScenarioDebt: scenario.debt,
      }
    })
  }, [baselineProjection, scenarioProjection])

  // 4. Calculate impact summary
  const finalBaseline = baselineProjection.months[baselineProjection.months.length - 1]
  const finalScenario = scenarioProjection.months[scenarioProjection.months.length - 1]
  const netWorthImpact = finalScenario.netWorth - finalBaseline.netWorth

  // 5. Risk Analysis
  const riskAnalysis = useMemo(() => {
    const risks: string[] = []
    let savingsDepletedMonth = -1

    for (let i = 0; i < scenarioProjection.months.length; i++) {
      if (scenarioProjection.months[i].savings < 0 && savingsDepletedMonth === -1) {
        savingsDepletedMonth = i
      }
    }

    if (savingsDepletedMonth !== -1) {
      const date = new Date()
      date.setMonth(date.getMonth() + savingsDepletedMonth)
      risks.push(`⚠️ Your savings would be depleted by ${date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}.`)
    }

    // Check if savings drop significantly below baseline (e.g. > 50% drop)
    const finalSavingsDrop = finalBaseline.savings - finalScenario.savings
    if (finalSavingsDrop > finalBaseline.savings * 0.5 && finalScenario.savings > 0) {
      risks.push(`⚠️ Your projected savings in 5 years are ${Math.round((finalScenario.savings / finalBaseline.savings) * 100)}% lower than baseline.`)
    }

    return risks
  }, [scenarioProjection, finalBaseline, finalScenario])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Simulator Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Life Events</CardTitle>
              <CardDescription>
                Add major events to see how they impact your long-term financial health.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LifeEventSimulator onEventsChange={setEvents} />
            </CardContent>
          </Card>

          {events.length > 0 && (
            <>
              <EventTimeline events={events} />

              {riskAnalysis.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Risk Warning</AlertTitle>
                  <AlertDescription className="mt-2 space-y-1">
                    {riskAnalysis.map((risk, i) => (
                      <div key={i} className="text-sm">{risk}</div>
                    ))}
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Impact Analysis</AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Net Worth (5 Years):</span>
                    <span className={netWorthImpact >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                      {netWorthImpact > 0 ? '+' : ''}{formatCurrency(netWorthImpact)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    vs. doing nothing
                  </div>
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>

        {/* Right Column: Projections */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Financial Projection (5 Years)</CardTitle>
              <CardDescription>Comparing your current trajectory vs. with life events</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="networth" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="networth">Net Worth</TabsTrigger>
                  <TabsTrigger value="savings">Savings</TabsTrigger>
                  <TabsTrigger value="debt">Debt</TabsTrigger>
                </TabsList>

                <TabsContent value="networth" className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBaseNW" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorScenNW" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" />
                      <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <Tooltip formatter={(val: number) => formatCurrency(val)} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="BaselineNetWorth" 
                        name="Baseline" 
                        stroke="#94a3b8" 
                        fillOpacity={1} 
                        fill="url(#colorBaseNW)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="ScenarioNetWorth" 
                        name="With Events" 
                        stroke="#2563eb" 
                        fillOpacity={1} 
                        fill="url(#colorScenNW)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="savings" className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <XAxis dataKey="label" />
                      <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <Tooltip formatter={(val: number) => formatCurrency(val)} />
                      <Legend />
                      <Area type="monotone" dataKey="BaselineSavings" name="Baseline" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} />
                      <Area type="monotone" dataKey="ScenarioSavings" name="With Events" stroke="#16a34a" fill="#16a34a" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="debt" className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <XAxis dataKey="label" />
                      <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <Tooltip formatter={(val: number) => formatCurrency(val)} />
                      <Legend />
                      <Area type="monotone" dataKey="BaselineDebt" name="Baseline" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} />
                      <Area type="monotone" dataKey="ScenarioDebt" name="With Events" stroke="#dc2626" fill="#dc2626" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
