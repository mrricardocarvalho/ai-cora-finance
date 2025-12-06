"use client"

import React, { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import Button from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { MicroLesson } from './MicroLesson'
import { useLearning } from './LearningContext'
import { cn } from '@/lib/utils'

interface LearnChipProps {
  conceptSlug: string
  size?: 'sm' | 'md'
  className?: string
}

export function LearnChip({ conceptSlug, size = 'sm', className }: LearnChipProps) {
  const { hasLearned } = useLearning()
  const [isOpen, setIsOpen] = useState(false)

  // Don't show if already learned (optional: could show a "Review" state instead)
  if (hasLearned(conceptSlug)) {
    return null
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            "gap-1.5 text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400 dark:hover:bg-amber-900/50",
            size === 'sm' ? "h-6 px-2 text-xs" : "h-8 px-3 text-sm",
            className
          )}
        >
          <Lightbulb className={cn("fill-current", size === 'sm' ? "h-3 w-3" : "h-4 w-4")} />
          {size === 'md' && <span>Learn</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 overflow-hidden" align="start">
        <MicroLesson 
          conceptSlug={conceptSlug} 
          onComplete={() => setIsOpen(false)} 
          isPopover 
        />
      </PopoverContent>
    </Popover>
  )
}
