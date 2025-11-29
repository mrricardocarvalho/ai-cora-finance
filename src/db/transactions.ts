import { eq } from 'drizzle-orm'
import { db } from './client' // placeholder db client - to be wired in next story
import { transactions } from './schema'

type Transaction = {
  id: string
  account_id: string
  user_id: string
  amount: string | number
  date: string
  description?: string
  category?: string
  is_recurring?: boolean
  tax_deductible?: boolean
}

export async function insertTransaction(t: Transaction) {
  const res = await db.insert(transactions).values(t).returning()
  return res
}

export async function getTransactionsByUser(user_id: string) {
  const res = await db.select().from(transactions).where(eq(transactions.user_id, user_id))
  return res
}
