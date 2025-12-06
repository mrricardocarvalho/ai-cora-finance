import { simulateExtraPayments, Debt } from './debt-simulator';

describe('Debt Simulator', () => {
  const debts: Debt[] = [
    { id: '1', name: 'Card A', balance: 5000, interest_rate: 20, min_payment: 150 },
    { id: '2', name: 'Loan B', balance: 10000, interest_rate: 5, min_payment: 200 },
  ];

  it('calculates baseline correctly', () => {
    const result = simulateExtraPayments(debts, 0, 'avalanche');
    // With 0 extra, we still get rollover benefit compared to "pay minimums only" baseline
    // So monthsSaved might be > 0 if rollover helps
    expect(result.monthsSaved).toBeGreaterThanOrEqual(0);
    expect(result.interestSaved).toBeGreaterThanOrEqual(0);
    expect(result.baseline.payoffDate).toBeDefined();
  });

  it('calculates savings with extra payment', () => {
    const result = simulateExtraPayments(debts, 500, 'avalanche');
    expect(result.monthsSaved).toBeGreaterThan(0);
    expect(result.interestSaved).toBeGreaterThan(0);
    expect(result.payoffDate.getTime()).toBeLessThan(result.originalPayoffDate.getTime());
  });

  it('avalanche pays off high interest first', () => {
    // Card A has higher interest (20%) than Loan B (5%)
    // Avalanche should prioritize Card A
    const result = simulateExtraPayments(debts, 500, 'avalanche');
    const cardAPayoff = result.perDebtBreakdown.find(d => d.id === '1')!.payoffDate;
    const loanBPayoff = result.perDebtBreakdown.find(d => d.id === '2')!.payoffDate;
    
    expect(cardAPayoff.getTime()).toBeLessThan(loanBPayoff.getTime());
  });

  it('snowball pays off lowest balance first', () => {
    const debts2: Debt[] = [
      { id: '1', name: 'High Int Large', balance: 10000, interest_rate: 20, min_payment: 200 },
      { id: '2', name: 'Low Int Small', balance: 2000, interest_rate: 5, min_payment: 50 },
    ];
    
    const avalanche = simulateExtraPayments(debts2, 100, 'avalanche');
    const snowball = simulateExtraPayments(debts2, 100, 'snowball');
    
    const avSmallPayoff = avalanche.perDebtBreakdown.find(d => d.id === '2')!.payoffDate;
    const sbSmallPayoff = snowball.perDebtBreakdown.find(d => d.id === '2')!.payoffDate;
    
    // Snowball should pay off the small one faster than Avalanche does
    expect(sbSmallPayoff.getTime()).toBeLessThan(avSmallPayoff.getTime());
  });
});
