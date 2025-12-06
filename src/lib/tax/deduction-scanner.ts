"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { 
  DEDUCTION_CATEGORIES, 
  type DeductionCategory,
  calculateTaxBenefit,
  getDeductionCategory
} from './deduction-categories'
import { startOfYear, endOfYear, getYear } from 'date-fns'

// AC #6: Deduction match with confidence
export interface DeductionMatch {
  transactionId: string
  transactionDate: string
  description: string
  amount: number
  categoryId: string
  categoryName: string
  categoryNamePt: string
  confidence: 'high' | 'medium' | 'low'
  matchedPattern: string | null
  deductibleAmount: number
  estimatedBenefit: number
  needsReview: boolean
}

// AC #3: Annual deduction summary per category
export interface CategoryDeductionSummary {
  categoryId: string
  categoryName: string
  categoryNamePt: string
  description: string
  descriptionPt: string
  rate: number
  maxDeduction: number
  totalSpent: number
  deductibleAmount: number
  estimatedBenefit: number
  percentOfMax: number
  transactions: DeductionMatch[]
  requiresNIF: boolean
  vatBased: boolean
}

// AC #3: Full annual summary
export interface AnnualDeductionSummary {
  year: number
  categories: CategoryDeductionSummary[]
  totalDeductible: number
  totalEstimatedBenefit: number
  missingCategories: DeductionCategory[]
  vatReminder: boolean
}

// AC #2: Match transaction description to deduction categories
function matchTransactionToCategory(
  description: string,
  category: string | null,
  _amount: number
): { categoryId: string; confidence: 'high' | 'medium' | 'low'; matchedPattern: string | null } | null {
  const descLower = description.toLowerCase()
  const catLower = (category || '').toLowerCase()
  
  for (const deductionCat of DEDUCTION_CATEGORIES) {
    // Check pattern matches (high confidence)
    for (const pattern of deductionCat.patterns) {
      if (descLower.includes(pattern.toLowerCase())) {
        return {
          categoryId: deductionCat.id,
          confidence: 'high',
          matchedPattern: pattern
        }
      }
    }
    
    // Check category matches (medium confidence)
    for (const catMatch of deductionCat.categoryMatches) {
      if (catLower.includes(catMatch.toLowerCase())) {
        return {
          categoryId: deductionCat.id,
          confidence: 'medium',
          matchedPattern: null
        }
      }
    }
  }
  
  return null
}

// AC #2: Scan transactions for deductions
export async function scanTransactionsForDeductions(
  userId: string,
  year?: number
): Promise<DeductionMatch[]> {
  const supabase = await createServerSupabase()
  
  const targetYear = year ?? getYear(new Date())
  const startDate = startOfYear(new Date(targetYear, 0, 1))
  const endDate = endOfYear(new Date(targetYear, 0, 1))
  
  // Fetch all expenses for the year
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('id, date, description, amount, category')
    .eq('user_id', userId)
    .lt('amount', 0) // Only expenses
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString())
    .order('date', { ascending: false })
  
  if (error || !transactions) {
    console.error('Error fetching transactions:', error)
    return []
  }
  
  const matches: DeductionMatch[] = []
  
  for (const tx of transactions) {
    const match = matchTransactionToCategory(
      tx.description,
      tx.category,
      Math.abs(tx.amount)
    )
    
    if (match) {
      const category = getDeductionCategory(match.categoryId)
      if (!category) continue
      
      const absAmount = Math.abs(tx.amount)
      const { deductibleAmount, actualBenefit } = calculateTaxBenefit(absAmount, category)
      
      matches.push({
        transactionId: tx.id,
        transactionDate: tx.date,
        description: tx.description,
        amount: absAmount,
        categoryId: match.categoryId,
        categoryName: category.name,
        categoryNamePt: category.name_pt,
        confidence: match.confidence,
        matchedPattern: match.matchedPattern,
        deductibleAmount,
        estimatedBenefit: actualBenefit,
        needsReview: match.confidence !== 'high' // AC #6
      })
    }
  }
  
  return matches
}

