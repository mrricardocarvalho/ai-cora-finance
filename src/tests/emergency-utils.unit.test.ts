import { computeEmergencyTargetsAndRunway } from '../lib/planning/emergency-utils'

describe('computeEmergencyTargetsAndRunway', ()=>{
  it('calculates 3/6/12 targets and runway with avgExpense', ()=>{
    const res = computeEmergencyTargetsAndRunway(2500, 1000, 3)
    expect(res.targets.m3).toBe(3000)
    expect(res.targets.m6).toBe(6000)
    expect(res.targets.m12).toBe(12000)
    expect(res.target).toBe(3000)
    expect(res.runway).toBe(2.5)
  })

  it('returns zero runway when avgExpense is zero', ()=>{
    const res = computeEmergencyTargetsAndRunway(1000, 0, 3)
    expect(res.runway).toBe(0)
  })
})
