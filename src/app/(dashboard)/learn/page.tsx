import React from 'react'
import { Metadata } from 'next'
import { LearningProgress } from '@/components/education/LearningProgress'
import { RecommendedConcepts } from '@/components/education/RecommendedConcepts'
import { ConceptLibrary } from '@/components/education/ConceptLibrary'
import { LearningProvider } from '@/components/education/LearningContext'
import { getLearnedConcepts } from '@/lib/actions/learning'

export const metadata: Metadata = {
  title: 'Learn | Cora Finance',
  description: 'Improve your financial literacy with bite-sized lessons.',
}

export default async function LearnPage() {
  const learnedConcepts = await getLearnedConcepts()

  return (
    <LearningProvider>
      <div className="container mx-auto py-6 space-y-8 max-w-7xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Financial Knowledge Base</h1>
          <p className="text-muted-foreground text-lg">
            Master your money by understanding the &quot;why&quot; behind financial decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Library */}
          <div className="lg:col-span-2 space-y-6">
            <ConceptLibrary />
          </div>

          {/* Sidebar - Progress & Recommendations */}
          <div className="space-y-6">
            <LearningProgress learnedConcepts={learnedConcepts} />
            
            <RecommendedConcepts learnedConcepts={learnedConcepts} />
          </div>
        </div>
      </div>
    </LearningProvider>
  )
}
