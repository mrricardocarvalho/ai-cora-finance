import { FinancialConcept } from './types'
import { ALL_CONCEPTS } from './concepts'

export function getRecommendedConcepts(learnedSlugs: string[], limit: number = 3): FinancialConcept[] {
  // Filter out concepts that are already learned
  const unlearnedConcepts = ALL_CONCEPTS.filter(
    concept => !learnedSlugs.includes(concept.slug)
  )

  if (unlearnedConcepts.length === 0) {
    return []
  }

  // Simple recommendation logic:
  // 1. Prioritize beginner concepts
  // 2. Take top N
  return unlearnedConcepts
    .sort((a, b) => {
      if (a.difficulty === 'beginner' && b.difficulty !== 'beginner') return -1
      if (a.difficulty !== 'beginner' && b.difficulty === 'beginner') return 1
      return 0
    })
    .slice(0, limit)
}
