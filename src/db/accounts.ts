import { eq } from 'drizzle-orm'
import { db } from './client' // placeholder db client - to be wired in next story
import { accounts } from './schema'

type Account = {
  id: string
  user_id: string
  name: string
  type: 'checking' | 'savings' | 'credit_card' | 'loan' | 'broker'
  balance?: string
  institution?: string
}

export async function createAccount(data: Account) {
  const res = await db.insert(accounts).values(data).returning()
  return res
}

export async function getAccountsByUser(user_id: string) {
  const res = await db.select().from(accounts).where(eq(accounts.user_id, user_id))
  return res
}
