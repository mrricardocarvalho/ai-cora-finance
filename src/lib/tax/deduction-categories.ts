// Portuguese IRS Deduction Categories (2024/2025)
// Reference: https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/IRS/

export interface DeductionCategory {
  id: string
  name: string
  name_pt: string
  description: string
  description_pt: string
  rate: number        // Percentage deductible (e.g., 0.15 for 15%)
  maxDeduction: number // Maximum deduction amount in EUR
  requiresNIF: boolean // Whether NIF on invoice is required
  vatBased: boolean    // Whether deduction is based on VAT amount
  patterns: string[]   // Transaction description patterns to match
  categoryMatches: string[] // Transaction category matches
}

// AC #1: Portuguese IRS Deduction Categories
export const DEDUCTION_CATEGORIES: DeductionCategory[] = [
  {
    id: 'health',
    name: 'Health',
    name_pt: 'Saúde',
    description: 'Medical expenses, pharmacies, hospitals, doctors, dentists',
    description_pt: 'Despesas médicas, farmácias, hospitais, médicos, dentistas',
    rate: 0.15,
    maxDeduction: 1000,
    requiresNIF: true,
    vatBased: false,
    patterns: [
      'farmacia', 'farmácia', 'pharmacy',
      'continente saude', 'continente saúde',
      'wells', 'well\'s',
      'hospital', 'clinica', 'clínica',
      'medico', 'médico', 'doctor',
      'dentista', 'dentist',
      'otica', 'óptica', 'optics',
      'laboratorio', 'laboratório', 'lab',
      'raio-x', 'rx', 'radiologia',
      'fisioterapia', 'physiotherapy',
      'pingo doce saude', 'pingo doce saúde',
      'lusiadas', 'lusíadas',
      'cuf', 'luz saude', 'luz saúde',
      'joaquim chaves',
      'germano de sousa'
    ],
    categoryMatches: ['health', 'healthcare', 'medical', 'saúde']
  },
  {
    id: 'education',
    name: 'Education',
    name_pt: 'Educação',
    description: 'Schools, universities, books, educational materials, courses',
    description_pt: 'Escolas, universidades, livros, materiais educativos, cursos',
    rate: 0.30,
    maxDeduction: 800,
    requiresNIF: true,
    vatBased: false,
    patterns: [
      'universidade', 'university',
      'escola', 'school', 'colegio', 'colégio',
      'fnac', 'wook', 'bertrand',
      'livraria', 'bookstore', 'book',
      'udemy', 'coursera', 'linkedin learning',
      'curso', 'course', 'formacao', 'formação',
      'explicacoes', 'explicações', 'tutoring',
      'creche', 'jardim infancia', 'jardim infância',
      'ati ', 'atl ', // After-school activities
      'conservatorio', 'conservatório',
      'instituto', 'politecnico', 'politécnico'
    ],
    categoryMatches: ['education', 'books', 'courses', 'educação']
  },
  {
    id: 'housing_rent',
    name: 'Housing (Rent)',
    name_pt: 'Habitação (Renda)',
    description: 'Rent payments for primary residence',
    description_pt: 'Pagamentos de renda da habitação própria permanente',
    rate: 0.15,
    maxDeduction: 502,
    requiresNIF: true,
    vatBased: false,
    patterns: [
      'renda', 'rent', 'aluguer',
      'arrendamento'
    ],
    categoryMatches: ['rent', 'housing', 'renda']
  },
  {
    id: 'housing_mortgage',
    name: 'Housing (Mortgage Interest)',
    name_pt: 'Habitação (Juros Crédito)',
    description: 'Mortgage interest payments for primary residence (contracts before 2011)',
    description_pt: 'Juros de crédito habitação própria permanente (contratos até 2011)',
    rate: 0.15,
    maxDeduction: 296, // Reduced limit for post-2011
    requiresNIF: false,
    vatBased: false,
    patterns: [
      'credito habitacao', 'crédito habitação',
      'mortgage', 'emprestimo casa', 'empréstimo casa',
      'juros habitacao', 'juros habitação'
    ],
    categoryMatches: ['mortgage', 'loan']
  },
  {
    id: 'care_homes',
    name: 'Care Homes',
    name_pt: 'Lares',
    description: 'Expenses with nursing homes and care facilities for family members',
    description_pt: 'Despesas com lares e instituições de apoio a familiares',
    rate: 0.25,
    maxDeduction: 403.75,
    requiresNIF: true,
    vatBased: false,
    patterns: [
      'lar de idosos', 'nursing home',
      'residencia senior', 'residência sénior',
      'apoio domiciliario', 'apoio domiciliário',
      'casa de repouso'
    ],
    categoryMatches: ['care', 'nursing']
  },
  {
    id: 'general_expenses',
    name: 'General Expenses (e-fatura)',
    name_pt: 'Despesas Gerais (e-fatura)',
    description: '35% of VAT on validated receipts in e-fatura (restaurants, supermarkets, etc.)',
    description_pt: '35% do IVA de faturas validadas no e-fatura (restaurantes, supermercados, etc.)',
    rate: 0.35, // 35% of VAT
    maxDeduction: 250,
    requiresNIF: true,
    vatBased: true,
    patterns: [
      'restaurante', 'restaurant', 'cafe', 'café',
      'supermercado', 'supermarket',
      'continente', 'pingo doce', 'lidl', 'aldi',
      'mercadona', 'minipreco', 'minipreço',
      'intermarche', 'intermarché',
      'auchan', 'jumbo', 'el corte ingles',
      'worten', 'fnac', 'media markt',
      'zara', 'h&m', 'primark', 'pull&bear',
      'leroy merlin', 'ikea', 'conforama',
      'decathlon', 'sport zone', 'sprinter',
      'cabeleireiro', 'hairdresser', 'barbeiro',
      'ginasio', 'ginásio', 'gym', 'fitness',
      'holmes place', 'solinca', 'fitness hut'
    ],
    categoryMatches: ['shopping', 'groceries', 'dining', 'entertainment', 'fitness']
  },
  {
    id: 'veterinary',
    name: 'Veterinary (e-fatura)',
    name_pt: 'Veterinário (e-fatura)',
    description: 'Veterinary expenses count towards general e-fatura deductions',
    description_pt: 'Despesas veterinárias contam para deduções gerais do e-fatura',
    rate: 0.35,
    maxDeduction: 250, // Part of general expenses limit
    requiresNIF: true,
    vatBased: true,
    patterns: [
      'veterinario', 'veterinário', 'vet',
      'clinica animal', 'clínica animal',
      'pet', 'petshop', 'zoo', 'animais'
    ],
    categoryMatches: ['pets', 'veterinary']
  },
  {
    id: 'public_transport',
    name: 'Public Transport Passes',
    name_pt: 'Passes de Transporte Público',
    description: 'Monthly public transport passes (included in general expenses)',
    description_pt: 'Passes mensais de transporte público (incluído em despesas gerais)',
    rate: 0.35,
    maxDeduction: 250, // Part of general expenses
    requiresNIF: true,
    vatBased: true,
    patterns: [
      'navegante', 'andante', 'metro',
      'carris', 'cp ', 'comboio',
      'transtejo', 'fertagus',
      'pass mensal', 'passe mensal'
    ],
    categoryMatches: ['transport', 'transit']
  }
]

// Calculate estimated tax benefit
export function calculateTaxBenefit(
  amount: number,
  category: DeductionCategory
): { deductibleAmount: number; actualBenefit: number } {
  let deductibleAmount: number
  
  if (category.vatBased) {
    // For VAT-based deductions, assume 23% VAT on purchase
    const estimatedVAT = amount * 0.23 / 1.23
    deductibleAmount = Math.min(estimatedVAT * category.rate, category.maxDeduction)
  } else {
    deductibleAmount = Math.min(amount * category.rate, category.maxDeduction)
  }
  
  // Assume average marginal tax rate of 30% for benefit calculation
  const estimatedTaxRate = 0.30
  const actualBenefit = deductibleAmount * estimatedTaxRate
  
  return { deductibleAmount, actualBenefit }
}

// Get category by ID
export function getDeductionCategory(id: string): DeductionCategory | undefined {
  return DEDUCTION_CATEGORIES.find(c => c.id === id)
}

// Get all category IDs
export function getAllDeductionCategoryIds(): string[] {
  return DEDUCTION_CATEGORIES.map(c => c.id)
}

export default DEDUCTION_CATEGORIES
