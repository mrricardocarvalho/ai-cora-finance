"use client"

import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, XCircle, ArrowRight, Zap, ShieldAlert, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Recommendation } from '@/lib/intelligence/recommendations'

interface Props {
  recommendation: Recommendation
  onAction: (id: string, action: 'completed' | 'dismissed' | 'snoozed') => void
}

export function RecommendationCard({ recommendation, onAction }: Props) {
  const getIcon = () => {
    switch (recommendation.priority) {
      case 'urgent': return <ShieldAlert className="h-5 w-5 text-[var(--danger)]" />
      case 'important': return <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
      case 'optimization': return <Zap className="h-5 w-5 text-[var(--warning)]" />
      default: return <CheckCircle2 className="h-5 w-5 text-[var(--text-muted)]" />
    }
  }

  const getBadgeVariant = () => {
    switch (recommendation.priority) {
      case 'urgent': return 'danger'
      case 'important': return 'default'
      case 'optimization': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <Card className="flex h-full flex-col border-[var(--border-glass)] bg-[var(--surface-glass)] shadow-glass backdrop-blur-xl transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:shadow-elevated">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-2">
            {getIcon()}
            <Badge variant={getBadgeVariant()} className="capitalize">
              {recommendation.priority}
            </Badge>
          </div>
          <Badge variant="outline" className="text-xs">
            Impact: {recommendation.impact_score}/10
          </Badge>
        </div>
        <CardTitle className="mt-2 text-lg">{recommendation.title}</CardTitle>
        <CardDescription>{recommendation.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* Optional: Add more details or visualization here if available */}
      </CardContent>
      <CardFooter className="flex justify-between gap-2 pt-0">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onAction(recommendation.id, 'snoozed')} title="Snooze for 1 month">
            <Clock className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAction(recommendation.id, 'dismissed')} title="Dismiss">
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
        {recommendation.action_link ? (
          <Link href={recommendation.action_link}>
            <Button size="sm" className="gap-2">
              Take Action <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Button size="sm" onClick={() => onAction(recommendation.id, 'completed')}>
            Mark Complete
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
