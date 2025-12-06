"use client"

import React, { useState, useEffect } from 'react'
import { FinancialBaseline } from '@/lib/planning/types'
import { PurchaseScenario, analyzePurchase, PurchaseAnalysis, PURCHASE_TEMPLATES } from '@/lib/planning/purchase-advisor'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, AlertTriangle, XCircle, PiggyBank, Calculator, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Props {
  baseline: FinancialBaseline
}

export function PurchaseDecisionHelper({ baseline }: Props) {
  const [scenario, setScenario] = useState<PurchaseScenario>({
    name: '',
    amount: 0,
    financing: 'cash'
  })
  
  const [analysis, setAnalysis] = useState<PurchaseAnalysis | null>(null)

  useEffect(() => {
    if (scenario.amount > 0) {
      setAnalysis(analyzePurchase(scenario, baseline))
    } else {
      setAnalysis(null)
    }
  }, [scenario, baseline])

  const applyTemplate = (templateId: string) => {
    const template = PURCHASE_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setScenario({
        name: template.name,
        amount: template.defaultAmount,
        financing: template.defaultFinancing,
        loanDetails: template.defaultFinancing === 'loan' ? {
          interestRate: 5,
          termMonths: 48,
          downPayment: template.defaultAmount * 0.1
        } : undefined
      })
    }
  }

  const updateLoanDetail = (key: string, value: number) => {
    setScenario(prev => ({
      ...prev,
      loanDetails: {
        interestRate: 0,
        termMonths: 12,
        downPayment: 0,
        ...prev.loanDetails,
        [key]: value
      }
    }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Details</CardTitle>
            <CardDescription>What are you planning to buy?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Templates */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {PURCHASE_TEMPLATES.map(t => (
                <Button 
                  key={t.id} 
                  variant="outline" 
                  size="sm" 
                  className="whitespace-nowrap"
                  onClick={() => applyTemplate(t.id)}
                >
                  <span className="mr-2">{t.icon}</span>
                  {t.name}
                </Button>
              ))}
            </div>

            <div className="grid gap-2">
              <Label>Item Name</Label>
              <Input 
                value={scenario.name} 
                onChange={e => setScenario({...scenario, name: e.target.value})} 
                placeholder="e.g. New Laptop"
              />
            </div>

            <div className="grid gap-2">
              <Label>Price (€)</Label>
              <Input 
                type="number" 
                value={scenario.amount || ''} 
                onChange={e => setScenario({...scenario, amount: Number(e.target.value)})} 
              />
            </div>

            <div className="grid gap-2">
              <Label>Payment Method</Label>
              <RadioGroup 
                value={scenario.financing} 
                onValueChange={(v: 'cash' | 'loan') => setScenario({
                  ...scenario, 
                  financing: v,
                  loanDetails: v === 'loan' ? { interestRate: 5, termMonths: 24, downPayment: 0 } : undefined
                })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash">Cash</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="loan" id="loan" />
                  <Label htmlFor="loan">Financing / Loan</Label>
                </div>
              </RadioGroup>
            </div>

            {scenario.financing === 'loan' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div className="grid gap-2">
                  <Label>Down Payment</Label>
                  <Input 
                    type="number" 
                    value={scenario.loanDetails?.downPayment || 0}
                    onChange={e => updateLoanDetail('downPayment', Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Interest Rate (%)</Label>
                  <Input 
                    type="number" 
                    value={scenario.loanDetails?.interestRate || 0}
                    onChange={e => updateLoanDetail('interestRate', Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-2 col-span-2">
                  <Label>Term (Months)</Label>
                  <Select 
                    value={String(scenario.loanDetails?.termMonths || 24)}
                    onValueChange={v => updateLoanDetail('termMonths', Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 Months (1 Year)</SelectItem>
                      <SelectItem value="24">24 Months (2 Years)</SelectItem>
                      <SelectItem value="36">36 Months (3 Years)</SelectItem>
                      <SelectItem value="48">48 Months (4 Years)</SelectItem>
                      <SelectItem value="60">60 Months (5 Years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analysis Section */}
      <div className="space-y-6">
        {analysis ? (
          <Card className={`border-t-4 ${
            analysis.recommendation === 'go' ? 'border-t-green-500' : 
            analysis.recommendation === 'caution' ? 'border-t-yellow-500' : 
            'border-t-red-500'
          }`}>
            <CardHeader>
              <div className="flex items-center gap-2">
                {analysis.recommendation === 'go' && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                {analysis.recommendation === 'caution' && <AlertTriangle className="h-6 w-6 text-yellow-500" />}
                {analysis.recommendation === 'wait' && <XCircle className="h-6 w-6 text-red-500" />}
                <CardTitle>
                  {analysis.recommendation === 'go' ? 'Looks Good!' : 
                   analysis.recommendation === 'caution' ? 'Proceed with Caution' : 
                   'Not Recommended Yet'}
                </CardTitle>
              </div>
              <CardDescription>{analysis.reason}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-xs text-muted-foreground mb-1">Emergency Fund</div>
                  <div className={`font-bold ${
                    analysis.emergencyFundImpact.status === 'safe' ? 'text-green-600' : 
                    analysis.emergencyFundImpact.status === 'reduced' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {analysis.emergencyFundImpact.remainingMonths.toFixed(1)} Months
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Remaining after purchase
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-xs text-muted-foreground mb-1">Monthly Impact</div>
                  <div className="font-bold">
                    {formatCurrency(analysis.monthlyCashflowImpact)}/mo
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Cashflow reduction
                  </div>
                </div>
              </div>

              {analysis.alternatives.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <Label className="text-xs uppercase text-muted-foreground">Smart Alternatives</Label>
                  {analysis.alternatives.map((alt, i) => (
                    <Alert key={i} className="bg-blue-50/50 border-blue-200">
                      {alt.type === 'save' && <PiggyBank className="h-4 w-4 text-blue-600" />}
                      {alt.type === 'finance' && <Calculator className="h-4 w-4 text-blue-600" />}
                      {alt.type === 'wait' && <Calendar className="h-4 w-4 text-blue-600" />}
                      <AlertTitle className="text-sm font-medium text-blue-900">{alt.title}</AlertTitle>
                      <AlertDescription className="text-xs text-blue-700">
                        {alt.description}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center p-8 border-2 border-dashed rounded-lg text-muted-foreground text-center">
            <div>
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Enter purchase details to see affordability analysis.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