// AC #3: Generate annual deduction summary
export async function getAnnualDeductionSummary(
  userId?: string,
  year?: number
): Promise<AnnualDeductionSummary> {
  const supabase = await createServerSupabase()
  
  let uid = userId
  if (!uid) {
    const { data: { user } } = await supabase.auth.getUser()
    uid = user?.id
  }
  
  if (!uid) {
    return {
      year: year ?? getYear(new Date()),
      categories: [],
      totalDeductible: 0,
      totalEstimatedBenefit: 0,
      missingCategories: [],
      vatReminder: false
    }
  }
  
  const targetYear = year ?? getYear(new Date())
  const matches = await scanTransactionsForDeductions(uid, targetYear)
  
  // Group by category
  const categoryMap = new Map<string, DeductionMatch[]>()
  for (const match of matches) {
    const existing = categoryMap.get(match.categoryId) ?? []
    existing.push(match)
    categoryMap.set(match.categoryId, existing)
  }
  
  // Build category summaries
  const categories: CategoryDeductionSummary[] = []
  let totalDeductible = 0
  let totalBenefit = 0
  let hasGeneralExpenses = false
  
  for (const [categoryId, transactions] of categoryMap) {
    const category = getDeductionCategory(categoryId)
    if (!category) continue
    
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0)
    
    // Calculate deductible with cap
    let deductibleAmount: number
    if (category.vatBased) {
      const estimatedVAT = totalSpent * 0.23 / 1.23
      deductibleAmount = Math.min(estimatedVAT * category.rate, category.maxDeduction)
    } else {
      deductibleAmount = Math.min(totalSpent * category.rate, category.maxDeduction)
    }
    
    const estimatedBenefit = deductibleAmount * 0.30 // Assume 30% marginal rate
    
    categories.push({
      categoryId,
      categoryName: category.name,
      categoryNamePt: category.name_pt,
      description: category.description,
      descriptionPt: category.description_pt,
      rate: category.rate,
      maxDeduction: category.maxDeduction,
      totalSpent,
      deductibleAmount,
      estimatedBenefit,
      percentOfMax: (deductibleAmount / category.maxDeduction) * 100,
      transactions,
      requiresNIF: category.requiresNIF,
      vatBased: category.vatBased
    })
    
    totalDeductible += deductibleAmount
    totalBenefit += estimatedBenefit
    
    if (category.id === 'general_expenses') {
      hasGeneralExpenses = true
    }
  }
  
  // Sort by total spent
  categories.sort((a, b) => b.totalSpent - a.totalSpent)
  
  // AC #4: Find missing categories (opportunities)
  const usedCategoryIds = new Set(categories.map(c => c.categoryId))
  const missingCategories = DEDUCTION_CATEGORIES.filter(c => 
    !usedCategoryIds.has(c.id) && 
    c.id !== 'housing_mortgage' && // Skip mortgage if not applicable
    c.id !== 'care_homes' // Skip care homes if not applicable
  )
  
  return {
    year: targetYear,
    categories,
    totalDeductible,
    totalEstimatedBenefit: totalBenefit,
    missingCategories,
    vatReminder: hasGeneralExpenses // AC #5: Show VAT reminder if general expenses exist
  }
}

// AC #4: Generate insight for missing deductions
export async function generateDeductionOpportunityInsights(
  userId: string,
  locale: 'pt-PT' | 'en-US' = 'pt-PT'
): Promise<Array<{ type: 'opportunity'; title: string; message: string }>> {
  const summary = await getAnnualDeductionSummary(userId)
  const isPT = locale === 'pt-PT'
  const insights: Array<{ type: 'opportunity'; title: string; message: string }> = []
  
  // Check for categories with low usage
  for (const category of summary.categories) {
    if (category.percentOfMax < 50) {
      const remaining = category.maxDeduction - category.deductibleAmount
      const catName = isPT ? category.categoryNamePt : category.categoryName
      
      insights.push({
        type: 'opportunity',
        title: isPT 
          ? `💡 Espaço na dedução de ${catName}` 
          : `💡 Room for ${catName} deduction`,
        message: isPT
          ? `Ainda pode deduzir até €${remaining.toFixed(0)} em ${catName.toLowerCase()}. ${category.descriptionPt}`
          : `You can still deduct up to €${remaining.toFixed(0)} in ${catName.toLowerCase()}. ${category.description}`
      })
    }
  }
  
  // Suggest missing categories
  for (const missing of summary.missingCategories.slice(0, 2)) {
    const catName = isPT ? missing.name_pt : missing.name
    const desc = isPT ? missing.description_pt : missing.description
    
    insights.push({
      type: 'opportunity',
      title: isPT 
        ? `📝 Sem despesas de ${catName}` 
        : `📝 No ${catName} expenses found`,
      message: isPT
        ? `Pode deduzir até €${missing.maxDeduction} em ${catName.toLowerCase()}. ${desc}`
        : `You can deduct up to €${missing.maxDeduction} in ${catName.toLowerCase()}. ${desc}`
    })
  }
  
  return insights
}

export default getAnnualDeductionSummary
