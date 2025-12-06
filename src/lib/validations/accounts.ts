import { z } from 'zod'

// Helper preprocessors to handle localized numeric strings from the UI
function preprocessNumber(allowEmpty = true){
  return function(schema = z.number()){
    return z.preprocess((v)=>{
  if (v === '' || v === undefined || v === null) return allowEmpty ? undefined : undefined
  if (typeof v === 'string') return Number(v.replace(/\./g, '').replace(/,/g, '.'))
  return Number(v)
    }, schema)
  }
}

// Common fields shared by all account types
const base = z.object({
  name: z.string().min(1, 'Name is required'),
  institution: z.string().min(1, 'Institution is required'),
  visibility: z.enum(['personal', 'shared']).default('personal'),
  balance: z.preprocess((v) => {
    if (v === '' || v === undefined || v === null) return 0
    if (typeof v === 'string') return Number(v.replace(/\./g, '').replace(/,/g, '.'))
    return Number(v)
  }, z.number().min(0))
})

// Types
const nonDebtTypes = z.enum(['checking', 'savings', 'broker'])
const debtTypes = z.enum(['credit_card', 'loan'])

// Schema for non-debt accounts: debt fields optional
const nonDebtSchema = base.extend({
  type: nonDebtTypes,
  interest_rate: preprocessNumber()(z.number().min(0).max(100)).optional(),
  min_payment: preprocessNumber()(z.number().min(0)).optional(),
  due_date: preprocessNumber()(z.number().int().min(1).max(31)).optional()
})

// Schema for debt accounts: interest_rate, min_payment, due_date are required
const debtSchema = base.extend({
  type: debtTypes,
  interest_rate: preprocessNumber(false)(z.number().min(0).max(100)),
  min_payment: preprocessNumber(false)(z.number().min(0)),
  due_date: preprocessNumber(false)(z.number().int().min(1).max(31))
})

export const accountSchema = z.discriminatedUnion('type', [nonDebtSchema, debtSchema])

export type AccountForm = z.infer<typeof accountSchema>
