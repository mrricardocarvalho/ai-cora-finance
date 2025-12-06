"use client"

import React, { useState, useMemo } from 'react'
import { FinancialBaseline, ScenarioModification } from '@/lib/planning/types'
import { calculateScenario, compareScenarios } from '@/lib/planning/scenario-engine'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Calendar, DollarSign, RefreshCw, Baby, ShoppingBag, Flame } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import Link from 'next/link'
import { IncomeScenarioSimulator } from '@/components/planning/IncomeScenarioSimulator'
import { ExpenseScenarioSimulator } from '@/components/planning/ExpenseScenarioSimulator'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface Props {
  baseline: FinancialBaseline
}

export default function ScenarioPageClient({ baseline }: Props) {
  const [modifications, setModifications] = useState<ScenarioModification[]>([])
  const [activeTab, setActiveTab] = useState('income')

  // Calculate Projections
  const baselineProjection = useMemo(() => 
    calculateScenario(baseline, [], 60), 
  [baseline])

  const modifiedProjection = useMemo(() => 
    calculateScenario(baseline, modifications, 60), 
  [baseline, modifications])

  const comparison = useMemo(() => 
    compareScenarios(baselineProjection, modifiedProjection), 
  [baselineProjection, modifiedProjection])

  // Chart Data
  const chartData = useMemo(() => {
    return baselineProjection.months.map((m, i) => ({
      month: format(m.date, 'MMM yy'),
      Baseline: m.netWorth,
      Scenario: modifiedProjection.months[i]?.netWorth || 0
    }))
  }, [baselineProjection, modifiedProjection])

  const handleReset = () => setModifications([])

  const updateModifications = (newMods: ScenarioModification[]) => {
    setModifications(newMods)
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">What-If Simulator</h1>
          <p className="text-muted-foreground">
            Model how changes to your income and expenses impact your financial future.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/planning/scenarios/fire">
            <Button variant="secondary">
              <Flame className="mr-2 h-4 w-4" />
              FIRE Sim
            </Button>
          </Link>
          <Link href="/planning/scenarios/purchase">
            <Button variant="secondary">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Purchase Advisor
            </Button>
          </Link>
          <Link href="/planning/scenarios/life-events">
            <Button variant="secondary">
              <Baby className="mr-2 h-4 w-4" />
              Life Events
            </Button>
          </Link>
          <Button variant="outline" onClick={handleReset} disabled={modifications.length === 0}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Scenarios
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Controls</CardTitle>
              <CardDescription>Adjust parameters below</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="income">Income</TabsTrigger>
                  <TabsTrigger value="expense">Expenses</TabsTrigger>
                </TabsList>
                
                <TabsContent value="income">
                  <IncomeScenarioSimulator 
                    baselineIncome={baseline.monthlyIncome}
                    modifications={modifications}
                    onChange={updateModifications}
                  />
                </TabsContent>
                
                <TabsContent value="expense">
                  <ExpenseScenarioSimulator 
                    baselineExpenses={baseline.monthlyExpenses}
                    modifications={modifications}
                    onChange={updateModifications}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Active Modifications List */}
          {modifications.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Active Changes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {modifications.map((mod, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
                    <span>{mod.description}</span>
                    <Badge variant={mod.type === 'income' ? 'default' : 'secondary'}>
                      {mod.type}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <DollarSign className="h-4 w-4" />
                  Net Worth (5y)
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(modifiedProjection.endNetWorth)}
                </div>
                <div className={`text-xs font-medium flex items-center ${comparison.netWorthDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparison.netWorthDelta >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {comparison.netWorthDelta >= 0 ? '+' : ''}{formatCurrency(comparison.netWorthDelta)} vs baseline
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  FIRE Date
                </div>
                <div className="text-2xl font-bold">
                  {modifiedProjection.fireDate ? format(modifiedProjection.fireDate, 'MMM yyyy') : 'N/A'}
                </div>
                <div className={`text-xs font-medium flex items-center ${comparison.fireDateDeltaMonths <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparison.fireDateDeltaMonths === 0 ? 'No change' : 
                   comparison.fireDateDeltaMonths < 0 ? `${Math.abs(comparison.fireDateDeltaMonths)} months sooner` : 
                   `${comparison.fireDateDeltaMonths} months later`}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  Monthly Savings
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(modifiedProjection.months[0].savings)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Initial projected savings
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card className="h-[400px]">
            <CardHeader>
              <CardTitle>Net Worth Projection</CardTitle>
              <CardDescription>Baseline vs. Scenario (5 Years)</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorScenario" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `€${value / 1000}k`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="Baseline" 
                    stroke="#8884d8" 
                    fillOpacity={1} 
                    fill="url(#colorBaseline)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Scenario" 
                    stroke="#82ca9d" 
                    fillOpacity={1} 
                    fill="url(#colorScenario)" 
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
