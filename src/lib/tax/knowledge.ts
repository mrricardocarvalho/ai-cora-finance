/**
 * Portuguese Tax Knowledge Base
 * Story 8.5: IRS Knowledge Base
 * 
 * Reference data for Portuguese tax system (IRS)
 * This information is educational only - users should consult a tax professional.
 */

// IRS Income Tax Brackets for 2024 (Mainland Portugal)
export interface TaxBracket {
  min: number
  max: number
  rate: number
  description: string
}

export const IRS_BRACKETS_2024: TaxBracket[] = [
  { min: 0, max: 7703, rate: 0.1325, description: '13.25%' },
  { min: 7703, max: 11623, rate: 0.18, description: '18%' },
  { min: 11623, max: 16472, rate: 0.23, description: '23%' },
  { min: 16472, max: 21321, rate: 0.26, description: '26%' },
  { min: 21321, max: 27146, rate: 0.3275, description: '32.75%' },
  { min: 27146, max: 39791, rate: 0.37, description: '37%' },
  { min: 39791, max: 51997, rate: 0.435, description: '43.5%' },
  { min: 51997, max: 81199, rate: 0.45, description: '45%' },
  { min: 81199, max: Infinity, rate: 0.48, description: '48%' }
]

// Key Tax Facts
export interface TaxFact {
  id: string
  category: 'income' | 'capital_gains' | 'deductions' | 'deadlines' | 'imi' | 'general'
  question: string
  question_pt: string
  answer: string
  answer_pt: string
  keywords: string[]
}

