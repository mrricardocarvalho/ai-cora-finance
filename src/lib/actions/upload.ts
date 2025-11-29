 'use server'
import pdf from 'pdf-parse'
import { extractTransactionsFromText } from '../ai/extract'
import { createClient as createServerSupabase } from '../supabase/server'
import crypto from 'crypto'

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

  // OPTIONAL: account id passed in form
  const accountId = String(formData.get('account_id') || '') || undefined

  // Call AI extraction
  let structured
  try {
    structured = await extractTransactionsFromText(rawText)
  } catch (e) {
    return { success: false, error: String(e) }
  }

  // Insert transactions into DB using server Supabase client
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return { success: false, error: 'Not authenticated' }

  let accId = accountId
  if (!accId) {
    const res = await supabase.from('accounts').select('id').limit(1)
    accId = res.data?.[0]?.id
  }
  if (!accId) return { success: false, error: 'No account found to associate transactions. Please select an account.' }
  const toInsert = structured.transactions.map(t => ({ id: crypto.randomUUID(), account_id: accId, user_id: user.id, amount: t.amount, date: t.date, description: t.description, category: t.category, confidence_score: t.confidence }))
  const insertRes = await supabase.from('transactions').insert(toInsert).select()
  if (insertRes.error) return { success: false, error: insertRes.error.message }

  return { success: true, text: rawText, inserted: insertRes.data?.length || 0 }
}
