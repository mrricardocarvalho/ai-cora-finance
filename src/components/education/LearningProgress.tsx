"use client"

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Star } from 'lucide-react'
import { ALL_CONCEPTS } from '@/lib/education/concepts'
import { ConceptCategory } from '@/lib/education/types'
import { cn } from '@/lib/utils'

interface LearningProgressProps {
  learnedConcepts: string[]
  className?: string
}

export function LearningProgress({ learnedConcepts, className }: LearningProgressProps) {
  const totalConcepts = ALL_CONCEPTS.length
  const learnedCount = learnedConcepts.length
  const progress = Math.round((learnedCount / totalConcepts) * 100) || 0

  const categories: ConceptCategory[] = ['investing', 'budgeting', 'debt', 'taxes', 'saving']
  
  const getCategoryProgress = (cat: ConceptCategory) => {
    const totalInCat = ALL_CONCEPTS.filter(c => c.category === cat).length
    const learnedInCat = ALL_CONCEPTS.filter(c => c.category === cat && learnedConcepts.includes(c.slug)).length
    return { total: totalInCat, learned: learnedInCat, percent: totalInCat > 0 ? Math.round((learnedInCat / totalInCat) * 100) : 0 }
  }

  return (
    <Card className={cn(
      "border-[var(--border-glass)] bg-[var(--surface-glass)] shadow-glass backdrop-blur-lg transition-all duration-300 ease-smooth hover:shadow-elevated",
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-[var(--text-primary)]">
            <Trophy className="h-5 w-5 text-[var(--warning)]" />
            Your Learning Journey
          </CardTitle>
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            {learnedCount} / {totalConcepts} Concepts
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-[var(--text-primary)]">Total Progress</span>
              <span className="text-[var(--text-secondary)]">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2.5" />
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
            {categories.map(cat => {
              const stats = getCategoryProgress(cat)
              if (stats.total === 0) return null
              
              const isComplete = stats.percent === 100
              
              return (
                <div
                  key={cat}
                  className="flex flex-col justify-center rounded-full border border-[var(--border-glass)] bg-[var(--surface-subtle)]/70 px-3 py-2 shadow-glass/40"
                >
                  <span className="flex items-center gap-1 text-[11px] font-medium capitalize text-[var(--text-secondary)]">
                    {cat}
                    {isComplete && (
                      <Star className="h-3 w-3 text-[var(--success)] fill-[var(--success)]" />
                    )}
                  </span>
                  <span className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                    {stats.learned}/{stats.total}
                  </span>
                  <div className="mt-1.5">
                    <Progress value={stats.percent} className="h-1.5" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
