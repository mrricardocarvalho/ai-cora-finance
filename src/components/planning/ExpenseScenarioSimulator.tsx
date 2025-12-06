"use client"

import React from 'react'
import { ScenarioModification } from '@/lib/planning/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { formatCurrency } from '@/lib/utils'

interface Props {
  baselineExpenses: number
  modifications: ScenarioModification[]
  onChange: (mods: ScenarioModification[]) => void
}

export function ExpenseScenarioSimulator({ baselineExpenses, modifications, onChange }: Props) {
  const expenseMod = modifications.find(m => m.type === 'expense')
  const currentExpenses = expenseMod ? expenseMod.value : baselineExpenses

  const handlePreset = (type: 'inflation-10' | 'rent-increase') => {
    const otherMods = modifications.filter(m => m.type !== 'expense')
    let newMod: ScenarioModification | null = null

    switch (type) {
      case 'inflation-10':
        newMod = {
          type: 'expense',
          value: baselineExpenses * 1.10,
          description: '10% Lifestyle Inflation',
          startMonth: 0
        }
        break
      case 'rent-increase':
        newMod = {
          type: 'expense',
          value: baselineExpenses + 200,
          description: 'Rent Increase (+€200)',
          startMonth: 0
        }
        break
    }

    if (newMod) {
      onChange([...otherMods, newMod])
    }
  }

  const handleCustomChange = (value: number) => {
    const otherMods = modifications.filter(m => m.type !== 'expense')
    const newMod: ScenarioModification = {
      type: 'expense',
      value: value,
      description: `Custom Expenses: ${formatCurrency(value)}`,
      startMonth: 0
    }
    onChange([...otherMods, newMod])
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Quick Presets</Label>
        <div className="grid grid-cols-1 gap-2">
          <Button variant="outline" size="sm" onClick={() => handlePreset('inflation-10')}>
            📈 10% Lifestyle Inflation
          </Button>
          <Button variant="outline" size="sm" onClick={() => handlePreset('rent-increase')}>
            🏠 Rent Increase (+€200)
          </Button>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <Label>Custom Monthly Expenses</Label>
        <div className="flex items-center gap-4">
          <Slider 
            value={[currentExpenses]} 
            min={0} 
            max={baselineExpenses * 3} 
            step={50} 
            onValueChange={(vals) => handleCustomChange(vals[0])}
            className="flex-1"
          />
          <Input 
            type="number" 
            value={Math.round(currentExpenses)} 
            onChange={(e) => handleCustomChange(Number(e.target.value))}
            className="w-24"
          />
        </div>
        <p className="text-sm text-muted-foreground text-right">
          {currentExpenses > baselineExpenses ? '+' : ''}
          {formatCurrency(currentExpenses - baselineExpenses)} vs baseline
        </p>
      </div>
    </div>
  )
}
