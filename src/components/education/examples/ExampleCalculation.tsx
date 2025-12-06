"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator } from 'lucide-react'

interface ExampleCalculationProps {
  type: string
}

export function ExampleCalculation({ type }: ExampleCalculationProps) {
  // Render the appropriate calculator based on the concept slug
  switch (type) {
    case 'compound-interest':
      return <CompoundInterestCalculator />
    case 'emergency-fund':
      return <EmergencyFundCalculator />
    case '50-30-20-rule':
      return <Rule503020Calculator />
    case 'savings-rate':
      return <SavingsRateCalculator />
    default:
      return null
  }
}

function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState(1000)
  const [rate, setRate] = useState(7)
  const [years, setYears] = useState(10)
  const [monthly, setMonthly] = useState(100)
  const [result, setResult] = useState(0)

  useEffect(() => {
    // A = P(1 + r/n)^(nt) + PMT * ...
    // Simplified: Monthly compounding
    const r = rate / 100 / 12
    const n = 12
    const t = years
    
    const futureValuePrincipal = principal * Math.pow(1 + r, n * t)
    const futureValueSeries = monthly * ((Math.pow(1 + r, n * t) - 1) / r)
    
    setResult(futureValuePrincipal + futureValueSeries)
  }, [principal, rate, years, monthly])

  return (
    <Card className="mt-6 border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Interactive Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Initial Investment (€)</Label>
            <Input 
              type="number" 
              value={principal} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrincipal(Number(e.target.value))} 
            />
          </div>
          <div className="space-y-2">
            <Label>Monthly Contribution (€)</Label>
            <Input 
              type="number" 
              value={monthly} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMonthly(Number(e.target.value))} 
            />
          </div>
          <div className="space-y-2">
            <Label>Annual Return (%)</Label>
            <Input 
              type="number" 
              value={rate} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRate(Number(e.target.value))} 
            />
          </div>
          <div className="space-y-2">
            <Label>Time Period (Years)</Label>
            <Input 
              type="number" 
              value={years} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYears(Number(e.target.value))} 
            />
          </div>
        </div>
        
        <div className="pt-4 border-t border-primary/10">
          <div className="flex justify-between items-end">
            <span className="text-sm text-muted-foreground">Total Value after {years} years:</span>
            <span className="text-2xl font-bold text-primary">
              {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(result)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Total Invested: {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(principal + (monthly * 12 * years))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmergencyFundCalculator() {
  const [expenses, setExpenses] = useState(1000)

  return (
    <Card className="mt-6 border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Emergency Fund Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Monthly Essential Expenses (€)</Label>
          <Input 
            type="number" 
            value={expenses} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpenses(Number(e.target.value))} 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-3 bg-background rounded-lg border text-center">
            <div className="text-xs text-muted-foreground mb-1">Minimum (3 Months)</div>
            <div className="text-xl font-bold text-primary">
              {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(expenses * 3)}
            </div>
          </div>
          <div className="p-3 bg-background rounded-lg border text-center">
            <div className="text-xs text-muted-foreground mb-1">Recommended (6 Months)</div>
            <div className="text-xl font-bold text-primary">
              {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(expenses * 6)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Rule503020Calculator() {
  const [income, setIncome] = useState(1500)

  return (
    <Card className="mt-6 border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          50/30/20 Splitter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Net Monthly Income (€)</Label>
          <Input 
            type="number" 
            value={income} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncome(Number(e.target.value))} 
          />
        </div>
        
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center p-2 bg-background rounded border-l-4 border-l-blue-500">
            <span className="font-medium">Needs (50%)</span>
            <span className="font-bold">{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(income * 0.5)}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-background rounded border-l-4 border-l-purple-500">
            <span className="font-medium">Wants (30%)</span>
            <span className="font-bold">{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(income * 0.3)}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-background rounded border-l-4 border-l-green-500">
            <span className="font-medium">Savings (20%)</span>
            <span className="font-bold">{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(income * 0.2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SavingsRateCalculator() {
  const [income, setIncome] = useState(2000)
  const [expenses, setExpenses] = useState(1500)
  
  const savings = income - expenses
  const rate = income > 0 ? (savings / income) * 100 : 0

  return (
    <Card className="mt-6 border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Savings Rate Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Income (€)</Label>
            <Input 
              type="number" 
              value={income} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncome(Number(e.target.value))} 
            />
          </div>
          <div className="space-y-2">
            <Label>Expenses (€)</Label>
            <Input 
              type="number" 
              value={expenses} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpenses(Number(e.target.value))} 
            />
          </div>
        </div>
        
        <div className="pt-4 text-center">
          <div className="text-sm text-muted-foreground mb-1">Your Savings Rate</div>
          <div className={`text-3xl font-bold ${rate >= 20 ? 'text-green-600' : rate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
            {rate.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {rate >= 20 ? 'Great job! You are on the fast track.' : rate >= 10 ? 'Good start, try to aim for 20%.' : 'Try to reduce expenses to save more.'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
