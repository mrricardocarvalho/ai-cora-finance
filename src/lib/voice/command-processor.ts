// Hypothetical, we'll use client router usually
// We'll define a simple command structure

export type VoiceCommandAction = 
  | { type: 'NAVIGATE', path: string }
  | { type: 'ADD_TRANSACTION', amount: number, description: string, category?: string }
  | { type: 'UNKNOWN', transcript: string }

export function processVoiceCommand(transcript: string): VoiceCommandAction {
  const lower = transcript.toLowerCase().trim()

  // Navigation
  if (lower.includes('dashboard') || lower.includes('home')) {
    return { type: 'NAVIGATE', path: '/' }
  }
  if (lower.includes('transactions') || lower.includes('history')) {
    return { type: 'NAVIGATE', path: '/transactions' }
  }
  if (lower.includes('planning') || lower.includes('budget')) {
    return { type: 'NAVIGATE', path: '/planning' }
  }
  if (lower.includes('invest') || lower.includes('portfolio')) {
    return { type: 'NAVIGATE', path: '/portfolio' }
  }
  if (lower.includes('settings') || lower.includes('profile')) {
    return { type: 'NAVIGATE', path: '/settings' }
  }

  // Add Transaction: "Spent 50 on food"
  const spentMatch = lower.match(/spent\s+(\d+([.,]\d{1,2})?)\s+(?:on\s+)?(.+)/)
  if (spentMatch) {
    const amount = parseFloat(spentMatch[1].replace(',', '.'))
    const description = spentMatch[3]
    return { type: 'ADD_TRANSACTION', amount: -amount, description }
  }

  // Add Income: "Received 1000 from salary"
  const incomeMatch = lower.match(/received\s+(\d+([.,]\d{1,2})?)\s+(?:from\s+)?(.+)/)
  if (incomeMatch) {
    const amount = parseFloat(incomeMatch[1].replace(',', '.'))
    const description = incomeMatch[3]
    return { type: 'ADD_TRANSACTION', amount, description }
  }

  return { type: 'UNKNOWN', transcript }
}
