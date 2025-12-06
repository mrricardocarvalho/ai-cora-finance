'use server'
import pdf from 'pdf-parse'
import { createClient as createServerSupabase } from '../supabase/server'
import { extractTransactionsFromText } from '../ai/extract'
import { parseMoeyStatement, isMoeyStatement } from '../parsers/moey'
import { detectRecurringPatterns } from '../intelligence/recurring'
import { generateInsights } from '../intelligence/insights'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import type { OpenRouterModel } from '../ai/openrouter'

// Parsing method options
export type ParsingMethod = 'auto' | 'regex' | 'ai'

// Account type mapping for multi-account PDFs
type AccountType = 'checking' | 'savings' | 'credit_card' | 'broker'

interface AccountMapping {
  account_type: AccountType
  account_id: string
  account_name: string
}

interface MultiAccountResult {
  accounts: Array<{
    account_type: string
    transactions: Array<{
      date: string
      description: string
      amount: number
      category: string
      confidence: number
    }>
  }>
}

interface SingleAccountResult {
  transactions: Array<{
    date: string
    description: string
    amount: number
    category: string
    confidence: number
  }>
}

function isMultiAccountResult(result: unknown): result is MultiAccountResult {
  return result !== null && typeof result === 'object' && 'accounts' in result
}

export async function parseStatementPDF(formData: FormData) {
  if (!formData) throw new Error('No form data')
  const file = formData.get('file') as File | null
  if (!file) throw new Error('No file uploaded')
  // Validate type
  const name = file.name || ''
  if (!name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    throw new Error('Only PDF files are accepted')
  }
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) throw new Error('File too large')
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  // Parse PDF in-memory
  const data = await pdf(buffer)
  const rawText = data.text || ''

  // OPTIONAL: account id passed in form (for single-account mode)
  const accountId = String(formData.get('account_id') || '') || undefined
  
  // Parsing method: 'auto', 'regex', or 'ai'
  const parsingMethod = (formData.get('parsing_method') as ParsingMethod) || 'auto'
  
  // AI model selection (only used if parsingMethod is 'ai' or 'auto' falls back to AI)
  const aiModel = (formData.get('ai_model') as OpenRouterModel) || undefined

  // Stage 1: only return the raw text extracted from the PDF unless processing is requested
  const processTransactions = String(formData.get('process_transactions') || formData.get('consent_send_to_ai') || '') === 'true'
  
  // Check if this looks like a Moey statement
  const isMoey = isMoeyStatement(rawText)
  
  if (!processTransactions) {
    return { success: true, text: rawText, isMoeyDetected: isMoey }
  }

  // Proceed with extraction and insertion
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Validate account if provided
  if (accountId) {
    const check = await supabase.from('accounts').select('id').eq('id', accountId).eq('user_id', user.id).limit(1)
    if (!check.data || check.data.length === 0) {
      return { success: false, error: 'Account not found or unauthorized' }
    }
  }

  // Get all user accounts for multi-account matching
  const { data: userAccounts } = await supabase
    .from('accounts')
    .select('id, name, type')
    .eq('user_id', user.id)

  if (!userAccounts || userAccounts.length === 0) {
    return { success: false, error: 'No accounts found. Please create accounts first.' }
  }

  // Build account type to ID mapping
  const accountTypeMap: Map<string, AccountMapping> = new Map()
  for (const acc of userAccounts) {
    const accType = acc.type as AccountType
    // Store the first account of each type (user can have multiple checking accounts, we pick first)
    if (!accountTypeMap.has(accType)) {
      accountTypeMap.set(accType, {
        account_type: accType,
        account_id: acc.id,
        account_name: acc.name
      })
    }
  }

  // Determine which parsing method to use
  let useRegex = false
  let methodUsed: 'regex' | 'ai' = 'ai'
  
  if (parsingMethod === 'regex') {
    useRegex = true
  } else if (parsingMethod === 'ai') {
    useRegex = false
  } else {
    // Auto mode: use regex for Moey statements, AI for others
    if (isMoey) {
      useRegex = true
    }
  }

  let structured: MultiAccountResult | SingleAccountResult
  try {
    if (useRegex) {
      // Use regex-based Moey parser
      const moeyResult = parseMoeyStatement(rawText)
      
      if (moeyResult.totalTransactions === 0) {
        // Fall back to AI if regex found nothing
        if (parsingMethod === 'auto') {
          structured = await extractTransactionsFromText(rawText, aiModel)
          methodUsed = 'ai'
        } else {
          return { success: false, error: 'No transactions found. The PDF format may not be supported by the regex parser. Try AI mode.' }
        }
      } else {
        structured = { accounts: moeyResult.accounts }
        methodUsed = 'regex'
      }
    } else {
      // Use AI-based extraction via OpenRouter
      structured = await extractTransactionsFromText(rawText, aiModel)
      methodUsed = 'ai'
    }
  } catch (e) {
    return { success: false, error: String(e) }
  }

  const MAX_INSERT = 1000
  let totalTransactions = 0
  const insertResults: Array<{ account_name: string; account_type: string; count: number }> = []
  const allInsertedData: Array<{ date: string }> = []

  if (isMultiAccountResult(structured)) {
    // Multi-account PDF processing
    for (const accGroup of structured.accounts) {
      const accType = accGroup.account_type as AccountType
      const mapping = accountTypeMap.get(accType)
      
      if (!mapping) {
        console.warn(`No ${accType} account found for user, skipping ${accGroup.transactions.length} transactions`)
        continue
      }

      totalTransactions += accGroup.transactions.length
      if (totalTransactions > MAX_INSERT) {
        return { success: false, error: `Too many transactions (${totalTransactions}). Max supported per upload: ${MAX_INSERT}` }
      }

      const toInsert = accGroup.transactions.map(t => ({
        id: crypto.randomUUID(),
        account_id: mapping.account_id,
        user_id: user.id,
        amount: t.amount,
        date: t.date,
        description: t.description,
        category: t.category
      }))

      const insertRes = await supabase.from('transactions').insert(toInsert).select()
      if (insertRes.error) {
        return { success: false, error: `Error inserting to ${mapping.account_name}: ${insertRes.error.message}` }
      }

      insertResults.push({
        account_name: mapping.account_name,
        account_type: accType,
        count: insertRes.data?.length || 0
      })

      if (insertRes.data) {
        allInsertedData.push(...(insertRes.data as Array<{ date: string }>))
      }
    }
  } else {
    // Single-account PDF processing (legacy behavior)
    let accId = accountId
    if (!accId) {
      // Default to first account
      accId = userAccounts[0].id
    } else {
      const check = await supabase.from('accounts').select('id').eq('id', accId).eq('user_id', user.id).limit(1)
      if (!check.data || check.data.length === 0) {
        return { success: false, error: 'Account not found or unauthorized' }
      }
    }

    totalTransactions = structured.transactions.length
    if (totalTransactions > MAX_INSERT) {
      return { success: false, error: `Too many transactions (${totalTransactions}). Max supported per upload: ${MAX_INSERT}` }
    }

    const toInsert = structured.transactions.map(t => ({
      id: crypto.randomUUID(),
      account_id: accId,
      user_id: user.id,
      amount: t.amount,
      date: t.date,
      description: t.description,
      category: t.category
    }))

    const insertRes = await supabase.from('transactions').insert(toInsert).select()
    if (insertRes.error) return { success: false, error: insertRes.error.message }

    const matchedAccount = userAccounts.find(a => a.id === accId)
    insertResults.push({
      account_name: matchedAccount?.name || 'Unknown',
      account_type: matchedAccount?.type || 'checking',
      count: insertRes.data?.length || 0
    })

    if (insertRes.data) {
      allInsertedData.push(...(insertRes.data as Array<{ date: string }>))
    }
  }

  await revalidatePath('/data')
  
  // Run recurring detection in the background (best-effort)
  try {
    await detectRecurringPatterns(user.id)
    await generateInsights(user.id)
    // Recalculate monthly summaries for all months included in the inserted transactions
    try {
      const months = Array.from(new Set(allInsertedData.map((t) => new Date(t.date).toISOString().slice(0, 7))))
      for (const m of months) {
        const d = new Date(`${m}-01`).toISOString()
        await import('./analytics').then(mod => mod.recalculateMonthlySummary(user.id, d))
      }
    } catch (e) { console.warn('recalc monthly summaries failed', e) }
    
    // Recalculate account balances after importing transactions
    try {
      await import('./accounts').then(mod => mod.recalculateAllAccountBalances(user.id))
    } catch (e) { console.warn('recalc account balances failed', e) }
  } catch (e) { console.warn('Recurring detection failed:', e) }

  const totalInserted = insertResults.reduce((sum, r) => sum + r.count, 0)
  
  return { 
    success: true, 
    text: rawText, 
    inserted: totalInserted,
    accountBreakdown: insertResults,
    isMultiAccount: isMultiAccountResult(structured),
    parsingMethod: methodUsed,
    isMoeyDetected: isMoey
  }
}
