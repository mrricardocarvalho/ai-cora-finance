import { accountSchema } from './accounts'

describe('account validation', ()=>{
  it('accepts non-debt accounts with no debt fields', ()=>{
    const vals = { name: 'My Check', institution: 'Bank', type: 'checking', balance: 100 }
    const parsed = accountSchema.safeParse(vals)
    expect(parsed.success).toBeTruthy()
  })
  it('rejects credit_card when missing debt fields', ()=>{
    const vals = { name: 'My Card', institution: 'Bank', type: 'credit_card', balance: 0 }
    const parsed = accountSchema.safeParse(vals)
    expect(parsed.success).toBeFalsy()
  })
  it('accepts credit_card with required debt fields', ()=>{
    const vals = { name: 'My Card', institution: 'Bank', type: 'credit_card', balance: 0, interest_rate: 18, min_payment: 10, due_date: 12 }
    const parsed = accountSchema.safeParse(vals)
    expect(parsed.success).toBeTruthy()
  })
})
