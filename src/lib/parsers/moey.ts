/**
 * Moey Bank PDF Parser
 * 
 * Parses Moey bank statements without AI.
 * Handles both "CONTA MOEY / MOEY ACCOUNT" (checking) and "CONTA POUPANÇA / SAVINGS" sections.
 * 
 * PDF Format:
 * - Account sections separated by headers
 * - Transaction format: DD-MM-YYYY / DD-MM-YYYY DESCRIPTION AMOUNT +/- BALANCE
 * - Portuguese number format: 1.234,56
 */

interface ParsedTransaction {
  date: string // ISO format YYYY-MM-DD
  description: string
  amount: number // negative for expenses, positive for income
  category: string
  confidence: number
}

interface AccountTransactions {
  account_type: 'checking' | 'savings'
  transactions: ParsedTransaction[]
}

interface MoeyParseResult {
  accounts: AccountTransactions[]
  totalTransactions: number
}

// Regex to match Moey transaction lines - more flexible pattern
// The PDF format has transactions split across TWO lines:
// Line 1: 01-08-2025  /  30-07-2025COMPRA BP CANECASCANE 6826140
// Line 2:   50,00  -63.361,54
// Note: NO space between value date and description!

// Pattern to match a transaction header line (dates + description)
const TRANSACTION_HEADER_REGEX = /(\d{2}-\d{2}-\d{4})\s*\/\s*(\d{2}-\d{2}-\d{4})([A-Za-z].+?)$/gm

// Pattern to match amount line that follows (amount +/- balance)
const AMOUNT_LINE_REGEX = /^\s*(\d{1,3}(?:\.\d{3})*,\d{2})\s*([+-])\s*(\d{1,3}(?:\.\d{3})*,\d{2})/m

