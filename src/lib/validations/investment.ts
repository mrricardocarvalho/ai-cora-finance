import { z } from 'zod'

export const investmentSchema = z.object({
  accountId: z.string().uuid(),
  ticker: z.string().min(1),
  type: z.enum(['buy','sell','dividend']),
  quantity: z.number().positive(),
  pricePerShare: z.number().positive(),
  fees: z.number().nonnegative().optional(),
  date: z.string().refine((s)=>!Number.isNaN(Date.parse(s)))
})

export type InvestmentFormData = z.infer<typeof investmentSchema>
