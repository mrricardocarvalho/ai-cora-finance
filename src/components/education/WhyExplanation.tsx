"use client"

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface WhyExplanationProps {
  why: string
  learnMoreSlug?: string
  className?: string
}

export function WhyExplanation({ why, learnMoreSlug, className }: WhyExplanationProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!why) return null

  return (
    <div className={cn("mt-3 border-t border-border/50 pt-2", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full text-left"
      >
        <Lightbulb className="h-3 w-3 mr-1.5 text-yellow-500" />
        <span>Why this matters</span>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3 ml-auto" />
        ) : (
          <ChevronDown className="h-3 w-3 ml-auto" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-200">
          <p>{why}</p>
          {learnMoreSlug && (
            <div className="mt-2">
              <Link 
                href={`/learn/${learnMoreSlug}`}
                className="text-primary hover:underline text-xs font-medium inline-flex items-center"
              >
                Learn more about this concept →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
