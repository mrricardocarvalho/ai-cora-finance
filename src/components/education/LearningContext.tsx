"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getLearnedConcepts, markConceptLearned as markLearnedAction } from '@/lib/actions/learning'
import { useToast } from '@/components/ui/toast-provider'

interface LearningContextType {
  learnedConcepts: string[]
  hasLearned: (slug: string) => boolean
  markAsLearned: (slug: string) => Promise<void>
  isLoading: boolean
}

const LearningContext = createContext<LearningContextType | undefined>(undefined)

export function LearningProvider({ children }: { children: React.ReactNode }) {
  const [learnedConcepts, setLearnedConcepts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

  // Load initial state
  useEffect(() => {
    async function load() {
      try {
        const concepts = await getLearnedConcepts()
        setLearnedConcepts(concepts)
      } catch (error) {
        console.error('Failed to load learned concepts:', error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const hasLearned = useCallback((slug: string) => {
    return learnedConcepts.includes(slug)
  }, [learnedConcepts])

  const markAsLearned = useCallback(async (slug: string) => {
    // Optimistic update
    if (learnedConcepts.includes(slug)) return

    const prev = [...learnedConcepts]
    setLearnedConcepts(current => [...current, slug])

    try {
      await markLearnedAction(slug)
      toast('success', 'Concept marked as learned!')
    } catch (error) {
      // Revert on error
      setLearnedConcepts(prev)
      toast('error', 'Failed to save progress')
      console.error(error)
    }
  }, [learnedConcepts, toast])

  return (
    <LearningContext.Provider value={{ learnedConcepts, hasLearned, markAsLearned, isLoading }}>
      {children}
    </LearningContext.Provider>
  )
}

export function useLearning() {
  const context = useContext(LearningContext)
  if (context === undefined) {
    throw new Error('useLearning must be used within a LearningProvider')
  }
  return context
}
