import { calculateScenario, compareScenarios } from './scenario-engine';
import { FinancialBaseline, ScenarioModification } from './types';

describe('Scenario Engine', () => {
  const baseline: FinancialBaseline = {
    netWorth: 100000,
    monthlyIncome: 5000,
    monthlyExpenses: 3000, // Includes 500 debt payment
    savingsRate: 0.4,
    debts: [
      { id: '1', name: 'Car', balance: 10000, interestRate: 5, minPayment: 500 }
    ],
    investments: 50000,
    goals: []
  };

  it('projects baseline correctly', () => {
    const result = calculateScenario(baseline, [], 12);
    expect(result.months).toHaveLength(12);
    
    // Month 0:
    // Living Expenses = 3000 - 500 = 2500.
    // Debt Payment = 500.
    // Total Expenses = 3000.
    // Savings = 2000.
    // Investments grow by 7%/12 + 2000.
    // Debt reduces by (500 - interest).
    
    const m1 = result.months[0];
    expect(m1.savings).toBeCloseTo(2000);
    expect(m1.netWorth).toBeGreaterThan(100000);
  });

  it('handles income increase modification', () => {
    const mods: ScenarioModification[] = [
      { type: 'income', value: 6000, startMonth: 0, description: 'Raise' }
    ];
    const result = calculateScenario(baseline, mods, 12);
    const m1 = result.months[0];
    // Income 6000, Expenses 3000 -> Savings 3000.
    expect(m1.savings).toBeCloseTo(3000);
  });

  it('handles one-time expense', () => {
    const mods: ScenarioModification[] = [
      { type: 'one_time_expense', value: 5000, startMonth: 2, description: 'Wedding' }
    ];
    const result = calculateScenario(baseline, mods, 12);
    // Month 2 savings should be 2000 - 5000 = -3000.
    expect(result.months[2].savings).toBeCloseTo(-3000);
  });

  it('compares scenarios correctly', () => {
    const baseRes = calculateScenario(baseline, [], 60);
    const betterRes = calculateScenario(baseline, [{ type: 'income', value: 10000, startMonth: 0, description: 'Big Raise' }], 60);
    
    const comparison = compareScenarios(baseRes, betterRes);
    expect(comparison.netWorthDelta).toBeGreaterThan(0);
    // Better scenario might reach FIRE earlier
    if (baseRes.fireDate && betterRes.fireDate) {
      expect(comparison.fireDateDeltaMonths).toBeLessThan(0);
    }
  });
});
