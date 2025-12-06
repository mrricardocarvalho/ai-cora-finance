'use server'
import { callOpenRouter, OpenRouterModel } from './openrouter'
import { TransactionExtractionSchema, MultiAccountExtractionSchema } from './schemas'
import { systemPrompt, sampleInstruction } from './prompts'

/**
 * Sanitize PDF text to remove sensitive personal data before sending to AI.
 * We keep only the information needed for transaction extraction:
 * - Transaction lines (date, description, amount)
 * - Account section headers (to identify checking vs savings)
 * 
 * We remove:
 * - Account numbers (IBAN, card numbers)
 * - Personal names (when possible)
 * - Addresses
 * - Full balance information (we only need transaction amounts)
 */
function sanitizeTextForAI(text: string): string {
  let sanitized = text
  
  // Remove IBAN numbers (PT50 followed by digits)
  sanitized = sanitized.replace(/PT\d{2}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{1}/gi, '[IBAN_REDACTED]')
  
  // Remove any sequence that looks like an IBAN
  sanitized = sanitized.replace(/[A-Z]{2}\d{2}[\s\d]{16,30}/g, '[IBAN_REDACTED]')
  
  // Remove card numbers (16 digits with optional spaces/dashes)
  sanitized = sanitized.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD_REDACTED]')
  
  // Remove NIB (21 digits)
  sanitized = sanitized.replace(/\b\d{21}\b/g, '[NIB_REDACTED]')
  
  // Remove NIF/Contribuinte (9 digits preceded by "NIF" or "Contribuinte")
  sanitized = sanitized.replace(/(?:NIF|Contribuinte|VAT)[:\s]*\d{9}/gi, '[NIF_REDACTED]')
  
  // Remove email addresses
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
  
  // Remove phone numbers (Portuguese format)
  sanitized = sanitized.replace(/(?:\+351|00351|351)?[\s.-]?\d{3}[\s.-]?\d{3}[\s.-]?\d{3}/g, '[PHONE_REDACTED]')
  
  // Remove postal codes with addresses (Portuguese format: XXXX-XXX)
  sanitized = sanitized.replace(/\d{4}-\d{3}\s+[A-Za-zÀ-ÿ\s]+(?:,\s*[A-Za-zÀ-ÿ\s]+)?/g, '[ADDRESS_REDACTED]')
  
  return sanitized
}

function normalizeAmount(raw: string | number) {
  if (typeof raw === 'number') return raw
  if (typeof raw !== 'string') return NaN
  // remove non-numeric except comma and dot and minus
  const cleaned = raw.replace(/[^0-9.,-]/g, '')
  // handle Portuguese format: 1.234,56 => 1234.56
  const parts = cleaned.split(',')
  if (parts.length === 1) {
    return Number(cleaned.replace(/\./g, ''))
  }
  const decimals = parts.pop()
  const intPart = parts.join('')
  return Number(`${intPart}.${decimals}`)
}

function normalizeDate(raw: string) {
  if (!raw) return null
  // If already ISO-ish
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  // dd/mm/yyyy -> yyyy-mm-dd
  const m = raw.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (m) return `${m[3]}-${m[2]}-${m[1]}`
  // dd-mm-yyyy -> yyyy-mm-dd
  const m2 = raw.match(/(\d{2})-(\d{2})-(\d{4})/)
  if (m2) return `${m2[3]}-${m2[2]}-${m2[1]}`
  // Try parseable string fallback
  const d = new Date(raw)
  if (!isNaN(d.getTime())) return d.toISOString().slice(0,10)
  return null
}

