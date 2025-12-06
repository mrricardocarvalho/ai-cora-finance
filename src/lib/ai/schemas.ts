import { z } from 'zod'

// Single transaction schema
const TransactionSchema = z.object({
  date: z.string().describe('ISO 8601 YYYY-MM-DD'),
  description: z.string(),
  amount: z.number(),
  category: z.enum(['Housing', 'Transport', 'Food', 'Utilities', 'Insurance', 'Healthcare', 'Financial', 'Lifestyle', 'Income', 'Transfer', 'Uncategorized']),
  confidence: z.number().min(0).max(1)
})

// Legacy schema for single account extraction (backwards compatibility)
export const TransactionExtractionSchema = z.object({
  transactions: z.array(TransactionSchema)
})

// New schema for multi-account extraction
export const MultiAccountExtractionSchema = z.object({
  accounts: z.array(z.object({
    account_type: z.enum(['checking', 'savings', 'credit_card', 'broker']),
    transactions: z.array(TransactionSchema)
  }))
})

export type TransactionExtraction = z.infer<typeof TransactionExtractionSchema>
export type MultiAccountExtraction = z.infer<typeof MultiAccountExtractionSchema>
