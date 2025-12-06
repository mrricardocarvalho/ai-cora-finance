export interface AmortizationRow {
  month: number
  payment: number
  principal: number
  interest: number
  remainingBalance: number
}

export interface LoanCalculation {
  monthlyPayment: number
  totalInterest: number
  totalCost: number
  effectiveAPR: number
  amortizationSchedule: AmortizationRow[]
}

export interface LoanScenario {
  id: string
  name: string
  principal: number
  annualRate: number // percentage, e.g. 5.5
  termMonths: number
  fees: number
}

export function calculateLoan(
  principal: number,
  annualRate: number,
  termMonths: number,
  fees: number = 0
): LoanCalculation {
  // Handle edge case: 0 interest
  if (annualRate === 0) {
    const monthlyPayment = principal / termMonths
    const schedule: AmortizationRow[] = []
    let balance = principal
    
    for (let i = 1; i <= termMonths; i++) {
      const principalPayment = Math.min(balance, monthlyPayment)
      balance -= principalPayment
      schedule.push({
        month: i,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: 0,
        remainingBalance: Math.max(0, balance)
      })
    }
    
    return {
      monthlyPayment,
      totalInterest: 0,
      totalCost: principal + fees,
      effectiveAPR: 0,
      amortizationSchedule: schedule
    }
  }

  const monthlyRate = annualRate / 100 / 12
  const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1)
  
  const schedule: AmortizationRow[] = []
  let balance = principal
  let totalInterest = 0
  
  for (let i = 1; i <= termMonths; i++) {
    const interestPayment = balance * monthlyRate
    const principalPayment = monthlyPayment - interestPayment
    balance -= principalPayment
    totalInterest += interestPayment
    
    schedule.push({
      month: i,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      remainingBalance: Math.max(0, balance)
    })
  }
  
  const totalCost = principal + totalInterest + fees
  
  // Approximate Effective APR (including fees)
  // Using a simplified estimation or iterative approach could be better, 
  // but for now let's use the rate that would produce the total cost over the term.
  // Actually, APR usually just adds fees to principal.
  // Let's calculate APR by solving for rate in PMT formula where PV = Principal - Fees? No, PV = Principal, but you pay Fees upfront?
  // Usually APR reflects the cost of borrowing. If fees are financed, they are part of principal.
  // If fees are paid upfront, the effective amount received is Principal - Fees.
  // Let's stick to a simple approximation: (Total Interest + Fees) / Principal / (Term/12) * 100
  const effectiveAPR = ((totalInterest + fees) / principal) / (termMonths / 12) * 100

  return {
    monthlyPayment,
    totalInterest,
    totalCost,
    effectiveAPR,
    amortizationSchedule: schedule
  }
}

export function calculateBreakEven(
  currentMonthlyPayment: number,
  newMonthlyPayment: number,
  refinancingFees: number
): number {
  const monthlySavings = currentMonthlyPayment - newMonthlyPayment
  if (monthlySavings <= 0) return Infinity
  return refinancingFees / monthlySavings
}
