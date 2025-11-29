import { z } from 'zod'

export const accountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  institution: z.string().min(1, 'Institution is required'),
  type: z.enum(['checking', 'savings', 'credit_card', 'loan', 'broker']),
  balance: z.string().regex(/^\d+(?:\.\d{1,2})?$/, 'Enter a valid amount')
})

export type AccountForm = z.infer<typeof accountSchema>
