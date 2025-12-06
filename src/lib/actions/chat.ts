"use server"

import { createClient } from '../supabase/server'
import { callOpenRouter } from '../ai/openrouter'
import { revalidatePath } from 'next/cache'
import { runProactiveAnalysis, type ProactiveInsight } from '../intelligence/proactive-analysis'
import type { Locale } from '../i18n/translations'

// Types
export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  suggested_questions?: string[]
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface CoraGreeting {
  greeting: string
  insights: ProactiveInsight[]
}

interface FinancialContext {
  accounts: Array<{ name: string; type: string; balance: number }>
  netWorth: number
  safeToSpend: number
  comfortFloor: number
  recentTransactions: Array<{ date: string; description: string; amount: number; category: string }>
  monthlySummaries: Array<{ month: string; total_in: number; total_out: number; savings_rate: number }> 
  currentMonthSummary: { total_in: number; total_out: number; savings_rate: number } | null
  recurringPatterns: Array<{ merchant_name: string; amount: number; frequency: string }>
}

// Get user's financial context for AI
async function getFinancialContext(userId: string): Promise<FinancialContext> {
  const supabase = await createClient()
  
  // Fetch accounts
  const { data: accounts } = await supabase
    .from('accounts')
    .select('name, type, balance')
    .eq('user_id', userId)
  
  // Fetch profile for comfort floor
  const { data: profile } = await supabase
    .from('profiles')
    .select('comfort_floor')
    .eq('id', userId)
    .single()
  
  // Fetch recent transactions (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { data: transactions } = await supabase
    .from('transactions')
    .select('date, description, amount, category')
    .eq('user_id', userId)
    .gte('date', thirtyDaysAgo.toISOString())
    .order('date', { ascending: false })
    .limit(50)
  
  // Fetch all monthly summaries (historical data for context)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const { data: allMonthlySummaries } = await supabase
    .from('monthly_summaries')
    .select('month, total_in, total_out, savings_rate')
    .eq('user_id', userId)
    .order('month', { ascending: false })
    .limit(12) // Last 12 months of history
  
  // Extract current month summary if available
  const currentMonthStr = startOfMonth.toISOString()
  const monthlySummary = allMonthlySummaries?.find(s => s.month === currentMonthStr) || null
  
  // Fetch recurring patterns
  const { data: recurringPatterns } = await supabase
    .from('recurring_patterns')
    .select('merchant_name, amount, frequency')
    .eq('user_id', userId)
    .eq('is_active', true)
  
  // Calculate totals
  const accountList = (accounts || []).map(a => ({
    name: a.name,
    type: a.type,
    balance: Number(a.balance || 0)
  }))
  
  const netWorth = accountList.reduce((sum, a) => sum + a.balance, 0)
  const comfortFloor = Number(profile?.comfort_floor || 0)
  
  // Simple safe-to-spend calculation
  const recurringTotal = (recurringPatterns || []).reduce((sum, r) => sum + Math.abs(Number(r.amount || 0)), 0)
  const safeToSpend = netWorth - comfortFloor - recurringTotal
  
  return {
    accounts: accountList,
    netWorth,
    safeToSpend,
    comfortFloor,
    recentTransactions: (transactions || []).map(t => ({
      date: t.date,
      description: t.description || '',
      amount: Number(t.amount || 0),
      category: t.category || 'Uncategorized'
    })),
    monthlySummaries: (allMonthlySummaries || []).map(s => ({
      month: s.month,
      total_in: Number(s.total_in || 0),
      total_out: Number(s.total_out || 0),
      savings_rate: Number(s.savings_rate || 0)
    })),
    currentMonthSummary: monthlySummary ? {
      total_in: Number(monthlySummary.total_in || 0),
      total_out: Number(monthlySummary.total_out || 0),
      savings_rate: Number(monthlySummary.savings_rate || 0)
    } : null,
    recurringPatterns: (recurringPatterns || []).map(r => ({
      merchant_name: r.merchant_name,
      amount: Number(r.amount || 0),
      frequency: r.frequency || 'monthly'
    }))
  }
}