function mapCategory(raw?: string) {
  if (!raw) return 'Uncategorized'
  const key = raw.toLowerCase()
  if (['transfer', 'trsf', 'transferencia', 'transferência'].some(k => key.includes(k))) return 'Transfer'
  if (['groceries', 'food', 'restaurants', 'dining', 'almoco', 'restaurante'].some(k => key.includes(k))) return 'Food'
  if (['salary', 'income', 'refund', 'deposit'].some(k => key.includes(k))) return 'Income'
  if (['transport', 'fuel', 'taxi', 'gasolina', 'galp', 'metro', 'train', 'comboios', 'bus', 'autocarro', 'bp'].some(k => key.includes(k))) return 'Transport'
  if (['rent', 'housing', 'moradia', 'aluguel', 'aluguer'].some(k => key.includes(k))) return 'Housing'
  if (['edp', 'utilities', 'water', 'electric', 'electricity', 'energia', 'água', 'agua', 'nos', 'vodafone', 'meo'].some(k => key.includes(k))) return 'Utilities'
  if (['insurance', 'seguros'].some(k => key.includes(k))) return 'Insurance'
  if (['pharmacy', 'farmacia', 'health', 'saude', 'saúde'].some(k => key.includes(k))) return 'Healthcare'
  if (['bank', 'tax', 'finance', 'financial', 'taxa'].some(k => key.includes(k))) return 'Financial'
  if (['shopping', 'lifestyle', 'clothes', 'fashion', 'loja'].some(k => key.includes(k))) return 'Lifestyle'
  return 'Uncategorized'
}

type RawTx = Record<string, unknown>

function processTransactions(rawTxs: RawTx[]) {
  return rawTxs.map((t: RawTx) => {
    const rawDate = t['date'] as string | undefined
    const rawAmount = t['amount'] as string | number | undefined
    const rawDesc = t['description'] as string | undefined
    const rawCategory = t['category'] as string | undefined
    const rawConfidence = t['confidence'] as string | number | undefined
    const date = normalizeDate(rawDate || '')
    const amount = normalizeAmount(rawAmount as string | number)
    const description = typeof rawDesc === 'string' ? rawDesc : String(rawDesc || '')
    const category = mapCategory(typeof rawCategory === 'string' ? rawCategory : 'Uncategorized')
    let confidence = Number(rawConfidence ?? 0)
    if (Number.isNaN(confidence)) confidence = 0
    if (confidence < 0) confidence = 0
    if (confidence > 1) confidence = 1
    return { date, description, amount, category, confidence }
  }).filter((x) => x.date && !Number.isNaN(Number(x.amount)))
}

export async function extractTransactionsFromText(text: string, model?: OpenRouterModel) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not set. Please add it to your .env file.')
  
  // Sanitize text to remove sensitive data before sending to AI
  const sanitizedText = sanitizeTextForAI(text)
  const prompt = `${sampleInstruction}\n\nTEXT:\n${sanitizedText}`

  // Call OpenRouter API
  const assistant = await callOpenRouter(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    model,
    4000
  )

  if (!assistant) throw new Error('Empty AI response')

  // parse JSON from assistant response
  let parsed: unknown
  try {
    // attempt to locate JSON in the response
    const jsonStart = assistant.indexOf('{')
    const json = assistant.slice(jsonStart)
    parsed = JSON.parse(json)
  } catch {
    throw new Error('AI returned invalid JSON')
  }

  // Check if this is multi-account format
  if (parsed && typeof parsed === 'object' && 'accounts' in parsed) {
    const multiParsed = parsed as { accounts?: Array<{ account_type?: string; transactions?: RawTx[] }> }
    if (Array.isArray(multiParsed.accounts)) {
      const processedAccounts = multiParsed.accounts.map(acc => ({
        account_type: acc.account_type || 'checking',
        transactions: processTransactions(acc.transactions || [])
      })).filter(acc => acc.transactions.length > 0)
      
      const final = { accounts: processedAccounts }
      const zres = MultiAccountExtractionSchema.safeParse(final)
      if (!zres.success) throw new Error('AI output failed multi-account schema: ' + zres.error.message)
      return zres.data
    }
  }

  // Legacy single-account format
  if (parsed && typeof parsed === 'object' && 'transactions' in parsed) {
    const singleParsed = parsed as { transactions?: RawTx[] }
    if (Array.isArray(singleParsed.transactions)) {
      const coerced = processTransactions(singleParsed.transactions)
      const final = { transactions: coerced }
      const zres = TransactionExtractionSchema.safeParse(final)
      if (!zres.success) throw new Error('AI output failed schema: ' + zres.error.message)
      return zres.data
    }
  }

  throw new Error('AI output did not match expected format')
}
