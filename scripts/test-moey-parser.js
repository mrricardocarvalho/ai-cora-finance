/**
 * Test script for Moey PDF parser
 * Usage: node scripts/test-moey-parser.js path/to/statement.pdf
 */

const fs = require('fs')
const path = require('path')
const pdf = require('pdf-parse')

// Updated transaction header regex (two-line format)
const TRANSACTION_HEADER_REGEX = /^(\d{2}-\d{2}-\d{4})\s*\/\s*(\d{2}-\d{2}-\d{4})(.+)$/
const AMOUNT_LINE_REGEX = /^\s*(\d{1,3}(?:\.\d{3})*,\d{2})\s*([+-])\s*(\d{1,3}(?:\.\d{3})*,\d{2})/

function parsePortugueseDate(dateStr) {
  const match = dateStr.match(/(\d{2})-(\d{2})-(\d{4})/)
  if (!match) return ''
  return `${match[3]}-${match[2]}-${match[1]}`
}

function parsePortugueseAmount(amountStr) {
  const normalized = amountStr.replace(/\./g, '').replace(',', '.')
  return parseFloat(normalized)
}

function extractTransactions(sectionText) {
  const transactions = []
  const lines = sectionText.split('\n')
  
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i]
    const headerMatch = line.match(/^(\d{2}-\d{2}-\d{4})\s*\/\s*(\d{2}-\d{2}-\d{4})(.+)$/)
    
    if (headerMatch) {
      const [, accountDate, , descriptionPart] = headerMatch
      const nextLine = lines[i + 1]
      
      // Format A: Amount on next line
      const amountOnNextLine = nextLine.match(/^\s*(\d{1,3}(?:\.\d{3})*,\d{2})\s*([+-])\s*(\d{1,3}(?:\.\d{3})*,\d{2})/)
      
      // Format B: Amount at end of description, sign on next line
      const amountInDesc = descriptionPart.match(/^(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})$/)
      const signOnNextLine = nextLine.match(/^\s*([+-])\s*(\d{1,3}(?:\.\d{3})*,\d{2})/)
      
      let date = ''
      let amount = 0
      let description = ''
      let matched = false
      
      if (amountOnNextLine) {
        // Format A
        const [, amountStr, sign] = amountOnNextLine
        date = parsePortugueseDate(accountDate)
        amount = parsePortugueseAmount(amountStr)
        if (sign === '-') amount = -amount
        description = descriptionPart.trim()
        matched = true
        i++
      } else if (amountInDesc && signOnNextLine) {
        // Format B
        const [, desc, amountStr] = amountInDesc
        const [, sign] = signOnNextLine
        date = parsePortugueseDate(accountDate)
        amount = parsePortugueseAmount(amountStr)
        if (sign === '-') amount = -amount
        description = desc.trim()
        matched = true
        i++
      }
      
      if (matched && date) {
        transactions.push({ date, description, amount })
      }
    }
  }
  
  return transactions
}

async function testPdf(filePath) {
  console.log('Testing PDF:', filePath)
  
  const buffer = fs.readFileSync(filePath)
  const data = await pdf(buffer)
  const text = data.text || ''
  
  console.log('\n=== PDF INFO ===')
  console.log('Pages:', data.numpages)
  console.log('Text length:', text.length)
  
  console.log('\n=== FIRST 1000 CHARS ===')
  console.log(text.slice(0, 1000))
  
  console.log('\n=== SECTION DETECTION ===')
  console.log('Contains "CONTA MOEY":', text.includes('CONTA MOEY'))
  console.log('Contains "CONTA POUPANÇA":', text.includes('CONTA POUPANÇA'))
  console.log('Contains "Moey":', text.includes('Moey'))
  
  console.log('\n=== LOOKING FOR DATE PATTERNS ===')
  const datePattern = /\d{2}-\d{2}-\d{4}/g
  const dates = text.match(datePattern) || []
  console.log('Found dates:', dates.slice(0, 10))
  
  console.log('\n=== TWO-LINE PARSING TEST ===')
  
  // Find CONTA MOEY section
  const moeyIdx = text.indexOf('CONTA MOEY')
  const savingsIdx = text.indexOf('CONTA POUPANÇA')
  
  let checkingSection = ''
  let savingsSection = ''
  
  if (moeyIdx !== -1 && savingsIdx !== -1) {
    if (moeyIdx < savingsIdx) {
      checkingSection = text.slice(moeyIdx, savingsIdx)
      savingsSection = text.slice(savingsIdx)
    } else {
      savingsSection = text.slice(savingsIdx, moeyIdx)
      checkingSection = text.slice(moeyIdx)
    }
  } else if (moeyIdx !== -1) {
    checkingSection = text.slice(moeyIdx)
  }
  
  console.log('Checking section length:', checkingSection.length)
  console.log('Savings section length:', savingsSection.length)
  
  const checkingTx = extractTransactions(checkingSection)
  const savingsTx = extractTransactions(savingsSection)
  
  console.log('\n=== CHECKING TRANSACTIONS ===')
  console.log('Found:', checkingTx.length)
  checkingTx.slice(0, 10).forEach((tx, i) => {
    console.log(`${i + 1}. ${tx.date} | ${tx.description.slice(0, 40)} | ${tx.amount} €`)
  })
  
  console.log('\n=== SAVINGS TRANSACTIONS ===')
  console.log('Found:', savingsTx.length)
  savingsTx.slice(0, 10).forEach((tx, i) => {
    console.log(`${i + 1}. ${tx.date} | ${tx.description.slice(0, 40)} | ${tx.amount} €`)
  })
  
  console.log('\n=== TOTAL ===')
  console.log('Total transactions:', checkingTx.length + savingsTx.length)
}

const pdfPath = process.argv[2]
if (!pdfPath) {
  console.log('Usage: node scripts/test-moey-parser.js path/to/statement.pdf')
  process.exit(1)
}

testPdf(pdfPath).catch(console.error)