// Build system prompt with financial context
function buildSystemPrompt(context: FinancialContext, locale: Locale = 'pt-PT'): string {
  const formatCurrency = (n: number) => n.toLocaleString(locale, { style: 'currency', currency: 'EUR' })
  
  const languageInstruction = locale === 'en-US' 
    ? 'IMPORTANT: The user has set their language preference to English. You MUST respond in English.'
    : 'IMPORTANTE: O utilizador definiu o seu idioma como Português. DEVES responder em Português.'
  
  // Portuguese Tax Knowledge Section
  const taxKnowledge = `
## Portuguese Tax Knowledge (IRS)
You have knowledge of the Portuguese tax system. When users ask about taxes, provide helpful information:

**IRS Income Tax Brackets (2024):**
- Up to €7,703: 13.25%
- €7,703 - €11,623: 18%
- €11,623 - €16,472: 23%
- €16,472 - €21,321: 26%
- €21,321 - €27,146: 32.75%
- €27,146 - €39,791: 37%
- €39,791 - €51,997: 43.5%
- €51,997 - €81,199: 45%
- Above €81,199: 48%

**Key Deductions:**
- Health: 15% of expenses, max €1,000
- Education: 30% of expenses, max €800
- Rent: 15% of rent, max €502 (€800 in interior)
- General expenses: 35% of VAT, max €250

**Capital Gains:**
- Stocks, bonds, funds: 28% flat rate
- Crypto (< 1 year): 28%, (> 1 year): exempt

**Key Dates:**
- Feb 25: e-Fatura invoice verification deadline
- Apr 1 - Jun 30: IRS declaration period
- IMI (property tax): May, August, November

**e-Fatura:** All invoices with NIF are registered at faturas.portaldasfinancas.gov.pt. Users must verify and categorize invoices before Feb 25 for deductions.

**IRS Jovem (Young Worker):** Tax benefits for workers 18-26 (or 30 with degree). First year: 100% exempt up to €20,000.

When answering tax questions:
1. Provide accurate information based on the above
2. Always remind that this is educational, not professional tax advice
3. Recommend consulting a certified accountant (Contabilista Certificado) for complex situations
4. Reference official portals: Portal das Finanças, e-Fatura`

  return `You are Cora, a friendly and knowledgeable personal finance assistant. You help users understand their finances, answer questions about their spending, and provide guidance.

## Language Preference
${languageInstruction}

## Your Personality
- Warm, supportive, and encouraging
- Explain financial concepts simply
- Always provide context and explain WHY, not just WHAT
- Be proactive with helpful observations
- Respond in the user's preferred language (see Language Preference above)

## User's Financial Context
**Accounts:**
${context.accounts.map(a => `- ${a.name} (${a.type}): ${formatCurrency(a.balance)}`).join('\n') || '- No accounts yet'}

**Summary:**
- Net Worth: ${formatCurrency(context.netWorth)}
- Safe to Spend: ${formatCurrency(context.safeToSpend)}
- Comfort Floor: ${formatCurrency(context.comfortFloor)}

**This Month:**
${context.currentMonthSummary 
  ? `- Income: ${formatCurrency(context.currentMonthSummary.total_in)}
- Spending: ${formatCurrency(context.currentMonthSummary.total_out)}
- Savings Rate: ${context.currentMonthSummary.savings_rate.toFixed(1)}%`
  : '- No data for this month yet'}

**Monthly History (last 12 months):**
${context.monthlySummaries.length > 0
  ? context.monthlySummaries.map(s => {
      const date = new Date(s.month)
      const monthName = date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
      return `- ${monthName}: In ${formatCurrency(s.total_in)}, Out ${formatCurrency(s.total_out)}, Savings ${s.savings_rate.toFixed(1)}%`
    }).join('\n')
  : '- No historical data available'}

**Recurring Bills:**
${context.recurringPatterns.map(r => `- ${r.merchant_name}: ${formatCurrency(Math.abs(r.amount))} (${r.frequency})`).join('\n') || '- No recurring patterns detected'}

**Recent Transactions (last 30 days):**
${context.recentTransactions.slice(0, 15).map(t => 
  `- ${new Date(t.date).toLocaleDateString(locale)}: ${t.description} - ${formatCurrency(t.amount)} [${t.category}]`
).join('\n') || '- No recent transactions'}

${taxKnowledge}

## Guidelines
1. Answer questions about spending, budgets, and finances using the context above
2. If asked about something you don't have data for, say so honestly
3. When discussing spending, group by category when relevant
4. Suggest actionable next steps when appropriate
5. For tax questions specific to Portugal, use the Portuguese Tax Knowledge above
6. Keep responses concise but complete
7. Use markdown formatting for clarity (lists, bold, etc.)
8. At the end of longer responses, suggest 2-3 relevant follow-up questions the user might want to ask

## Important
- This is educational guidance, not regulated financial advice
- Be accurate with the numbers from the context
- If calculations are needed, show your work briefly`
}

// Create a new conversation
export async function createConversation(userId: string): Promise<{ success: boolean; data?: Conversation; error?: string }> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId })
    .select()
    .single()
  
  if (error) return { success: false, error: error.message }
  
  return { success: true, data: data as Conversation }
}

// Get all conversations for a user
export async function getConversations(userId: string): Promise<{ success: boolean; data?: Conversation[]; error?: string }> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  
  if (error) return { success: false, error: error.message }
  
  return { success: true, data: data as Conversation[] }
}

