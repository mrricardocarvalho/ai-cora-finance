import { FinancialConcept } from '../types';
import { INVESTING_BEGINNER_CONCEPTS } from './investing-beginner';
import { BUDGETING_BEGINNER_CONCEPTS } from './budgeting-beginner';
import { DEBT_BEGINNER_CONCEPTS } from './debt-beginner';
import { TAXES_BEGINNER_CONCEPTS } from './taxes-beginner';
import { INVESTING_INTERMEDIATE_CONCEPTS } from './investing-intermediate';
import { INVESTING_ADVANCED_CONCEPTS } from './investing-advanced';

// Combine all concepts
export const ALL_CONCEPTS: FinancialConcept[] = [
  ...INVESTING_BEGINNER_CONCEPTS,
  ...BUDGETING_BEGINNER_CONCEPTS,
  ...DEBT_BEGINNER_CONCEPTS,
  ...TAXES_BEGINNER_CONCEPTS,
  ...INVESTING_INTERMEDIATE_CONCEPTS,
  ...INVESTING_ADVANCED_CONCEPTS,
];

// Export by category for convenience
export const INVESTING_CONCEPTS = ALL_CONCEPTS.filter(c => c.category === 'investing');
export const BUDGETING_CONCEPTS = ALL_CONCEPTS.filter(c => c.category === 'budgeting');
export const DEBT_CONCEPTS = ALL_CONCEPTS.filter(c => c.category === 'debt');
export const TAXES_CONCEPTS = ALL_CONCEPTS.filter(c => c.category === 'taxes');
export const SAVING_CONCEPTS = ALL_CONCEPTS.filter(c => c.category === 'saving');