// Legacy single-line regex (keeping for reference but not using)
const TRANSACTION_REGEX = /(\d{2}-\d{2}-\d{4})\s*\/\s*(\d{2}-\d{2}-\d{4})\s+(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s*([+-])\s+(\d{1,3}(?:\.\d{3})*,\d{2})/g

// Alternative line-by-line regex (for when text has proper line breaks)
const TRANSACTION_LINE_REGEX = /^(\d{2}-\d{2}-\d{4})\s*\/\s*\d{2}-\d{2}-\d{4}\s+(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s*([+-])\s+\d{1,3}(?:\.\d{3})*,\d{2}$/

// Section headers
const CHECKING_HEADER = /CONTA MOEY\s*\/\s*MOEY ACCOUNT/i
const SAVINGS_HEADER = /CONTA POUPANÇA\s*\/\s*SAVINGS/i
const TABLE_HEADER = /DATA LANÇAMENTO|ACCOUNT DATE/i

/**
 * Parse Portuguese number format (1.234,56) to number
 */
function parsePortugueseAmount(amountStr: string): number {
  // Remove thousand separators (dots) and replace decimal comma with dot
  const normalized = amountStr.replace(/\./g, '').replace(',', '.')
  return parseFloat(normalized)
}

/**
 * Convert DD-MM-YYYY to YYYY-MM-DD
 */
function parsePortugueseDate(dateStr: string): string {
  const match = dateStr.match(/(\d{2})-(\d{2})-(\d{4})/)
  if (!match) return ''
  return `${match[3]}-${match[2]}-${match[1]}`
}

/**
 * Categorize transaction based on description
 */
function categorizeTransaction(description: string): string {
  const desc = description.toLowerCase()
  
  // Transfers
  if (desc.includes('trsf') || desc.includes('transferencia') || desc.includes('transferência')) {
    return 'Transfer'
  }
  
  // Income
  if (desc.includes('salary') || desc.includes('salario') || desc.includes('salário') || 
      desc.includes('ordenado') || desc.includes('vencimento')) {
    return 'Income'
  }
  
  // Fuel/Transport
  if (desc.includes('bp ') || desc.includes('galp') || desc.includes('repsol') || 
      desc.includes('cepsa') || desc.includes('gasolina') || desc.includes('combustivel') ||
      desc.includes('metro') || desc.includes('comboios') || desc.includes('uber') ||
      desc.includes('bolt') || desc.includes('taxi')) {
    return 'Transport'
  }
  
  // Food & Groceries
  if (desc.includes('pingo doce') || desc.includes('continente') || desc.includes('lidl') ||
      desc.includes('aldi') || desc.includes('mercadona') || desc.includes('intermarche') ||
      desc.includes('minipreco') || desc.includes('jumbo') || desc.includes('auchan')) {
    return 'Groceries'
  }
  
  // Restaurants
  if (desc.includes('restaurante') || desc.includes('mcdonalds') || desc.includes('burger') ||
      desc.includes('pizza') || desc.includes('kfc') || desc.includes('telepizza') ||
      desc.includes('cafe') || desc.includes('padaria') || desc.includes('pastelaria')) {
    return 'Food'
  }
  
  // Utilities
  if (desc.includes('edp') || desc.includes('galp energia') || desc.includes('endesa') ||
      desc.includes('iberdrola') || desc.includes('epal') || desc.includes('agua') ||
      desc.includes('nos ') || desc.includes('vodafone') || desc.includes('meo') ||
      desc.includes('nowo')) {
    return 'Utilities'
  }
  
  // Insurance
  if (desc.includes('seguro') || desc.includes('allianz') || desc.includes('fidelidade') ||
      desc.includes('tranquilidade') || desc.includes('ageas') || desc.includes('generali')) {
    return 'Insurance'
  }
  
  // Healthcare
  if (desc.includes('farmacia') || desc.includes('farmácia') || desc.includes('hospital') ||
      desc.includes('clinica') || desc.includes('clínica') || desc.includes('medico') ||
      desc.includes('médico') || desc.includes('saude') || desc.includes('saúde')) {
    return 'Healthcare'
  }
  
  // Shopping
  if (desc.includes('amazon') || desc.includes('worten') || desc.includes('fnac') ||
      desc.includes('zara') || desc.includes('primark') || desc.includes('h&m') ||
      desc.includes('decathlon') || desc.includes('ikea') || desc.includes('leroy')) {
    return 'Shopping'
  }
  
  // Subscriptions
  if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('disney') ||
      desc.includes('hbo') || desc.includes('prime') || desc.includes('youtube') ||
      desc.includes('apple') || desc.includes('google')) {
    return 'Subscriptions'
  }
  
  // ATM
  if (desc.includes('levantamento') || desc.includes('atm') || desc.includes('multibanco')) {
    return 'Cash'
  }
  
  // Bank fees
  if (desc.includes('comissao') || desc.includes('comissão') || desc.includes('taxa') ||
      desc.includes('anuidade') || desc.includes('juros')) {
    return 'Financial'
  }
  
  return 'Uncategorized'
}

/**
 * Parse a single transaction line
 */
function parseTransactionLine(line: string): ParsedTransaction | null {
  const match = line.match(TRANSACTION_REGEX)
  if (!match) return null
  
  const [, dateStr, description, amountStr, sign] = match
  const date = parsePortugueseDate(dateStr)
  if (!date) return null
  
  let amount = parsePortugueseAmount(amountStr)
  if (sign === '-') {
    amount = -amount
  }
  
  const category = categorizeTransaction(description)
  
  return {
    date,
    description: description.trim(),
    amount,
    category,
    confidence: 0.95 // High confidence for regex parsing
  }
}

/**
 * Main parser function for Moey PDF text
 * Uses two strategies:
 * 1. Line-by-line parsing (for clean PDFs)
 * 2. Global regex matching (for PDFs with concatenated text)
 */
export function parseMoeyStatement(text: string): MoeyParseResult {
  const result: MoeyParseResult = {
    accounts: [],
    totalTransactions: 0
  }
  
  // Strategy 1: Try to find account sections and parse by section
  const checkingMatch = text.match(/CONTA MOEY\s*\/\s*MOEY ACCOUNT/i)
  const savingsMatch = text.match(/CONTA POUPANÇA\s*\/\s*SAVINGS/i)
  
  if (checkingMatch || savingsMatch) {
    // Split text into sections
    let checkingSection = ''
    let savingsSection = ''
    
    if (checkingMatch && savingsMatch) {
      const checkingIdx = text.indexOf(checkingMatch[0])
      const savingsIdx = text.indexOf(savingsMatch[0])
      
      if (checkingIdx < savingsIdx) {
        checkingSection = text.slice(checkingIdx, savingsIdx)
        savingsSection = text.slice(savingsIdx)
      } else {
        savingsSection = text.slice(savingsIdx, checkingIdx)
        checkingSection = text.slice(checkingIdx)
      }
    } else if (checkingMatch) {
      checkingSection = text.slice(text.indexOf(checkingMatch[0]))
    } else if (savingsMatch) {
      savingsSection = text.slice(text.indexOf(savingsMatch[0]))
    }
    
    // Parse each section using global regex
    if (checkingSection) {
      const transactions = extractTransactionsFromSection(checkingSection)
      if (transactions.length > 0) {
        result.accounts.push({
          account_type: 'checking',
          transactions
        })
      }
    }
    
    if (savingsSection) {
      const transactions = extractTransactionsFromSection(savingsSection)
      if (transactions.length > 0) {
        result.accounts.push({
          account_type: 'savings',
          transactions
        })
      }
    }
  } else {
    // No section headers found - try to parse entire text as single account
    const transactions = extractTransactionsFromSection(text)
    if (transactions.length > 0) {
      result.accounts.push({
        account_type: 'checking', // Default to checking
        transactions
      })
    }
  }
  
  result.totalTransactions = result.accounts.reduce(
    (sum, acc) => sum + acc.transactions.length, 
    0
  )
  
  return result
}

/**
 * Extract transactions from a section of text using flexible multi-line parsing
 * 
 * Moey PDFs have transactions in several formats:
 * 
 * Format A (amount+balance on next line):
 * DD-MM-YYYY / DD-MM-YYYY DESCRIPTION
 * AMOUNT +/-BALANCE
 * 
 * Format B (amount in desc, sign+balance on next line):
 * DD-MM-YYYY / DD-MM-YYYY DESCRIPTION AMOUNT
 * +/-BALANCE
 * 
 * Format C (amount+sign on same line, no balance):
 * DD-MM-YYYY / DD-MM-YYYY DESCRIPTION AMOUNT +/-
 * 
 * Format D (multi-line description):
 * DD-MM-YYYY / DD-MM-YYYY DESCRIPTION PART 1
 * DESCRIPTION PART 2
 * AMOUNT +/-
 */
function extractTransactionsFromSection(sectionText: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = []
  
  // Split into lines
  const lines = sectionText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    
    // Try to match transaction header (date / date)
    const headerMatch = line.match(/^(\d{2}-\d{2}-\d{4})\s*\/\s*(\d{2}-\d{2}-\d{4})(.*)$/)
    
    if (headerMatch) {
      const [, accountDate, , restOfLine] = headerMatch
      const date = parsePortugueseDate(accountDate)
      
      if (!date) {
        i++
        continue
      }
      
      const fullTextOnHeader = restOfLine.trim()
      
      // FIRST: Check if the header line itself contains the complete transaction
      // Format C: "DESCRIPTION AMOUNT SIGN+BALANCE" all on one line
      // Example: "Trf a crédito SEPA+ XTB  1.125,00  -59.542,32"
      // The sign is attached to the balance, not separate
      const headerCompleteMatch = fullTextOnHeader.match(/^(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s+([+-]?\d{1,3}(?:\.\d{3})*,\d{2})\s*$/)
      
      if (headerCompleteMatch) {
        const [, desc, amountStr, balanceStr] = headerCompleteMatch
        let amount = parsePortugueseAmount(amountStr)
        // Determine sign from balance: if balance starts with - or decreased, it's an expense
        if (balanceStr.startsWith('-') || balanceStr.startsWith('+')) {
          // Sign is explicit on balance
          if (balanceStr.startsWith('-')) amount = -amount
          // if + then amount stays positive
        }
        
        const category = categorizeTransaction(desc)
        transactions.push({
          date,
          description: desc.trim(),
          amount,
          category,
          confidence: 0.95
        })
        i++
        continue
      }
      
      // Also check for Format C variant: "DESCRIPTION AMOUNT +/-" with standalone sign
      const headerWithStandaloneSign = fullTextOnHeader.match(/^(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s*([+-])\s*$/)
      
      if (headerWithStandaloneSign) {
        const [, desc, amountStr, sign] = headerWithStandaloneSign
        let amount = parsePortugueseAmount(amountStr)
        if (sign === '-') amount = -amount
        
        const category = categorizeTransaction(desc)
        transactions.push({
          date,
          description: desc.trim(),
          amount,
          category,
          confidence: 0.95
        })
        i++
        continue
      }
      
      // Otherwise, look at subsequent lines
      let fullText = fullTextOnHeader
      let j = i + 1
      let found = false
      
      // Keep looking at subsequent lines until we find an amount+sign pattern
      while (j < lines.length) {
        const nextLine = lines[j]
        
        // Check if this line starts a new transaction (has date pattern)
        if (nextLine.match(/^\d{2}-\d{2}-\d{4}\s*\/\s*\d{2}-\d{2}-\d{4}/)) {
          break
        }
        
        // Check for amount patterns in accumulated text + this line
        const combinedText = fullText + ' ' + nextLine
        
        // Pattern 1: Just "AMOUNT +/- BALANCE" or "AMOUNT SIGN+BALANCE" on this line
        // Examples: "50,00  -63.361,54" or "1.125,00  -59.542,32"
        // The sign can be attached to balance or separate
        const pureAmountLine = nextLine.match(/^(\d{1,3}(?:\.\d{3})*,\d{2})\s+([+-]?)(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/)
        
        // Pattern 2: Just "+/- BALANCE" (sign and balance only, amount was on prev line)
        const signBalanceOnly = nextLine.match(/^([+-])\s*(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/)
        
        // Pattern 3: Combined text ends with "AMOUNT +/-"
        const amountSignMatch = combinedText.match(/^(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s*([+-])(?:\s*\d{1,3}(?:\.\d{3})*,\d{2})?\s*$/)
        
        if (pureAmountLine) {
          // Format A: description was on header line, amount+sign+balance on this line
          const [, amountStr, sign] = pureAmountLine
          let amount = parsePortugueseAmount(amountStr)
          // Sign can be '-' or '+' or empty (attached to balance)
          if (sign === '-') amount = -amount
          // If sign is empty or '+', amount stays positive
          
          const category = categorizeTransaction(fullText)
          transactions.push({
            date,
            description: fullText.trim(),
            amount,
            category,
            confidence: 0.95
          })
          i = j + 1
          found = true
          break
        } else if (signBalanceOnly) {
          // Format B: amount at end of description, sign+balance on next line
          const amountInText = fullText.match(/^(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/)
          if (amountInText) {
            const [, desc, amountStr] = amountInText
            const [, sign] = signBalanceOnly
            let amount = parsePortugueseAmount(amountStr)
            if (sign === '-') amount = -amount
            
            const category = categorizeTransaction(desc)
            transactions.push({
              date,
              description: desc.trim(),
              amount,
              category,
              confidence: 0.95
            })
            i = j + 1
            found = true
            break
          }
        } else if (amountSignMatch) {
          // Format D: multi-line description ending with amount+sign
          const [, desc, amountStr, sign] = amountSignMatch
          let amount = parsePortugueseAmount(amountStr)
          if (sign === '-') amount = -amount
          
          const category = categorizeTransaction(desc)
          transactions.push({
            date,
            description: desc.trim(),
            amount,
            category,
            confidence: 0.95
          })
          i = j + 1
          found = true
          break
        }
        
        // No match yet, accumulate this line and continue
        fullText = combinedText
        j++
      }
      
      // If we didn't find a transaction, move to next line
      if (!found) {
        i++
      }
    } else {
      i++
    }
  }
  
  return transactions
}

/**
 * Check if text appears to be from a Moey statement
 */
export function isMoeyStatement(text: string): boolean {
  return text.includes('CONTA MOEY') || 
         text.includes('Moey') ||
         text.includes('CCCMPTPL') || // Moey BIC code
         text.includes('moey.pt')
}