export const TAX_FACTS: TaxFact[] = [
  // Income Tax
  {
    id: 'irs_rates',
    category: 'income',
    question: 'What are the IRS tax rates in Portugal?',
    question_pt: 'Quais são as taxas de IRS em Portugal?',
    answer: 'Portugal has progressive IRS tax rates ranging from 13.25% (up to €7,703) to 48% (over €81,199). The rates apply to taxable income after deductions.',
    answer_pt: 'Portugal tem taxas de IRS progressivas de 13,25% (até €7.703) a 48% (acima de €81.199). As taxas aplicam-se ao rendimento coletável após deduções.',
    keywords: ['taxa', 'rate', 'irs', 'escalão', 'bracket', 'income', 'rendimento']
  },
  {
    id: 'irs_automatic',
    category: 'income',
    question: 'What is automatic IRS (IRS Automático)?',
    question_pt: 'O que é o IRS Automático?',
    answer: 'IRS Automático is a pre-filled tax return for employees and pensioners with simple tax situations. If you only have employment income, no dependents with shared custody, and your e-Fatura data is correct, you may be eligible. You can accept or modify the automatic declaration.',
    answer_pt: 'O IRS Automático é uma declaração pré-preenchida para trabalhadores por conta de outrem e pensionistas com situações fiscais simples. Se só tem rendimentos de trabalho dependente, sem dependentes em guarda conjunta, e os dados do e-Fatura estão corretos, pode estar elegível. Pode aceitar ou modificar a declaração automática.',
    keywords: ['automático', 'automatic', 'pré-preenchido', 'pre-filled']
  },
  
  // Capital Gains
  {
    id: 'capital_gains_rate',
    category: 'capital_gains',
    question: 'What is the capital gains tax rate on investments in Portugal?',
    question_pt: 'Qual é a taxa de imposto sobre mais-valias em Portugal?',
    answer: 'Capital gains from stocks, bonds, and other financial assets are taxed at a flat rate of 28% in Portugal. You can choose to include them in your IRS declaration for progressive rates if your income is low.',
    answer_pt: 'As mais-valias de ações, obrigações e outros ativos financeiros são tributadas a uma taxa fixa de 28% em Portugal. Pode optar por incluí-las na declaração de IRS para taxas progressivas se o seu rendimento for baixo.',
    keywords: ['mais-valias', 'capital gains', 'investimentos', 'investments', '28%', 'ações', 'stocks']
  },
  {
    id: 'crypto_tax',
    category: 'capital_gains',
    question: 'How are cryptocurrencies taxed in Portugal?',
    question_pt: 'Como são tributadas as criptomoedas em Portugal?',
    answer: 'As of 2023, crypto gains are taxed at 28% if held for less than 365 days. Gains from crypto held for more than a year are exempt. Staking rewards and crypto earned as payment for services are taxed as regular income.',
    answer_pt: 'Desde 2023, as mais-valias de cripto são tributadas a 28% se detidas por menos de 365 dias. Ganhos de cripto detidas por mais de um ano estão isentos. Recompensas de staking e cripto recebidas como pagamento de serviços são tributadas como rendimento normal.',
    keywords: ['cripto', 'crypto', 'bitcoin', 'ethereum', 'criptomoeda', 'cryptocurrency']
  },
  
  // Deductions
  {
    id: 'deduction_health',
    category: 'deductions',
    question: 'How much can I deduct for health expenses?',
    question_pt: 'Quanto posso deduzir em despesas de saúde?',
    answer: 'You can deduct 15% of health expenses up to a maximum of €1,000 per taxpayer. Health expenses include pharmacies, hospitals, clinics, medical consultations, and health insurance premiums. Expenses must be registered with your NIF in e-Fatura.',
    answer_pt: 'Pode deduzir 15% das despesas de saúde até um máximo de €1.000 por contribuinte. Despesas de saúde incluem farmácias, hospitais, clínicas, consultas médicas e prémios de seguros de saúde. As despesas devem estar registadas com o seu NIF no e-Fatura.',
    keywords: ['saúde', 'health', 'dedução', 'deduction', 'farmácia', 'hospital', '15%', '€1000']
  },
  {
    id: 'deduction_education',
    category: 'deductions',
    question: 'How much can I deduct for education expenses?',
    question_pt: 'Quanto posso deduzir em despesas de educação?',
    answer: 'You can deduct 30% of education expenses up to €800 per household (or €1,000 if in the interior of Portugal). This includes school fees, university tuition, courses, and educational materials for you, your spouse, and dependents.',
    answer_pt: 'Pode deduzir 30% das despesas de educação até €800 por agregado familiar (ou €1.000 se no interior de Portugal). Inclui propinas escolares, mensalidades universitárias, cursos e material didático para si, cônjuge e dependentes.',
    keywords: ['educação', 'education', 'escola', 'school', 'propinas', 'tuition', '30%', '€800']
  },
  {
    id: 'deduction_housing',
    category: 'deductions',
    question: 'Can I deduct rent in Portugal?',
    question_pt: 'Posso deduzir a renda em Portugal?',
    answer: 'Yes, you can deduct 15% of rent payments up to €502 (or €800 in the interior). The property must be your permanent residence and the landlord must be registered. You need to request rent receipts with your NIF.',
    answer_pt: 'Sim, pode deduzir 15% das rendas até €502 (ou €800 no interior). O imóvel deve ser a sua habitação permanente e o senhorio deve estar registado. Precisa de solicitar recibos de renda com o seu NIF.',
    keywords: ['renda', 'rent', 'habitação', 'housing', 'arrendamento', '15%', '€502']
  },
  {
    id: 'deduction_general',
    category: 'deductions',
    question: 'What are general family expenses (despesas gerais familiares)?',
    question_pt: 'O que são despesas gerais familiares?',
    answer: 'General family expenses allow you to deduct 35% of the VAT on eligible purchases up to €250. This includes supermarkets, restaurants, hairdressers, and other daily purchases. Expenses must be registered with your NIF in e-Fatura.',
    answer_pt: 'Despesas gerais familiares permitem deduzir 35% do IVA em compras elegíveis até €250. Inclui supermercados, restaurantes, cabeleireiros e outras compras do dia-a-dia. As despesas devem estar registadas com o seu NIF no e-Fatura.',
    keywords: ['despesas gerais', 'general expenses', 'iva', 'vat', '35%', '€250']
  },
  {
    id: 'efatura',
    category: 'deductions',
    question: 'What is e-Fatura and why is it important?',
    question_pt: 'O que é o e-Fatura e porque é importante?',
    answer: 'e-Fatura (faturas.portaldasfinancas.gov.pt) is a portal where all invoices with your NIF are registered. It is crucial for tax deductions - you must verify and categorize your invoices before February 25th each year. Uncategorized invoices may not count towards your deductions.',
    answer_pt: 'O e-Fatura (faturas.portaldasfinancas.gov.pt) é um portal onde todas as faturas com o seu NIF são registadas. É crucial para as deduções fiscais - deve verificar e categorizar as suas faturas até 25 de Fevereiro de cada ano. Faturas não categorizadas podem não contar para as suas deduções.',
    keywords: ['efatura', 'e-fatura', 'faturas', 'invoices', 'nif', 'deduções']
  },
  
  // Deadlines
  {
    id: 'irs_deadline',
    category: 'deadlines',
    question: 'When is the IRS deadline in Portugal?',
    question_pt: 'Qual é o prazo do IRS em Portugal?',
    answer: 'The IRS declaration period is typically from April 1st to June 30th. You can submit your declaration online through the Portal das Finanças. Missing the deadline can result in fines starting from €25.',
    answer_pt: 'O período de entrega do IRS é tipicamente de 1 de Abril a 30 de Junho. Pode submeter a declaração online através do Portal das Finanças. Perder o prazo pode resultar em multas a partir de €25.',
    keywords: ['prazo', 'deadline', 'entrega', 'submission', 'abril', 'april', 'junho', 'june']
  },
  {
    id: 'efatura_deadline',
    category: 'deadlines',
    question: 'When is the e-Fatura verification deadline?',
    question_pt: 'Qual é o prazo para validar as faturas no e-Fatura?',
    answer: 'You must verify and categorize your invoices in e-Fatura by February 25th. After this date, you cannot change categories and uncategorized expenses may not count for deductions.',
    answer_pt: 'Deve verificar e categorizar as suas faturas no e-Fatura até 25 de Fevereiro. Após esta data, não pode alterar categorias e despesas não categorizadas podem não contar para deduções.',
    keywords: ['efatura', 'fevereiro', 'february', 'validar', 'verify', '25']
  },
  
  // IMI (Property Tax)
  {
    id: 'imi_what',
    category: 'imi',
    question: 'What is IMI in Portugal?',
    question_pt: 'O que é o IMI em Portugal?',
    answer: 'IMI (Imposto Municipal sobre Imóveis) is the annual property tax in Portugal. Rates vary between 0.3% and 0.45% of the property taxable value (VPT), set by each municipality. Payment is due in April/May (or split into 2-3 installments).',
    answer_pt: 'IMI (Imposto Municipal sobre Imóveis) é o imposto anual sobre propriedade em Portugal. As taxas variam entre 0,3% e 0,45% do Valor Patrimonial Tributário (VPT), definido por cada município. O pagamento é devido em Abril/Maio (ou dividido em 2-3 prestações).',
    keywords: ['imi', 'propriedade', 'property', 'municipal', 'imóvel', 'vpt']
  },
  {
    id: 'imi_payment',
    category: 'imi',
    question: 'When do I need to pay IMI?',
    question_pt: 'Quando preciso de pagar o IMI?',
    answer: 'IMI payment depends on the amount: if under €100, pay in full in May; if €100-500, pay in 2 installments (May and November); if over €500, pay in 3 installments (May, August, and November).',
    answer_pt: 'O pagamento do IMI depende do montante: se for inferior a €100, paga-se de uma só vez em Maio; se €100-500, paga-se em 2 prestações (Maio e Novembro); se superior a €500, paga-se em 3 prestações (Maio, Agosto e Novembro).',
    keywords: ['imi', 'pagamento', 'payment', 'maio', 'may', 'novembro', 'november', 'prestação', 'installment']
  },
  
  // General
  {
    id: 'nif_importance',
    category: 'general',
    question: 'Why should I always request my NIF on invoices?',
    question_pt: 'Porque devo pedir sempre NIF nas faturas?',
    answer: 'Requesting your NIF (tax identification number) on invoices is essential for tax deductions. Without the NIF, expenses are not registered in e-Fatura and cannot be deducted from your IRS. Always ask for "fatura com contribuinte" when making purchases.',
    answer_pt: 'Pedir o seu NIF (número de contribuinte) nas faturas é essencial para as deduções fiscais. Sem o NIF, as despesas não são registadas no e-Fatura e não podem ser deduzidas no IRS. Peça sempre "fatura com contribuinte" ao fazer compras.',
    keywords: ['nif', 'contribuinte', 'fatura', 'invoice', 'dedução', 'deduction']
  },
  {
    id: 'young_irs',
    category: 'general',
    question: 'Are there tax benefits for young workers in Portugal?',
    question_pt: 'Existem benefícios fiscais para jovens trabalhadores em Portugal?',
    answer: 'Yes, IRS Jovem provides tax benefits for workers aged 18-26 (or up to 30 with a degree). In the first year of work, 100% of employment income is exempt (up to 40× IAS ~€20,000). The exemption decreases over 10 years. You must have completed education within the last year.',
    answer_pt: 'Sim, o IRS Jovem oferece benefícios fiscais para trabalhadores entre 18-26 anos (ou até 30 com curso superior). No primeiro ano de trabalho, 100% do rendimento está isento (até 40× IAS ~€20.000). A isenção diminui ao longo de 10 anos. Deve ter terminado os estudos no ano anterior.',
    keywords: ['jovem', 'young', 'primeiro emprego', 'first job', 'irs jovem', 'isenção', 'exemption']
  },
  {
    id: 'tax_resident',
    category: 'general',
    question: 'When am I considered a tax resident in Portugal?',
    question_pt: 'Quando sou considerado residente fiscal em Portugal?',
    answer: 'You are a tax resident in Portugal if: 1) You stay in Portugal for more than 183 days (continuous or not) in a 12-month period, OR 2) You have a habitual residence in Portugal on December 31st. Tax residents must declare worldwide income.',
    answer_pt: 'É considerado residente fiscal em Portugal se: 1) Permanecer em Portugal mais de 183 dias (contínuos ou não) num período de 12 meses, OU 2) Tiver habitação permanente em Portugal a 31 de Dezembro. Residentes fiscais devem declarar rendimentos mundiais.',
    keywords: ['residente', 'resident', '183 dias', '183 days', 'habitação', 'worldwide']
  }
]

