import { z } from 'zod'

export const TransactionExtractionSchema = z.object({
  transactions: z.array(z.object({
    date: z.string().describe('ISO 8601 YYYY-MM-DD'),
    description: z.string(),
    amount: z.number(),
    category: z.enum(['Housing', 'Transport', 'Food', 'Utilities', 'Insurance', 'Healthcare', 'Financial', 'Lifestyle', 'Income', 'Uncategorized']),
    confidence: z.number().min(0).max(1)
  }))
})

export type TransactionExtraction = z.infer<typeof TransactionExtractionSchema>
