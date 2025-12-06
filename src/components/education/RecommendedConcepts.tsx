"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getRecommendedConcepts } from '@/lib/education/recommendations'
import { Badge } from '@/components/ui/badge'

interface RecommendedConceptsProps {
  learnedConcepts: string[]
}

export function RecommendedConcepts({ learnedConcepts }: RecommendedConceptsProps) {
  const recommendations = getRecommendedConcepts(learnedConcepts)

  if (recommendations.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">You&apos;re a Financial Master!</h3>
          <p className="text-muted-foreground">
            You&apos;ve completed all available lessons. Check back later for new content!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map(concept => (
          <div key={concept.id} className="group relative flex flex-col gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <Badge variant="default" className="text-xs capitalize">
                {concept.category}
              </Badge>
              <Badge variant="default" className="text-[10px] h-5">
                {concept.difficulty}
              </Badge>
            </div>
            
            <div>
              <h4 className="font-medium group-hover:text-primary transition-colors">
                <Link href={`/learn/${concept.slug}`} className="absolute inset-0">
                  <span className="sr-only">View {concept.title['en-US']}</span>
                </Link>
                {concept.title['en-US']}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {concept.shortExplanation['en-US']}
              </p>
            </div>
            
            <div className="flex items-center text-xs text-primary font-medium mt-1">
              Start Lesson <ArrowRight className="ml-1 h-3 w-3" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
