/**
 * Text preprocessing for natural speech synthesis
 * Handles currency, numbers, percentages, and markdown cleanup
 */

/**
 * Convert a number to spoken words (simplified version)
 */
function numberToWords(num: number, locale: string): string {
  const isPortuguese = locale.startsWith('pt')
  
  if (num === 0) return isPortuguese ? 'zero' : 'zero'
  
  // For large numbers, we'll use a simplified approach
  if (num >= 1000000) {
    const millions = Math.floor(num / 1000000)
    const remainder = num % 1000000
    const millionWord = isPortuguese 
      ? (millions === 1 ? 'um milhão' : `${millions} milhões`)
      : `${millions} million`
    if (remainder === 0) return millionWord
    return `${millionWord} ${isPortuguese ? 'e' : 'and'} ${numberToWords(remainder, locale)}`
  }
  
  if (num >= 1000) {
    const thousands = Math.floor(num / 1000)
    const remainder = num % 1000
    const thousandWord = isPortuguese
      ? (thousands === 1 ? 'mil' : `${thousands} mil`)
      : `${thousands} thousand`
    if (remainder === 0) return thousandWord
    return `${thousandWord} ${isPortuguese ? 'e' : 'and'} ${numberToWords(remainder, locale)}`
  }
  
  if (num >= 100) {
    const hundreds = Math.floor(num / 100)
    const remainder = num % 100
    let hundredWord: string
    if (isPortuguese) {
      const ptHundreds = ['', 'cem', 'duzentos', 'trezentos', 'quatrocentos', 
        'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']
      hundredWord = hundreds === 1 && remainder > 0 ? 'cento' : ptHundreds[hundreds]
    } else {
      hundredWord = `${hundreds} hundred`
    }
    if (remainder === 0) return hundredWord
    return `${hundredWord} ${isPortuguese ? 'e' : 'and'} ${numberToWords(remainder, locale)}`
  }
  
  // Below 100, use the number directly (speech synthesis handles these well)
  return num.toString()
}

/**
 * Format currency for speech
 */
function formatCurrencyForSpeech(amount: number, currency: string, locale: string): string {
  const isPortuguese = locale.startsWith('pt')
  const absAmount = Math.abs(amount)
  const isNegative = amount < 0
  
  // Split into euros and cents
  const euros = Math.floor(absAmount)
  const cents = Math.round((absAmount - euros) * 100)
  
  let result = ''
  
  if (currency === 'EUR' || currency === '€') {
    if (euros > 0) {
      const euroWord = isPortuguese
        ? (euros === 1 ? 'um euro' : `${numberToWords(euros, locale)} euros`)
        : (euros === 1 ? 'one euro' : `${numberToWords(euros, locale)} euros`)
      result = euroWord
    }
    
    if (cents > 0) {
      const centWord = isPortuguese
        ? (cents === 1 ? 'um cêntimo' : `${cents} cêntimos`)
        : (cents === 1 ? 'one cent' : `${cents} cents`)
      result = result ? `${result} ${isPortuguese ? 'e' : 'and'} ${centWord}` : centWord
    }
    
    if (!result) {
      result = isPortuguese ? 'zero euros' : 'zero euros'
    }
  } else if (currency === 'USD' || currency === '$') {
    if (euros > 0) {
      const dollarWord = euros === 1 ? 'one dollar' : `${numberToWords(euros, locale)} dollars`
      result = dollarWord
    }
    
    if (cents > 0) {
      const centWord = cents === 1 ? 'one cent' : `${cents} cents`
      result = result ? `${result} and ${centWord}` : centWord
    }
    
    if (!result) {
      result = 'zero dollars'
    }
  } else {
    // Generic currency
    result = `${numberToWords(absAmount, locale)} ${currency}`
  }
  
  if (isNegative) {
    result = isPortuguese ? `menos ${result}` : `negative ${result}`
  }
  
  return result
}

/**
 * Preprocess text for natural speech synthesis
 */
