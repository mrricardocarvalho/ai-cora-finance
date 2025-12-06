import { goalSchema } from '../lib/validations/goals'

describe('goalSchema validation', ()=>{
  it('rejects negative target amount', ()=>{
    expect(()=> goalSchema.parse({ name: 'X', target_amount: -100 })).toThrow()
  })

  it('rejects past deadline', ()=>{
    const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString().slice(0,10)
    expect(()=> goalSchema.parse({ name: 'X', target_amount: 100, deadline: yesterday })).toThrow()
  })

  it('accepts valid goal with linked account', ()=>{
    const future = new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0,10)
    const parsed = goalSchema.parse({ name: 'X', target_amount: 100, linked_account_id: '00000000-0000-0000-0000-000000000000', deadline: future })
    expect(parsed.name).toBe('X')
  })
})
