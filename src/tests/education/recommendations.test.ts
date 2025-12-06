import { getRecommendedConcepts } from '../../lib/education/recommendations'
import { ALL_CONCEPTS } from '../../lib/education/concepts'

describe('getRecommendedConcepts', () => {
  it('should return unlearned concepts', () => {
    const learned = []
    const recommendations = getRecommendedConcepts(learned)
    expect(recommendations.length).toBeGreaterThan(0)
    expect(recommendations.length).toBeLessThanOrEqual(3)
  })

  it('should not return learned concepts', () => {
    const allSlugs = ALL_CONCEPTS.map(c => c.slug)
    const learned = [allSlugs[0]]
    const recommendations = getRecommendedConcepts(learned)
    
    const recommendedSlugs = recommendations.map(c => c.slug)
    expect(recommendedSlugs).not.toContain(learned[0])
  })

  it('should return empty array if all concepts are learned', () => {
    const allSlugs = ALL_CONCEPTS.map(c => c.slug)
    const recommendations = getRecommendedConcepts(allSlugs)
    expect(recommendations).toEqual([])
  })

  it('should prioritize beginner concepts', () => {
    // Mock concepts if necessary, but relying on real data for now
    // Assuming we have beginner concepts
    const recommendations = getRecommendedConcepts([])
    const firstRecommendation = recommendations[0]
    expect(firstRecommendation.difficulty).toBe('beginner')
  })
})
