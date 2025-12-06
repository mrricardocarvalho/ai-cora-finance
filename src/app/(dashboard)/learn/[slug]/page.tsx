import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react'
import { getConcept, getRelatedConcepts } from '@/lib/education'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ConceptCard } from '@/components/education/ConceptCard'
import { ExampleCalculation } from '@/components/education/examples/ExampleCalculation'
import { LearningProvider } from '@/components/education/LearningContext'
import { MicroLesson } from '@/components/education/MicroLesson'
import { getLearnedConcepts } from '@/lib/actions/learning'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps) {
  const concept = getConcept(params.slug)
  if (!concept) return { title: 'Concept Not Found' }
  
  return {
    title: `${concept.title['en-US']} | Learn`,
    description: concept.shortExplanation['en-US']
  }
}

export default async function ConceptDetailPage({ params }: PageProps) {
  const concept = getConcept(params.slug)
  
  if (!concept) {
    notFound()
  }

  const relatedConcepts = getRelatedConcepts(concept)
  const learnedConcepts = await getLearnedConcepts()
  const isLearned = learnedConcepts.includes(concept.slug)

  return (
    <LearningProvider>
      <div className="container mx-auto py-6 max-w-4xl space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/learn" className="hover:text-foreground transition-colors">Learn</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="capitalize">{concept.category}</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-foreground font-medium">{concept.title['en-US']}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="capitalize">
                  {concept.difficulty}
                </Badge>
                <Badge variant="default" className="capitalize">
                  {concept.category}
                </Badge>
                {isLearned && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Learned
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight">{concept.title['en-US']}</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {concept.shortExplanation['en-US']}
              </p>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h3>Explanation</h3>
              <p>{concept.fullExplanation['en-US']}</p>
            </div>

            <Card className="bg-muted/30 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  Example
                </h3>
                <p className="text-muted-foreground">
                  {concept.example['en-US']}
                </p>
                
                <ExampleCalculation type={concept.slug} />
              </CardContent>
            </Card>

            {/* Action Area */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Link 
                href="/learn" 
                className="inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 px-4 py-2.5 text-sm bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Library
              </Link>
              
              {/* MicroLesson component handles the "Mark as Learned" logic */}
              <div className="hidden">
                {/* Hidden because we just want the logic, or we can reuse the button part */}
              </div>
              <MicroLesson conceptSlug={concept.slug} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {relatedConcepts.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Related Concepts</h3>
                <div className="grid gap-3">
                  {relatedConcepts.map((related) => (
                    <ConceptCard 
                      key={related.id} 
                      concept={related} 
                      compact 
                      isLearned={learnedConcepts.includes(related.slug)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </LearningProvider>
  )
}
