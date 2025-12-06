// Exports for the education module
export * from './types';
import { ALL_CONCEPTS } from './concepts';
import { FinancialConcept, ConceptCategory, ConceptDifficulty } from './types';

// Re-export concepts
export * from './concepts';

/**
 * Get a concept by its slug
 */
export function getConcept(slug: string): FinancialConcept | undefined {
  return ALL_CONCEPTS.find(c => c.slug === slug);
}

/**
 * Search concepts by query string (searches title and explanations)
 */
export function searchConcepts(query: string, locale: 'pt-PT' | 'en-US' = 'en-US'): FinancialConcept[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return [];

  return ALL_CONCEPTS.filter(concept => {
    const title = concept.title[locale].toLowerCase();
    const short = concept.shortExplanation[locale].toLowerCase();
    // We prioritize title matches, but search explanation too
    return title.includes(normalizedQuery) || short.includes(normalizedQuery);
  });
}

/**
 * Get all concepts for a specific category
 */
export function getConceptsByCategory(category: ConceptCategory): FinancialConcept[] {
  return ALL_CONCEPTS.filter(c => c.category === category);
}

/**
 * Get all concepts for a specific difficulty level
 */
export function getConceptsByDifficulty(difficulty: ConceptDifficulty): FinancialConcept[] {
  return ALL_CONCEPTS.filter(c => c.difficulty === difficulty);
}

/**
 * Get related concepts for a given concept
 */
export function getRelatedConcepts(concept: FinancialConcept): FinancialConcept[] {
  return concept.relatedConcepts
    .map(slug => getConcept(slug))
    .filter((c): c is FinancialConcept => c !== undefined);
}
