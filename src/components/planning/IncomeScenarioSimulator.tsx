"use client"

import React from 'react'
import { ScenarioModification } from '@/lib/planning/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { formatCurrency } from '@/lib/utils'

interface Props {
  baselineIncome: number
  modifications: ScenarioModification[]
  onChange: (mods: ScenarioModification[]) => void
}

export function IncomeScenarioSimulator({ baselineIncome, modifications, onChange }: Props) {
  // Find existing income modification or use baseline
  const incomeMod = modifications.find(m => m.type === 'income')
  const currentIncome = incomeMod ? incomeMod.value : baselineIncome

  const handlePreset = (type: 'raise-10' | 'cut-20' | 'side-hustle') => {
    let newMod: ScenarioModification | null = null
    
    // Remove existing income mods first to avoid conflicts in this simple UI
    const otherMods = modifications.filter(m => m.type !== 'income')

    switch (type) {
      case 'raise-10':
        newMod = {
          type: 'income',
          value: baselineIncome * 1.10,
          description: '10% Raise',
          startMonth: 0
        }
        break
      case 'cut-20':
        newMod = {
          type: 'income',
          value: baselineIncome * 0.80,
          description: '20% Pay Cut',
          startMonth: 0
        }
        break
      case 'side-hustle':
        newMod = {
          type: 'income',
          value: baselineIncome + 500,
          description: 'Side Hustle (+€500)',
          startMonth: 0
        }
        break
    }

    if (newMod) {
      onChange([...otherMods, newMod])
    }
  }

  const handleCustomChange = (value: number) => {
    const otherMods = modifications.filter(m => m.type !== 'income')
    const newMod: ScenarioModification = {
      type: 'income',
      value: value,
      description: `Custom Income: ${formatCurrency(value)}`,
      startMonth: 0
    }
    onChange([...otherMods, newMod])
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Quick Presets</Label>
        <div className="grid grid-cols-1 gap-2">
          <Button variant="outline" size="sm" onClick={() => handlePreset('raise-10')}>
            🚀 10% Raise
          </Button>
          <Button variant="outline" size="sm" onClick={() => handlePreset('cut-20')}>
            📉 20% Pay Cut
          </Button>
          <Button variant="outline" size="sm" onClick={() => handlePreset('side-hustle')}>
            💼 Side Hustle (+€500)
          </Button>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <Label>Custom Monthly Income</Label>
        <div className="flex items-center gap-4">
          <Slider 
            value={[currentIncome]} 
            min={0} 
            max={baselineIncome * 3} 
            step={50} 
            onValueChange={(vals) => handleCustomChange(vals[0])}
            className="flex-1"
          />
          <Input 
            type="number" 
            value={Math.round(currentIncome)} 
            onChange={(e) => handleCustomChange(Number(e.target.value))}
            className="w-24"
          />
        </div>
        <p className="text-sm text-muted-foreground text-right">
          {currentIncome > baselineIncome ? '+' : ''}
          {formatCurrency(currentIncome - baselineIncome)} vs baseline
        </p>
      </div>
    </div>
  )
}
