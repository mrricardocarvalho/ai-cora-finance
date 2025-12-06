const testText = `
29-08-2025 / 29-08-2025 Trf imediata SONIA ISABEL RODRIGUES A
SANCHES MASSA
700,00 -
25-08-2025 / 25-08-2025 Trf a crédito SEPA+ XTB 1.125,00 -
25-08-2025 / 25-08-2025 IPS/R2115997955-LUIS EDUARDO SA 500,00 +
25-08-2025 / 25-08-2025 IPS/R2115998292-LUIS EDUARDO SA 125,00 +
`;

function parsePortugueseAmount(amountStr) {
  return parseFloat(amountStr.replace(/\./g, '').replace(',', '.'));
}

function parsePortugueseDate(dateStr) {
  const match = dateStr.match(/(\d{2})-(\d{2})-(\d{4})/);
  if (!match) return '';
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function categorizeTransaction(description) {
  return 'Test';
}

function extractTransactionsFromSection(sectionText) {
  const transactions = [];
  const lines = sectionText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const headerMatch = line.match(/^(\d{2}-\d{2}-\d{4})\s*\/\s*(\d{2}-\d{2}-\d{4})(.*)$/);
    
    if (headerMatch) {
      const [, accountDate, , restOfLine] = headerMatch;
      const date = parsePortugueseDate(accountDate);
      
      if (!date) { i++; continue; }
      
      const fullTextOnHeader = restOfLine.trim();
      
      // FIRST: Check if header line itself contains complete transaction
      // Format C: "DESCRIPTION AMOUNT +/-" all on one line
      const headerCompleteMatch = fullTextOnHeader.match(/^(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s*([+-])\s*$/);
      
      if (headerCompleteMatch) {
        const [, desc, amountStr, sign] = headerCompleteMatch;
        let amount = parsePortugueseAmount(amountStr);
        if (sign === '-') amount = -amount;
        transactions.push({ date, description: desc.trim(), amount });
        i++;
        continue;
      }
      
      // Otherwise, look at subsequent lines
      let fullText = fullTextOnHeader;
      let j = i + 1;
      let found = false;
      
      while (j < lines.length) {
        const nextLine = lines[j];
        
        if (nextLine.match(/^\d{2}-\d{2}-\d{4}\s*\/\s*\d{2}-\d{2}-\d{4}/)) break;
        
        const combinedText = fullText + ' ' + nextLine;
        
        // Pattern: "AMOUNT +/- BALANCE" pure amount line
        const pureAmountLine = nextLine.match(/^(\d{1,3}(?:\.\d{3})*,\d{2})\s*([+-])\s*(\d{1,3}(?:\.\d{3})*,\d{2})?\s*$/);
        
        // Pattern: "+/- BALANCE" sign+balance only
        const signBalanceOnly = nextLine.match(/^([+-])\s*(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/);
        
        // Pattern: text ending with "AMOUNT +/-"
        const amountSignMatch = combinedText.match(/^(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s*([+-])(?:\s*\d{1,3}(?:\.\d{3})*,\d{2})?\s*$/);
        
        if (pureAmountLine) {
          const [, amountStr, sign] = pureAmountLine;
          let amount = parsePortugueseAmount(amountStr);
          if (sign === '-') amount = -amount;
          transactions.push({ date, description: fullText.trim(), amount });
          i = j + 1;
          found = true;
          break;
        } else if (signBalanceOnly && fullText.match(/(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/)) {
          const amountInText = fullText.match(/^(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/);
          if (amountInText) {
            const [, desc, amountStr] = amountInText;
            const [, sign] = signBalanceOnly;
            let amount = parsePortugueseAmount(amountStr);
            if (sign === '-') amount = -amount;
            transactions.push({ date, description: desc.trim(), amount });
            i = j + 1;
            found = true;
            break;
          }
        } else if (amountSignMatch) {
          const [, desc, amountStr, sign] = amountSignMatch;
          let amount = parsePortugueseAmount(amountStr);
          if (sign === '-') amount = -amount;
          transactions.push({ date, description: desc.trim(), amount });
          i = j + 1;
          found = true;
          break;
        }
        
        fullText = combinedText;
        j++;
      }
      
      if (!found) {
        i++;
      }
    } else {
      i++;
    }
  }
  
  return transactions;
}

const transactions = extractTransactionsFromSection(testText);
console.log('Parsed', transactions.length, 'transactions:');
transactions.forEach(t => {
  console.log(t.amount.toString().padStart(10) + ' | ' + t.date + ' | ' + t.description);
});
