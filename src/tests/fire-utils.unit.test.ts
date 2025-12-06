import { computeFIREProjection } from '../lib/planning/fire-utils'

describe('computeFIREProjection', ()=>{
  it('projects years to FI for given inputs (approx)', ()=>{
    // example: Net Worth 0, Expenses 40000/year => monthly expense = 3333.33
    const avgMonthlyExpense = 40000/12
    const annualSavings = 20000 // 20k/year
    const res = computeFIREProjection(0, avgMonthlyExpense, annualSavings, 0.07, 0.04)
    // projection should be within reasonable bounds from story guidance
    expect(res.yearsToFI).toBeGreaterThanOrEqual(10)
    expect(res.yearsToFI).toBeLessThanOrEqual(25)
    // FI number = 40000*25 = 1,000,000
    expect(res.fiNumber).toBe(1000000)
  })
  it('computes FI number according to withdrawal rate', ()=>{
    const avgMonthlyExpense = 40000/12
    const annualSavings = 20000
    const resDefault = computeFIREProjection(0, avgMonthlyExpense, annualSavings, 0.07, 0.04)
    expect(resDefault.fiNumber).toBe(1000000)
    const res35 = computeFIREProjection(0, avgMonthlyExpense, annualSavings, 0.07, 0.035)
    expect(Math.round(res35.fiNumber)).toBe(1142857)
  })
})
