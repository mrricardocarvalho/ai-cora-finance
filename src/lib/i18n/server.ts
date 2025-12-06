import { cookies } from 'next/headers'
import type { Locale } from './translations'

const COOKIE_NAME = 'cora-locale'
const DEFAULT_LOCALE: Locale = 'pt-PT'

/**
 * Get the user's locale preference from cookies (server-side)
 * Falls back to pt-PT if not set
 */
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get(COOKIE_NAME)
  
  if (localeCookie?.value === 'en-US' || localeCookie?.value === 'pt-PT') {
    return localeCookie.value as Locale
  }
  
  return DEFAULT_LOCALE
}
