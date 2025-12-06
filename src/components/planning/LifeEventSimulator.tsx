"use client"

import React, { useState } from 'react'
import { LIFE_EVENT_TEMPLATES } from '@/lib/planning/life-events'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Plus, Calendar, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export interface AddedLifeEvent {
  id: string
  templateId: string
  startMonth: number
  params: Record<string, number>
}

interface Props {
  onEventsChange: (events: AddedLifeEvent[]) => void
}

export function LifeEventSimulator({ onEventsChange }: Props) {
  const [events, setEvents] = useState<AddedLifeEvent[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [tempParams, setTempParams] = useState<Record<string, number>>({})
  const [startMonth, setStartMonth] = useState<number>(12) // Default 1 year from now

  const selectedTemplate = LIFE_EVENT_TEMPLATES.find(t => t.id === selectedTemplateId)

  const handleTemplateSelect = (id: string) => {
    setSelectedTemplateId(id)
    const template = LIFE_EVENT_TEMPLATES.find(t => t.id === id)
    if (template) {
      const defaults: Record<string, number> = {}
      template.params.forEach(p => defaults[p.key] = p.defaultValue)
      setTempParams(defaults)
    }
  }

  const handleParamChange = (key: string, value: number) => {
    setTempParams(prev => ({ ...prev, [key]: value }))
  }

  const addEvent = () => {
    if (!selectedTemplate) return
    const newEvent: AddedLifeEvent = {
      id: Math.random().toString(36).substr(2, 9),
      templateId: selectedTemplate.id,
      startMonth,
      params: { ...tempParams }
    }
    const newEvents = [...events, newEvent].sort((a, b) => a.startMonth - b.startMonth)
    setEvents(newEvents)
    onEventsChange(newEvents)
    setIsDialogOpen(false)
    setSelectedTemplateId('')
  }

  const removeEvent = (id: string) => {
    const newEvents = events.filter(e => e.id !== id)
    setEvents(newEvents)
    onEventsChange(newEvents)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Life Timeline</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Life Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Major Life Event</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Event Type</Label>
                <Select onValueChange={handleTemplateSelect} value={selectedTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event..." />
                  </SelectTrigger>
                  <SelectContent>
                    {LIFE_EVENT_TEMPLATES.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="mr-2">{t.icon}</span>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate && (
                <>
                  <div className="grid gap-2">
                    <Label>When? (Months from now)</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        value={startMonth} 
                        onChange={(e) => setStartMonth(Number(e.target.value))}
                        min={0}
                        max={120}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Approx. {new Date(new Date().setMonth(new Date().getMonth() + startMonth)).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="space-y-3 border-t pt-3">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Parameters</Label>
                    {selectedTemplate.params.map(param => (
                      <div key={param.key} className="grid gap-1.5">
                        <Label htmlFor={param.key}>{param.label}</Label>
                        <Input
                          id={param.key}
                          type="number"
                          value={tempParams[param.key]}
                          onChange={(e) => handleParamChange(param.key, Number(e.target.value))}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button onClick={addEvent} disabled={!selectedTemplate}>Add to Timeline</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
            No events added yet. Click &quot;Add Life Event&quot; to start planning.
          </div>
        ) : (
          <div className="relative border-l-2 border-muted ml-4 space-y-8 pb-4">
            {events.map((event) => {
              const template = LIFE_EVENT_TEMPLATES.find(t => t.id === event.templateId)
              if (!template) return null
              
              const date = new Date()
              date.setMonth(date.getMonth() + event.startMonth)

              return (
                <div key={event.id} className="relative pl-8">
                  <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <span>{template.icon}</span>
                            {template.name}
                          </CardTitle>
                          <CardDescription>
                            {date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} (Month {event.startMonth})
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeEvent(event.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      {Object.entries(event.params).map(([key, value]) => {
                        const paramDef = template.params.find(p => p.key === key)
                        if (!paramDef) return null
                        return (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground">{paramDef.label}:</span>
                            <span className="font-medium">
                              {paramDef.type === 'currency' ? formatCurrency(value) : value}
                              {paramDef.type === 'months' ? ' mo' : ''}
                            </span>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
