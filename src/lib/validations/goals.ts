import { z } from 'zod'

export const goalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  visibility: z.enum(['personal', 'shared']).default('personal'),
  target_amount: z.preprocess((v) => {
    if (typeof v === 'string') return Number(v.replace(/\./g, '').replace(/,/g, '.'))
    return Number(v)
  }, z.number().positive('Target must be greater than 0')),
  current_amount: z.preprocess((v) => {
    if (v === '' || v === undefined || v === null) return undefined
    if (typeof v === 'string') return Number(v.replace(/\./g, '').replace(/,/g, '.'))
    return Number(v)
  }, z.number().min(0).optional()),
  deadline: z.string().refine((s) => { const d = new Date(s); return !isNaN(d.getTime()) && d > new Date() }, 'Deadline must be in the future').optional(),
  linked_account_id: z.string().uuid().optional(),
})

export type GoalForm = z.infer<typeof goalSchema>
