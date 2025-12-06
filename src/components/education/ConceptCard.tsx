"use client"

import React from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FinancialConcept } from '@/lib/education/types'

interface ConceptCardProps {
  concept: FinancialConcept
  isLearned?: boolean
  locale?: 'pt-PT' | 'en-US'
  compact?: boolean
  className?: string
}

export function ConceptCard({ 
  concept, 
  isLearned = false, 
  locale = 'en-US',
  compact = false,
  className 
}: ConceptCardProps) {
  const title = concept.title[locale]
  const description = concept.shortExplanation[locale]

  const difficultyColor = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }

  if (compact) {
    return (
      <Link href={`/learn/${concept.slug}`} className={cn("block h-full", className)}>
        <Card className="h-full cursor-pointer border border-[var(--border-glass)] bg-[var(--surface-glass)] backdrop-blur-lg shadow-glass hover:shadow-elevated transition-all hover:-translate-y-0.5">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm line-clamp-2 text-[var(--text-primary)]">{title}</h4>
              {isLearned && <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0" />}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{description}</p>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/learn/${concept.slug}`} className={cn("block h-full", className)}>
      <Card className="h-full flex flex-col cursor-pointer group border border-[var(--border-glass)] bg-[var(--surface-glass)] backdrop-blur-lg shadow-glass hover:shadow-elevated transition-all hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-2">
            <Badge variant="default" className={cn("capitalize font-normal text-xs", difficultyColor[concept.difficulty])}>
              {concept.difficulty}
            </Badge>
            {isLearned && (
              <Badge variant="default" className="bg-[var(--success-subtle)] text-[var(--success)] gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Learned
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg mt-2 text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">{title}</CardTitle>
          <CardDescription className="line-clamp-2 text-[var(--text-secondary)]">{description}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto pt-0">
          <div className="flex items-center text-sm text-[var(--primary)] font-medium mt-2">
            Read more <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
