// Epic 9: Financial Literacy Engine - Type Definitions

export type ConceptDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type ConceptCategory = 'investing' | 'budgeting' | 'taxes' | 'debt' | 'saving'

export interface LocalizedString {
  'pt-PT': string
  'en-US': string
}

export interface FinancialConcept {
  id: string
  slug: string
  title: LocalizedString
  shortExplanation: LocalizedString
  fullExplanation: LocalizedString
  example: LocalizedString
  relatedConcepts: string[] // slugs of related concepts
  difficulty: ConceptDifficulty
  category: ConceptCategory
  // Optional fields for enhanced content
  formula?: string // Mathematical formula if applicable
  visualType?: 'chart' | 'diagram' | 'comparison' | 'timeline'
}

export interface LearningTrigger {
  id: string
  conceptSlug: string
  triggerType: 
    | 'first_view' 
    | 'threshold_reached' 
    | 'action_taken' 
    | 'insight_shown'
  triggerCondition: string // e.g., 'fire_projection', 'etf_added', 'first_debt'
  priority: number // Higher = more important to show
}

export interface MicroLessonContent {
  concept: FinancialConcept
  contextualMessage?: LocalizedString // Why this is relevant now
}

export interface UserLearningProgress {
  learnedConcepts: string[] // concept slugs
  lastLearnedAt?: Date
  currentStreak?: number
  totalConceptsLearned: number
  completedCategories: ConceptCategory[]
}

// Trigger context for determining when to show micro-lessons
export interface TriggerContext {
  userId: string
  page: string
  action?: string
  entityType?: 'account' | 'transaction' | 'investment' | 'goal' | 'insight'
  entityData?: Record<string, unknown>
  learnedConcepts: string[]
}

export interface ConceptRecommendation {
  concept: FinancialConcept
  reason: LocalizedString
  priority: number
}
