"use client"

import React from 'react'
import { AddedLifeEvent } from './LifeEventSimulator'
import { LIFE_EVENT_TEMPLATES } from '@/lib/planning/life-events'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface Props {
  events: AddedLifeEvent[]
}

export function EventTimeline({ events }: Props) {
  if (events.length === 0) return null

  const sortedEvents = [...events].sort((a, b) => a.startMonth - b.startMonth)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative border-l-2 border-muted ml-4 space-y-8 pb-4">
          {sortedEvents.map((event, _index) => {
            const template = LIFE_EVENT_TEMPLATES.find(t => t.id === event.templateId)
            if (!template) return null

            const date = new Date()
            date.setMonth(date.getMonth() + event.startMonth)
            const year = date.getFullYear()
            const monthName = date.toLocaleDateString(undefined, { month: 'short' })

            return (
              <div key={event.id} className="relative pl-8">
                {/* Timeline Dot */}
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary ring-4 ring-background flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-background" />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
                  <Badge variant="outline" className="w-fit">
                    {monthName} {year}
                  </Badge>
                  <span className="font-semibold flex items-center gap-2">
                    <span>{template.icon}</span>
                    {template.name}
                  </span>
                </div>

                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(event.params).map(([key, value]) => {
                      const paramDef = template.params.find(p => p.key === key)
                      if (!paramDef) return null
                      return (
                        <div key={key} className="flex justify-between gap-4">
                          <span>{paramDef.label}:</span>
                          <span className="font-medium text-foreground">
                            {paramDef.type === 'currency' ? formatCurrency(value) : value}
                            {paramDef.type === 'months' ? ' mo' : ''}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