// Get messages for a conversation
export async function getMessages(conversationId: string): Promise<{ success: boolean; data?: Message[]; error?: string }> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  
  if (error) return { success: false, error: error.message }
  
  // Parse suggested_questions from JSON string
  const messages = (data || []).map(m => ({
    ...m,
    suggested_questions: m.suggested_questions ? JSON.parse(m.suggested_questions) : undefined
  }))
  
  return { success: true, data: messages as Message[] }
}

// Send a message and get AI response
export async function sendMessage(
  userId: string,
  conversationId: string,
  userMessage: string,
  locale: Locale = 'pt-PT'
): Promise<{ success: boolean; data?: Message; error?: string }> {
  const supabase = await createClient()
  
  try {
    // Save user message
    const { error: userMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        role: 'user',
        content: userMessage
      })
    
    if (userMsgError) throw new Error(userMsgError.message)
    
    // Get conversation history for context
    const { data: history } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20) // Keep last 20 messages for context
    
    // Get financial context
    const financialContext = await getFinancialContext(userId)
    
    // Build messages for OpenRouter
    const systemPrompt = buildSystemPrompt(financialContext, locale)
    const chatMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...(history || []).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    ]
    
    // Call OpenRouter with higher temperature for conversational responses
    const assistantContent = await callOpenRouter(chatMessages, undefined, 1000, 0.7)
    
    // Extract suggested questions if present in the response
    let suggestedQuestions: string[] = []
    const suggestionsMatch = assistantContent.match(/(?:Perguntas sugeridas|Sugestões|You might also ask|Follow-up questions):?\s*\n((?:[-•*]\s*.+\n?)+)/i)
    if (suggestionsMatch) {
      suggestedQuestions = suggestionsMatch[1]
        .split('\n')
        .map(q => q.replace(/^[-•*]\s*/, '').trim())
        .filter(q => q.length > 0)
        .slice(0, 3)
    }
    
    // Save assistant message
    const { data: assistantMsg, error: assistantMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        role: 'assistant',
        content: assistantContent,
        suggested_questions: suggestedQuestions.length > 0 ? JSON.stringify(suggestedQuestions) : null
      })
      .select()
      .single()
    
    if (assistantMsgError) throw new Error(assistantMsgError.message)
    
    // Update conversation title if it's the first message
    const { data: msgCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('conversation_id', conversationId)
    
    if (msgCount && msgCount.length <= 2) {
      // Generate a title from the first user message
      const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '')
      await supabase
        .from('conversations')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', conversationId)
    } else {
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)
    }
    
    revalidatePath('/chat')
    
    return {
      success: true,
      data: {
        ...assistantMsg,
        suggested_questions: suggestedQuestions
      } as Message
    }
  } catch (error) {
    console.error('sendMessage error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Delete a conversation
export async function deleteConversation(conversationId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/chat')
  return { success: true }
}

// Get or create the user's primary conversation (single continuous chat)
export async function getOrCreatePrimaryConversation(userId: string): Promise<{ success: boolean; data?: Conversation; error?: string }> {
  const supabase = await createClient()
  
  // Get the most recent conversation
  const { data: existing, error: fetchError } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()
  
  if (existing && !fetchError) {
    return { success: true, data: existing as Conversation }
  }
  
  // Create a new primary conversation
  const { data: created, error: createError } = await supabase
    .from('conversations')
    .insert({ 
      user_id: userId,
      title: 'Conversa com a Cora'
    })
    .select()
    .single()
  
  if (createError) {
    return { success: false, error: createError.message }
  }
  
  return { success: true, data: created as Conversation }
}

// Get proactive greeting with insights
export async function getCoraGreeting(userId: string): Promise<{ success: boolean; data?: CoraGreeting; error?: string }> {
  try {
    const { getServerLocale } = await import('../i18n/server')
    const locale = await getServerLocale()
    const analysis = await runProactiveAnalysis(userId, locale)
    
    const isEnglish = locale === 'en-US'
    
    if (!analysis.success) {
      return { 
        success: true, 
        data: { 
          greeting: isEnglish 
            ? 'Hi! I\'m here to help you with your finances.'
            : 'Olá! Estou aqui para te ajudar com as tuas finanças.', 
          insights: [] 
        } 
      }
    }
    
    return {
      success: true,
      data: {
        greeting: analysis.greeting,
        insights: analysis.insights
      }
    }
  } catch (error) {
    console.error('getCoraGreeting error:', error)
    // Note: locale may not be available in error case, fallback to Portuguese
    return { 
      success: true, 
      data: { 
        greeting: 'Hi! How can I help you today? / Olá! Como posso ajudar-te hoje?', 
        insights: [] 
      } 
    }
  }
}
