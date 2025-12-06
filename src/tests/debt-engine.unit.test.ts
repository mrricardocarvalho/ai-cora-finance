import simulateStrategy from '../lib/planning/debt'

describe('debt strategy simulator', ()=>{
  it('avalanche should save more or equal interest than snowball for given debts', ()=>{
    const debts = [
      { id: 'd1', name: 'Small', balance: 1000, interest_rate: 5, min_payment: 25 },
      { id: 'd2', name: 'Large', balance: 10000, interest_rate: 20, min_payment: 200 }
    ]
    const av = simulateStrategy(debts as any, 100, 'avalanche')
    const sn = simulateStrategy(debts as any, 100, 'snowball')
    expect(av.totalInterestPaid).toBeLessThanOrEqual(sn.totalInterestPaid)
  })

  it('no extra payment results in identical strategies', ()=>{
    const debts = [
      { id: 'd1', name: 'Small', balance: 1000, interest_rate: 5, min_payment: 25 },
      { id: 'd2', name: 'Large', balance: 10000, interest_rate: 20, min_payment: 200 }
    ]
    const av = simulateStrategy(debts as any, 0, 'avalanche')
    const sn = simulateStrategy(debts as any, 0, 'snowball')
    expect(av.totalInterestPaid).toBeCloseTo(sn.totalInterestPaid)
    expect(av.months).toBe(sn.months)
  })
})
