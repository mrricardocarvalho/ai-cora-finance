"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, BookOpen } from 'lucide-react'
import Button from '@/components/ui/button'
import { getConcept } from '@/lib/education'
import { FinancialConcept } from '@/lib/education/types'
import { useLearning } from './LearningContext'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'

interface MicroLessonProps {
  conceptSlug: string
  onComplete?: () => void
  isPopover?: boolean
  locale?: 'pt-PT' | 'en-US'
}

export function MicroLesson({ 
  conceptSlug, 
  onComplete, 
  isPopover = false,
  locale = 'en-US' 
}: MicroLessonProps) {
  const [concept, setConcept] = useState<FinancialConcept | null>(null)
  const { markAsLearned, hasLearned, isLoading } = useLearning()
  const [isMarking, setIsMarking] = useState(false)

  useEffect(() => {
    const c = getConcept(conceptSlug)
    if (c) setConcept(c)
  }, [conceptSlug])

  const handleComplete = async () => {
    setIsMarking(true)
    await markAsLearned(conceptSlug)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
    setIsMarking(false)
    if (onComplete) onComplete()
  }

  if (!concept) return null

  const isLearned = hasLearned(conceptSlug)

  return (
    <div className={cn("flex flex-col", isPopover ? "" : "border rounded-lg bg-card text-card-foreground shadow-sm")}>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4" />
          </div>
          <h3 className="font-semibold leading-none tracking-tight">
            {concept.title[locale]}
          </h3>
        </div>

        <div className="text-sm text-muted-foreground">
          {concept.shortExplanation[locale]}
        </div>

        <div className="bg-muted/50 rounded-md p-3 text-sm border border-border/50">
          <span className="font-medium text-foreground block mb-1">Example:</span>
          {concept.example[locale]}
        </div>
      </div>

      <div className="p-4 pt-0 flex items-center justify-between gap-2 mt-auto bg-muted/20 border-t border-border/50">
        <Link 
          href={`/learn/${conceptSlug}`}
          className="text-xs font-medium text-primary hover:underline flex items-center"
        >
          Full Lesson <ArrowRight className="ml-1 h-3 w-3" />
        </Link>

        {isLearned ? (
          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50 pointer-events-none h-8">
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Learned
          </Button>
        ) : (
          <Button 
            size="sm" 
            onClick={handleComplete} 
            disabled={isMarking || isLoading}
            className="h-8"
          >
            {isMarking ? 'Saving...' : 'Got it'}
          </Button>
        )}
      </div>
    </div>
  )
}
