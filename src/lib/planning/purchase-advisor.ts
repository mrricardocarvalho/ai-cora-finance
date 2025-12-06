import { FinancialBaseline } from './types'

export interface PurchaseScenario {
  name: string
  amount: number
  financing: 'cash' | 'loan'
  loanDetails?: {
    interestRate: number
    termMonths: number
    downPayment: number
  }
}

export interface PurchaseAnalysis {
  canAffordCash: boolean
  emergencyFundImpact: {
    status: 'safe' | 'reduced' | 'depleted'
    remainingMonths: number
    dropAmount: number
  }
  monthlyCashflowImpact: number
  recommendation: 'go' | 'caution' | 'wait'
  reason: string
  alternatives: PurchaseAlternative[]
}

export interface PurchaseAlternative {
  type: 'save' | 'finance' | 'wait'
  title: string
  description: string
  monthlyImpact?: number
}

export const PURCHASE_TEMPLATES = [
  { id: 'car', name: 'New Car', icon: '🚗', defaultAmount: 25000, defaultFinancing: 'loan' as const },
  { id: 'reno', name: 'Home Renovation', icon: '🔨', defaultAmount: 15000, defaultFinancing: 'cash' as const },
  { id: 'vacation', name: 'Dream Vacation', icon: '🏖️', defaultAmount: 3000, defaultFinancing: 'cash' as const },
  { id: 'tech', name: 'Electronics', icon: '💻', defaultAmount: 1500, defaultFinancing: 'cash' as const },
]

export function analyzePurchase(purchase: PurchaseScenario, baseline: FinancialBaseline): PurchaseAnalysis {
  const { amount, financing, loanDetails } = purchase
  const { totalSavings, monthlyExpenses, monthlyIncome } = baseline
  
  // 1. Calculate Monthly Payment (if loan)
  let monthlyPayment = 0
  let upfrontCost = 0

  if (financing === 'loan' && loanDetails) {
    upfrontCost = loanDetails.downPayment
    const principal = amount - loanDetails.downPayment
    if (principal > 0) {
      const r = loanDetails.interestRate / 100 / 12
      const n = loanDetails.termMonths
      if (r === 0) {
        monthlyPayment = principal / n
      } else {
        monthlyPayment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      }
    }
  } else {
    upfrontCost = amount
  }

  // 2. Emergency Fund Impact
  const remainingSavings = totalSavings - upfrontCost
  const remainingEmergencyMonths = remainingSavings / monthlyExpenses

  let efStatus: 'safe' | 'reduced' | 'depleted' = 'safe'
  if (remainingEmergencyMonths < 1) efStatus = 'depleted'
  else if (remainingEmergencyMonths < 3) efStatus = 'reduced'

  // 3. Cashflow Impact
  const currentSurplus = monthlyIncome - monthlyExpenses
  const newSurplus = currentSurplus - monthlyPayment
  const cashflowStatus = newSurplus > 0 ? 'positive' : 'negative'

  // 4. Recommendation Logic
  let recommendation: 'go' | 'caution' | 'wait' = 'go'
  let reason = 'You can comfortably afford this purchase.'

  if (remainingSavings < 0) {
    recommendation = 'wait'
    reason = 'You do not have enough cash for the upfront cost.'
  } else if (cashflowStatus === 'negative') {
    recommendation = 'wait'
    reason = 'The monthly payments would exceed your monthly surplus.'
  } else if (efStatus === 'depleted') {
    recommendation = 'wait'
    reason = 'This would deplete your emergency fund below 1 month of expenses.'
  } else if (efStatus === 'reduced') {
    recommendation = 'caution'
    reason = 'This would reduce your emergency fund below the recommended 3 months.'
  } else if (newSurplus < currentSurplus * 0.2) {
    recommendation = 'caution'
    reason = 'This leaves very little room in your monthly budget.'
  }

  // 5. Generate Alternatives
  const alternatives: PurchaseAlternative[] = []

  // Alt 1: Save up (if cash purchase is hard)
  if (financing === 'cash' && recommendation !== 'go') {
    const monthsToSave = Math.ceil(amount / (currentSurplus * 0.8)) // Use 80% of surplus
    alternatives.push({
      type: 'save',
      title: 'Save Up',
      description: `Save €${Math.round(currentSurplus * 0.8)}/mo for ${monthsToSave} months to buy in cash.`
    })
  }

  // Alt 2: Finance (if currently cash)
  if (financing === 'cash' && recommendation !== 'go') {
    // Simulate a generic loan: 5% for 24 months
    const r = 0.05 / 12
    const n = 24
    const estPayment = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    
    if (currentSurplus > estPayment) {
      alternatives.push({
        type: 'finance',
        title: 'Consider Financing',
        description: `A 2-year loan at 5% would cost ~€${Math.round(estPayment)}/mo.`,
        monthlyImpact: estPayment
      })
    }
  }

  // Alt 3: Wait (if financing is tight)
  if (financing === 'loan' && recommendation !== 'go') {
    alternatives.push({
      type: 'wait',
      title: 'Wait & Save Down Payment',
      description: 'Saving a larger down payment will reduce monthly strain.'
    })
  }

  return {
    canAffordCash: totalSavings >= amount,
    emergencyFundImpact: {
      status: efStatus,
      remainingMonths: remainingEmergencyMonths,
      dropAmount: upfrontCost
    },
    monthlyCashflowImpact: monthlyPayment,
    recommendation,
    reason,
    alternatives
  }
}