export function preprocessForSpeech(text: string, locale: string): string {
  const isPortuguese = locale.startsWith('pt')
  let processed = text
  
  // Remove markdown formatting
  processed = processed.replace(/\*\*(.+?)\*\*/g, '$1') // bold
  processed = processed.replace(/\*(.+?)\*/g, '$1') // italic
  processed = processed.replace(/_(.+?)_/g, '$1') // italic alt
  processed = processed.replace(/`(.+?)`/g, '$1') // code
  processed = processed.replace(/~~(.+?)~~/g, '$1') // strikethrough
  processed = processed.replace(/\[(.+?)\]\(.+?\)/g, '$1') // links - keep text
  processed = processed.replace(/#{1,6}\s*/g, '') // headings
  
  // Remove bullet points and add pauses
  processed = processed.replace(/^[\s]*[-*•]\s*/gm, '... ')
  processed = processed.replace(/^[\s]*\d+\.\s*/gm, '... ')
  
  // Handle currency with € symbol
  processed = processed.replace(/€\s*(\d+(?:[.,]\d{1,2})?)/g, (_, amount) => {
    const numAmount = parseFloat(amount.replace(',', '.'))
    return formatCurrencyForSpeech(numAmount, 'EUR', locale)
  })
  
  // Handle currency with EUR
  processed = processed.replace(/(\d+(?:[.,]\d{1,2})?)\s*EUR/g, (_, amount) => {
    const numAmount = parseFloat(amount.replace(',', '.'))
    return formatCurrencyForSpeech(numAmount, 'EUR', locale)
  })
  
  // Handle currency with $ symbol
  processed = processed.replace(/\$\s*(\d+(?:[.,]\d{1,2})?)/g, (_, amount) => {
    const numAmount = parseFloat(amount.replace(',', '.'))
    return formatCurrencyForSpeech(numAmount, 'USD', locale)
  })
  
  // Handle percentages
  processed = processed.replace(/(\d+(?:[.,]\d{1,2})?)\s*%/g, (_, num) => {
    const value = parseFloat(num.replace(',', '.'))
    return isPortuguese ? `${value} por cento` : `${value} percent`
  })
  
  // Handle dates (basic format: DD/MM/YYYY)
  processed = processed.replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})/g, (_, day, month, year) => {
    const months = isPortuguese
      ? ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
         'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
      : ['January', 'February', 'March', 'April', 'May', 'June',
         'July', 'August', 'September', 'October', 'November', 'December']
    const monthIndex = parseInt(month) - 1
    const monthName = months[monthIndex] || month
    return isPortuguese
      ? `${parseInt(day)} de ${monthName} de ${year}`
      : `${monthName} ${parseInt(day)}, ${year}`
  })
  
  // Handle times (HH:MM)
  processed = processed.replace(/(\d{1,2}):(\d{2})/g, (match, hours, minutes) => {
    const h = parseInt(hours)
    const m = parseInt(minutes)
    if (isPortuguese) {
      if (m === 0) return `${h} horas`
      return `${h} e ${m}`
    } else {
      if (m === 0) return `${h} o'clock`
      return `${h} ${m}`
    }
  })
  
  // Remove emojis (speech synthesis doesn't handle them well)
  processed = processed.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
  
  // Clean up extra whitespace and add natural pauses
  processed = processed.replace(/\n\n+/g, '. ')
  processed = processed.replace(/\n/g, '. ')
  processed = processed.replace(/\s{2,}/g, ' ')
  processed = processed.trim()
  
  // Remove chart/image references and summarize
  const chartPhrases = isPortuguese
    ? ['Preparei um gráfico mostrando', 'Preparei uma visualização']
    : ['I\'ve prepared a chart showing', 'Here\'s a visualization']
  
  processed = processed.replace(/\[chart\]|\[graph\]|\[image\]/gi, 
    chartPhrases[Math.floor(Math.random() * chartPhrases.length)])
  
  return processed
}

/**
 * Detect if text contains elements that shouldn't be read aloud
 */
export function containsNonReadableContent(text: string): boolean {
  // Check for code blocks, tables, etc.
  return /```[\s\S]*?```/.test(text) || 
         /\|[\s-]+\|/.test(text) ||
         /!\[.*?\]\(.*?\)/.test(text)
}

/**
 * Extract readable portion from text with non-readable content
 */
export function extractReadableContent(text: string, locale: string): string {
  const isPortuguese = locale.startsWith('pt')
  let processed = text
  
  // Replace code blocks with a summary
  processed = processed.replace(/```[\s\S]*?```/g, 
    isPortuguese ? 'Incluí um bloco de código aqui.' : 'I\'ve included a code block here.')
  
  // Replace tables with a summary
  processed = processed.replace(/(\|[^\n]+\|\n)+/g,
    isPortuguese ? 'Preparei uma tabela com os dados.' : 'I\'ve prepared a table with the data.')
  
  // Replace images
  processed = processed.replace(/!\[.*?\]\(.*?\)/g,
    isPortuguese ? 'Incluí uma imagem.' : 'I\'ve included an image.')
  
  return preprocessForSpeech(processed, locale)
}