// Get facts by category
export function getTaxFactsByCategory(category: TaxFact['category']): TaxFact[] {
  return TAX_FACTS.filter(f => f.category === category)
}

// Search facts by keywords
export function searchTaxFacts(query: string): TaxFact[] {
  const queryLower = query.toLowerCase()
  const queryWords = queryLower.split(/\s+/)
  
  return TAX_FACTS.filter(fact => {
    // Check keywords
    const keywordMatch = fact.keywords.some(k => 
      queryWords.some(w => k.includes(w) || w.includes(k))
    )
    
    // Check question text
    const questionMatch = fact.question.toLowerCase().includes(queryLower) ||
      fact.question_pt.toLowerCase().includes(queryLower)
    
    return keywordMatch || questionMatch
  }).sort((a, b) => {
    // Prioritize keyword matches
    const aKeywordScore = a.keywords.filter(k => 
      queryWords.some(w => k.includes(w) || w.includes(k))
    ).length
    const bKeywordScore = b.keywords.filter(k => 
      queryWords.some(w => k.includes(w) || w.includes(k))
    ).length
    
    return bKeywordScore - aKeywordScore
  })
}

// Get all FAQ for a locale
export function getTaxFAQ(locale: 'pt-PT' | 'en-US'): Array<{ question: string; answer: string }> {
  return TAX_FACTS.map(fact => ({
    question: locale === 'pt-PT' ? fact.question_pt : fact.question,
    answer: locale === 'pt-PT' ? fact.answer_pt : fact.answer
  }))
}

// Calculate estimated IRS tax
export function calculateEstimatedIRS(annualIncome: number): { 
  taxAmount: number; 
  effectiveRate: number;
  marginalRate: number;
  bracket: string;
} {
  let remainingIncome = annualIncome
  let totalTax = 0
  let currentBracket: TaxBracket = IRS_BRACKETS_2024[0]
  
  for (const bracket of IRS_BRACKETS_2024) {
    if (remainingIncome <= 0) break
    
    const bracketMin = bracket.min
    const bracketMax = bracket.max === Infinity ? remainingIncome + bracketMin : bracket.max
    const taxableInBracket = Math.min(remainingIncome, bracketMax - bracketMin)
    
    if (taxableInBracket > 0) {
      totalTax += taxableInBracket * bracket.rate
      currentBracket = bracket
    }
    
    remainingIncome -= taxableInBracket
  }
  
  return {
    taxAmount: Math.round(totalTax * 100) / 100,
    effectiveRate: annualIncome > 0 ? (totalTax / annualIncome) * 100 : 0,
    marginalRate: currentBracket.rate * 100,
    bracket: currentBracket.description
  }
}
