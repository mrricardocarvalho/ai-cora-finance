export type Transaction = {
  id: string
  account_id?: string
  account_name?: string  // Joined from accounts table
  user_id?: string
  description: string
  date: string
  amount: number | string
  category?: string
  confidence_score?: number | null
  is_recurring?: boolean
  tax_deductible?: boolean
  updated_at?: string
}
