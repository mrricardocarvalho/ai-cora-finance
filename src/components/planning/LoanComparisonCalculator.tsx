"use client"

import React, { useState, useMemo } from 'react'
import { Plus, Trash2, Calculator, TrendingDown, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { calculateLoan, type LoanScenario, type LoanCalculation } from '@/lib/planning/loan-calculator'
import { formatCurrency } from '@/lib/utils'
import { useTranslations } from '@/lib/i18n'

const DEFAULT_SCENARIO: LoanScenario = {
  id: '1',
  name: 'Loan A',
  principal: 10000,
  annualRate: 5.0,
  termMonths: 48,
  fees: 0
}

export function LoanComparisonCalculator() {
  const t = useTranslations()
  const [scenarios, setScenarios] = useState<LoanScenario[]>([DEFAULT_SCENARIO])
  const [activeTab, setActiveTab] = useState<string>('comparison')

  const addScenario = () => {
    if (scenarios.length >= 3) return
    const id = Math.random().toString(36).substr(2, 9)
    setScenarios([
      ...scenarios,
      {
        ...DEFAULT_SCENARIO,
        id,
        name: `Loan ${String.fromCharCode(65 + scenarios.length)}`
      }
    ])
  }

  const removeScenario = (id: string) => {
    if (scenarios.length <= 1) return
    setScenarios(scenarios.filter(s => s.id !== id))
  }

  const updateScenario = (id: string, field: keyof LoanScenario, value: string | number) => {
    setScenarios(scenarios.map(s => {
      if (s.id !== id) return s
      return { ...s, [field]: value }
    }))
  }

  const results = useMemo(() => {
    return scenarios.map(s => ({
      scenario: s,
      result: calculateLoan(s.principal, s.annualRate, s.termMonths, s.fees)
    }))
  }, [scenarios])

  const bestOption = useMemo(() => {
    if (results.length === 0) return null
    // Find lowest total cost
    return results.reduce((prev, curr) => 
      curr.result.totalCost < prev.result.totalCost ? curr : prev
    )
  }, [results])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scenario, index) => (
          <Card key={scenario.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <Input 
                  value={scenario.name} 
                  onChange={(e) => updateScenario(scenario.id, 'name', e.target.value)}
                  className="font-semibold text-lg h-8 w-32 px-1"
                />
                {scenarios.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeScenario(scenario.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t.planning.loanCalculator.amount}</Label>
                <Input 
                  type="number" 
                  value={scenario.principal} 
                  onChange={(e) => updateScenario(scenario.id, 'principal', Number(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t.planning.loanCalculator.rate}</Label>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={scenario.annualRate} 
                    onChange={(e) => updateScenario(scenario.id, 'annualRate', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t.planning.loanCalculator.months}</Label>
                  <Input 
                    type="number" 
                    value={scenario.termMonths} 
                    onChange={(e) => updateScenario(scenario.id, 'termMonths', Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t.planning.loanCalculator.fees}</Label>
                <Input 
                  type="number" 
                  value={scenario.fees} 
                  onChange={(e) => updateScenario(scenario.id, 'fees', Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        ))}
        
        {scenarios.length < 3 && (
          <Button 
            variant="outline" 
            className="h-full min-h-[280px] border-dashed flex flex-col gap-2"
            onClick={addScenario}
          >
            <Plus className="h-8 w-8" />
            {t.planning.loanCalculator.addScenario}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {t.planning.loanCalculator.comparison}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="comparison">{t.planning.loanCalculator.comparison}</TabsTrigger>
              <TabsTrigger value="schedule">{t.planning.loanCalculator.schedule}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="comparison">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      {results.map(({ scenario }) => (
                        <TableHead key={scenario.id} className="min-w-[120px]">
                          {scenario.name}
                          {bestOption?.scenario.id === scenario.id && (
                            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                              {t.planning.loanCalculator.bestValue}
                            </Badge>
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">{t.planning.loanCalculator.monthlyPayment}</TableCell>
                      {results.map(({ result, scenario }) => (
                        <TableCell key={scenario.id} className="font-bold text-lg">
                          {formatCurrency(result.monthlyPayment)}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t.planning.loanCalculator.totalInterest}</TableCell>
                      {results.map(({ result, scenario }) => (
                        <TableCell key={scenario.id} className="text-muted-foreground">
                          {formatCurrency(result.totalInterest)}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t.planning.loanCalculator.totalCost}</TableCell>
                      {results.map(({ result, scenario }) => (
                        <TableCell key={scenario.id} className={bestOption?.scenario.id === scenario.id ? "text-green-600 font-bold" : ""}>
                          {formatCurrency(result.totalCost)}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t.planning.loanCalculator.effectiveAPR}</TableCell>
                      {results.map(({ result, scenario }) => (
                        <TableCell key={scenario.id}>
                          {result.effectiveAPR.toFixed(2)}%
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              {bestOption && results.length > 1 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <TrendingDown className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800">{t.planning.loanCalculator.recommendation} {bestOption.scenario.name}</h4>
                    <p className="text-sm text-green-700 mt-1">
                      {t.planning.loanCalculator.saveText} <span className="font-bold">{formatCurrency(Math.max(...results.map(r => r.result.totalCost)) - bestOption.result.totalCost)}</span>.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="schedule">
              <div className="space-y-8">
                {results.map(({ scenario, result }) => (
                  <div key={scenario.id}>
                    <h3 className="font-semibold mb-2">{scenario.name}</h3>
                    <div className="max-h-[300px] overflow-y-auto border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[80px]">#</TableHead>
                            <TableHead>{t.planning.loanCalculator.monthlyPayment}</TableHead>
                            <TableHead>Principal</TableHead>
                            <TableHead>Juros</TableHead>
                            <TableHead>Saldo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.amortizationSchedule.map((row) => (
                            <TableRow key={row.month}>
                              <TableCell>{row.month}</TableCell>
                              <TableCell>{formatCurrency(row.payment)}</TableCell>
                              <TableCell>{formatCurrency(row.principal)}</TableCell>
                              <TableCell>{formatCurrency(row.interest)}</TableCell>
                              <TableCell>{formatCurrency(row.remainingBalance)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
