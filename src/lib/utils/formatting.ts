import { format, formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'

export function formatCurrency(value: number) {
  if (Number.isNaN(value) || value === null || value === undefined) return '0,00 €'
  // Format with guaranteed thousands separator (use de-DE which always uses separators, then adjust)
  const formatted = new Intl.NumberFormat('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
  // de-DE uses . for thousands and , for decimals: "1.780,26 €"
  // pt-PT uses space for thousands and , for decimals: "1 780,26 €"
  // Replace . with narrow no-break space (U+202F) for proper Portuguese formatting
  return formatted.replace(/\./g, ' ')
}

export function formatNumber(value: number, decimals = 2) {
  if (Number.isNaN(value) || value === null || value === undefined) return '0,00'
  // Use de-DE for consistent thousands separators, then replace . with space for Portuguese format
  const formatted = new Intl.NumberFormat('de-DE', { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  }).format(value)
  return formatted.replace(/\./g, ' ')
}

export function formatDate(date: Date | string | number) {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy', { locale: pt })
}

export function formatShortDate(date: Date | string | number) {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  return format(d, 'dd MMM', { locale: pt })
}

export function formatRelative(date: Date | string | number) {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: pt })
}

export function formatMonthYear(date: Date | string | number) {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  return format(d, 'MMM yyyy', { locale: pt })
}

/**
 * Parse a localized numeric string, e.g. "1.234,56" or "10,50" -> 1234.56 or 10.5
 */
export function parseLocalizedNumber(input: string | number | undefined | null): number {
  if (input === undefined || input === null || input === '') return 0
  if (typeof input === 'number') return input
  let s = String(input || '')
  s = s.trim()
  // Handle (123,45) as negative number
  let negative = false
  if (s.startsWith('(') && s.endsWith(')')){ negative = true; s = s.slice(1, -1).trim() }
  // Normalize minus sign and remove currency symbol, spaces and NBSPs
  s = s.replace(/\u2212/g, '-')
  s = s.replace(/\u00A0/g, '').replace(/\s/g, '')
  s = s.replace(/€|EUR|eur|\$/g, '')
  // Remove thousands separator (.) and replace decimal separator (,) with dot
  const normalized = s.replace(/\./g, '').replace(/,/g, '.')
  const n = Number(normalized)
  if (Number.isNaN(n)) return 0
  return negative ? -n : n
}
