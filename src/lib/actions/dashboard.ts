"use server"
import getSafeToSpend from '../intelligence/safe-spend'

export async function fetchSafeToSpend(userId: string, view: 'personal' | 'household' = 'personal'){
  return await getSafeToSpend(userId, view)
}

export default fetchSafeToSpend
