"use client"

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Button from '@/components/ui/button';
import { Debt, simulateExtraPayments } from '@/lib/planning/debt-simulator';
import { DebtComparisonChart } from './DebtComparisonChart';
import { format } from 'date-fns';
import { ArrowRight, TrendingDown, Calendar, PiggyBank, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExtraPaymentSimulatorProps {
  debts: Debt[];
}

export function ExtraPaymentSimulator({ debts }: ExtraPaymentSimulatorProps) {
  const [extraPayment, setExtraPayment] = useState(100);
  const [strategy, setStrategy] = useState<'avalanche' | 'snowball' | 'specific'>('avalanche');
  const [specificDebtId, setSpecificDebtId] = useState<string>(debts[0]?.id || '');

  const simulation = useMemo(() => {
    return simulateExtraPayments(debts, extraPayment, strategy, specificDebtId);
  }, [debts, extraPayment, strategy, specificDebtId]);

  if (debts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No debts found to simulate.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Extra Payment Simulator</CardTitle>
          <CardDescription>
            See how much time and money you can save by paying a little extra each month.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Extra Monthly Payment</Label>
                <span className="font-bold text-primary">€{extraPayment}</span>
              </div>
              <Slider 
                value={[extraPayment]} 
                onValueChange={(vals) => setExtraPayment(vals[0])} 
                max={1000} 
                step={10} 
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>€0</span>
                <span>€500</span>
                <span>€1,000</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Strategy</Label>
              <Tabs value={strategy} onValueChange={(v) => setStrategy(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="avalanche">Avalanche</TabsTrigger>
                  <TabsTrigger value="snowball">Snowball</TabsTrigger>
                  <TabsTrigger value="specific">Specific</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {strategy === 'specific' && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Target Debt First</Label>
                  <select 
                    aria-label="Select specific debt to target"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={specificDebtId}
                    onChange={(e) => setSpecificDebtId(e.target.value)}
                  >
                    {debts.map(d => (
                      <option key={d.id} value={d.id}>{d.name} (Bal: €{d.balance.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Summary Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-900/50">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-1">
                <PiggyBank className="h-4 w-4" />
                <span className="text-sm font-medium">Interest Saved</span>
              </div>
              <div className="text-2xl font-bold text-green-800 dark:text-green-300">
                €{simulation.interestSaved.toLocaleString()}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Time Saved</span>
              </div>
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                {simulation.monthsSaved} months
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                

          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={() => alert("Plan saved! (This would save to your goals)")}>
              <Save className="mr-2 h-4 w-4" />
              Save Plan as Goal
            </Button>
          </div>Debt free by {format(simulation.payoffDate, 'MMM yyyy')}
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-900/50">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-1">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm font-medium">New Payoff Date</span>
              </div>
              <div className="text-2xl font-bold text-amber-800 dark:text-amber-300">
                {format(simulation.payoffDate, 'MMM yyyy')}
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                vs {format(simulation.originalPayoffDate, 'MMM yyyy')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <DebtComparisonChart simulation={simulation} />

      {/* Per Debt Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Payoff Timeline by Debt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Debt Name</th>
                  <th className="p-3 text-left font-medium">Current Payoff</th>
                  <th className="p-3 text-left font-medium">New Payoff</th>
                  <th className="p-3 text-right font-medium">Interest Paid</th>
                </tr>
              </thead>
              <tbody>
                {simulation.perDebtBreakdown.map((debt) => {
                  const baselineDebt = simulation.baseline.perDebtBreakdown.find(d => d.id === debt.id);
                  return (
                    <tr key={debt.id} className="border-b last:border-0">
                      <td className="p-3 font-medium">{debt.name}</td>
                      <td className="p-3 text-muted-foreground">
                        {baselineDebt ? format(baselineDebt.payoffDate, 'MMM yyyy') : '-'}
                      </td>
                      <td className="p-3 text-green-600 font-medium">
                        {format(debt.payoffDate, 'MMM yyyy')}
                      </td>
                      <td className="p-3 text-right">
                        €{debt.interestPaid.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
