import { addMonths } from 'date-fns';

export interface Debt {
  id: string;
  name: string;
  balance: number;
  interest_rate: number;
  min_payment: number;
}

export interface MonthlyDebtSnapshot {
  month: number;
  date: string;
  totalBalance: number;
  totalInterestPaid: number;
  balances: Record<string, number>;
}

export interface DebtPayoffInfo {
  id: string;
  name: string;
  payoffDate: Date;
  interestPaid: number;
  monthsToPayoff: number;
}

export interface SimulationResult {
  payoffDate: Date;
  totalInterestPaid: number;
  months: number;
  monthlyProjection: MonthlyDebtSnapshot[];
  perDebtBreakdown: DebtPayoffInfo[];
}

export interface ExtraPaymentSimulation extends SimulationResult {
  originalPayoffDate: Date;
  interestSaved: number;
  monthsSaved: number;
  baseline: SimulationResult;
}

function roundTwo(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function simulateExtraPayments(
  debts: Debt[],
  extraMonthly: number,
  strategy: 'avalanche' | 'snowball' | 'specific',
  specificDebtId?: string
): ExtraPaymentSimulation {
  const baseline = runSimulationWithRollover(debts, 0, 'avalanche', undefined, false); // No rollover, just min payments
  const simulation = runSimulationWithRollover(debts, extraMonthly, strategy, specificDebtId, true); // With rollover + extra

  return {
    ...simulation,
    originalPayoffDate: baseline.payoffDate,
    interestSaved: roundTwo(baseline.totalInterestPaid - simulation.totalInterestPaid),
    monthsSaved: baseline.months - simulation.months,
    baseline
  };
}

// Helper to support the rollover flag
function runSimulationWithRollover(
  initialDebts: Debt[],
  extraMonthlyPayment: number,
  strategy: 'avalanche' | 'snowball' | 'specific',
  specificDebtId: string | undefined,
  rollover: boolean
): SimulationResult {
  // Copy-paste logic from above but with rollover check
  const debts = initialDebts.map(d => ({ ...d, originalBalance: d.balance, interestPaid: 0 }));
  const maxMonths = 1200; 
  let months = 0;
  let totalInterestPaid = 0;
  const monthlyProjection: MonthlyDebtSnapshot[] = [];
  const payoffDates: Record<string, Date> = {};
  
  const initialTotalMin = initialDebts.reduce((sum, d) => sum + d.min_payment, 0);

  monthlyProjection.push({
    month: 0,
    date: new Date().toISOString(),
    totalBalance: roundTwo(debts.reduce((sum, d) => sum + d.balance, 0)),
    totalInterestPaid: 0,
    balances: debts.reduce((acc, d) => ({ ...acc, [d.id]: d.balance }), {})
  });

  while (debts.some(d => d.balance > 0) && months < maxMonths) {
    months++;
    const currentDate = addMonths(new Date(), months);
    
    // Accrue Interest
    debts.forEach(d => {
      if (d.balance > 0) {
        const monthlyRate = d.interest_rate / 100 / 12;
        const interest = roundTwo(d.balance * monthlyRate);
        d.balance += interest;
        d.interestPaid += interest;
        totalInterestPaid += interest;
      }
    });

    const activeDebts = debts.filter(d => d.balance > 0);
    const currentRequiredMin = activeDebts.reduce((sum, d) => sum + (d.balance > 0 ? d.min_payment : 0), 0);
    
    let availableForTarget = extraMonthlyPayment;
    
    if (rollover) {
       availableForTarget += (initialTotalMin - currentRequiredMin);
    }

    // Pay Minimums
    debts.forEach(d => {
      if (d.balance > 0) {
        const payment = Math.min(d.min_payment, d.balance);
        d.balance -= payment;
      }
    });

    // Apply Extra
    if (availableForTarget > 0) {
      const sortedDebts = [...debts.filter(d => d.balance > 0)];
      
      if (strategy === 'specific' && specificDebtId) {
        sortedDebts.sort((a, b) => {
          if (a.id === specificDebtId) return -1;
          if (b.id === specificDebtId) return 1;
          return b.interest_rate - a.interest_rate;
        });
      } else if (strategy === 'avalanche') {
        sortedDebts.sort((a, b) => b.interest_rate - a.interest_rate);
      } else { // snowball
        sortedDebts.sort((a, b) => a.balance - b.balance);
      }

      for (const debt of sortedDebts) {
        if (availableForTarget <= 0) break;
        const payment = Math.min(availableForTarget, debt.balance);
        debt.balance -= payment;
        availableForTarget -= payment;
      }
    }

    // Check Payoffs
    debts.forEach(d => {
      if (d.balance <= 0.01 && !payoffDates[d.id]) {
        d.balance = 0;
        payoffDates[d.id] = currentDate;
      }
    });

    monthlyProjection.push({
      month: months,
      date: currentDate.toISOString(),
      totalBalance: roundTwo(debts.reduce((sum, d) => sum + d.balance, 0)),
      totalInterestPaid: roundTwo(totalInterestPaid),
      balances: debts.reduce((acc, d) => ({ ...acc, [d.id]: roundTwo(d.balance) }), {})
    });
  }

  const finalDate = addMonths(new Date(), months);
  debts.forEach(d => {
    if (!payoffDates[d.id]) payoffDates[d.id] = finalDate;
  });

  const perDebtBreakdown: DebtPayoffInfo[] = debts.map(d => ({
    id: d.id,
    name: d.name,
    payoffDate: payoffDates[d.id],
    interestPaid: roundTwo(d.interestPaid),
    monthsToPayoff: Math.ceil((payoffDates[d.id].getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))
  }));

  return {
    payoffDate: finalDate,
    totalInterestPaid: roundTwo(totalInterestPaid),
    months,
    monthlyProjection,
    perDebtBreakdown
  };
}
