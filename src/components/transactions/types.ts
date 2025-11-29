export type Transaction = {
  id: string
  account_id?: string
  user_id?: string
  merchant: string
  date: string
  amount: number | string
  category?: string
  confidence_score?: number | null
}
