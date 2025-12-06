import { FIREProjectionData, computeFIREProjection } from './fire-utils'

export type FIREType = 'full' | 'coast' | 'barista'

export interface FIREScenario {
  type: FIREType
  monthlySavings: number
  expectedReturn: number
  withdrawalRate: number
  targetAnnualSpending: number
  partTimeIncome?: number // for barista FIRE
  currentAge: number
  retirementAge: number
}

export interface EnhancedFIREProjection extends FIREProjectionData {
  coastFireNumber?: number
  coastFireDate?: string
  baristaFireDate?: string
  type: FIREType
}

export function calculateEnhancedFIRE(
  currentNetWorth: number,
  scenario: FIREScenario
): EnhancedFIREProjection {
  const {
    monthlySavings,
    expectedReturn,
    withdrawalRate,
    targetAnnualSpending,
    partTimeIncome = 0,
    currentAge,
    retirementAge
  } = scenario

  // Adjust spending for Barista FIRE (spending - part time income)
  const effectiveAnnualSpending = Math.max(0, targetAnnualSpending - partTimeIncome)
  const monthlySpending = effectiveAnnualSpending / 12

  // Calculate standard projection
  const projection = computeFIREProjection(
    currentNetWorth,
    monthlySpending,
    monthlySavings * 12,
    expectedReturn,
    withdrawalRate
  )

  // Calculate Coast FIRE
  // Coast FIRE = FI Number / (1 + r)^years
  const yearsToRetirement = Math.max(0, retirementAge - currentAge)
  const coastFireNumber = projection.fiNumber / Math.pow(1 + expectedReturn, yearsToRetirement)
  
  // Find Coast FIRE Date
  let coastFireDate: string | undefined
  let tempNW = currentNetWorth
  const now = new Date()
  
  for (let i = 0; i <= 50; i++) {
    if (tempNW >= coastFireNumber) {
      const d = new Date(now)
      d.setFullYear(d.getFullYear() + i)
      coastFireDate = d.toISOString()
      break
    }
    tempNW = tempNW * (1 + expectedReturn) + (monthlySavings * 12)
  }

  return {
    ...projection,
    coastFireNumber,
    coastFireDate,
    type: scenario.type
  }
}

export function calculateSensitivity(
  currentNetWorth: number,
  scenario: FIREScenario
) {
  const pessimistic = calculateEnhancedFIRE(currentNetWorth, { ...scenario, expectedReturn: 0.05 })
  const expected = calculateEnhancedFIRE(currentNetWorth, { ...scenario, expectedReturn: 0.07 })
  const optimistic = calculateEnhancedFIRE(currentNetWorth, { ...scenario, expectedReturn: 0.09 })

  return { pessimistic, expected, optimistic }
}
