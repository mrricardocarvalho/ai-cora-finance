import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { formatCurrency, formatNumber, formatDate, formatShortDate, formatRelative, parseLocalizedNumber, formatMonthYear } from './utils/formatting'
export { celebrate } from './utils/celebrate'

