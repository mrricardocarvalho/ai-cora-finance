"use server"

import { createClient as createServerSupabase } from '../supabase/server'
import { revalidatePath } from 'next/cache'
import { getConcept } from '../education'

/**
 * Mark a concept as learned for the current user
 */
export async function markConceptLearned(conceptSlug: string): Promise<void> {
  // Validate concept exists
  const concept = getConcept(conceptSlug)
  if (!concept) {
    throw new Error(`Invalid concept slug: ${conceptSlug}`)
  }

  const supabase = await createServerSupabase()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  // Get current learned concepts
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('learned_concepts')
    .eq('id', user.id)
    .single()

  if (fetchError) {
    throw new Error(`Failed to fetch profile: ${fetchError.message}`)
  }

  const currentLearned = (profile?.learned_concepts as string[]) || []

  // If already learned, do nothing
  if (currentLearned.includes(conceptSlug)) {
    return
  }

  // Add to learned concepts
  const updatedLearned = [...currentLearned, conceptSlug]

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ learned_concepts: updatedLearned })
    .eq('id', user.id)

  if (updateError) {
    throw new Error(`Failed to update learned concepts: ${updateError.message}`)
  }

  revalidatePath('/learn')
  revalidatePath(`/learn/${conceptSlug}`)
}

/**
 * Get all learned concepts for the current user
 */
export async function getLearnedConcepts(): Promise<string[]> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('learned_concepts')
    .eq('id', user.id)
    .single()

  return (profile?.learned_concepts as string[]) || []
}

/**
 * Check if a specific concept has been learned
 */
export async function hasLearnedConcept(conceptSlug: string): Promise<boolean> {
  const learned = await getLearnedConcepts()
  return learned.includes(conceptSlug)
}

/**
 * Reset learning progress (useful for testing)
 */
export async function resetLearningProgress(): Promise<void> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  await supabase
    .from('profiles')
    .update({ learned_concepts: [] })
    .eq('id', user.id)
  
  revalidatePath('/learn')
}
