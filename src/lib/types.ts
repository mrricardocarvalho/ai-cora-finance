export type Account = {
  id: string
  user_id: string
  name: string
  institution?: string
  balance?: number | string
  type?: 'checking' | 'savings' | 'credit_card' | 'loan' | 'broker'
  interest_rate?: number | string
  min_payment?: number | string
  due_date?: number
}
