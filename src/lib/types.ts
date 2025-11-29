export type Account = {
  id: string
  user_id: string
  name: string
  institution?: string
  balance?: number | string
  type?: 'checking' | 'savings' | 'credit_card' | 'loan' | 'broker'
}
