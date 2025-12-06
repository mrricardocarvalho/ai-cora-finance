"use client"
import React from 'react'
import { Calendar, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react'
import { useI18n } from '../../lib/i18n/context'
import { format, differenceInDays, parseISO } from 'date-fns'
import { pt, enUS } from 'date-fns/locale'

export interface TaxEventDisplay {
  id: string
  name: string
  name_pt: string
  description: string
  description_pt: string
  eventDate: string
  eventType: 'deadline' | 'payment' | 'info'
  status: 'pending' | 'done' | 'not_applicable' | 'dismissed'
  reminderDays: number[]
}

interface TaxDeadlinesCardProps {
  events: TaxEventDisplay[]
  onStatusChange?: (eventId: string, status: 'done' | 'not_applicable' | 'dismissed') => void
  loading?: boolean
}

export default function TaxDeadlinesCard({ events, onStatusChange, loading }: TaxDeadlinesCardProps) {
  const { locale } = useI18n()
  const isPT = locale === 'pt-PT'
  const dateLocale = isPT ? pt : enUS
  
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'deadline':
        return <Clock size={16} className="text-amber-500" />
      case 'payment':
        return <AlertTriangle size={16} className="text-red-500" />
      default:
        return <Calendar size={16} className="text-blue-500" />
    }
  }
  
  const getUrgencyColor = (daysUntil: number, eventType: string): string => {
    if (eventType === 'payment') {
      if (daysUntil <= 3) return 'border-red-500 bg-red-500/5'
      if (daysUntil <= 7) return 'border-amber-500 bg-amber-500/5'
    }
    if (daysUntil <= 7) return 'border-amber-500 bg-amber-500/5'
    if (daysUntil <= 14) return 'border-yellow-500 bg-yellow-500/5'
    return 'border-[var(--border)]'
  }
  
  const handleMarkDone = (eventId: string) => {
    onStatusChange?.(eventId, 'done')
  }
  
  const handleDismiss = (eventId: string) => {
    onStatusChange?.(eventId, 'dismissed')
  }
  
  // Filter only pending events, sort by date
  const pendingEvents = events
    .filter(e => e.status === 'pending')
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
  
  if (loading) {
    return (
      <div className="p-4 bg-surface border border-[var(--border)] rounded-xl shadow-card animate-pulse">
        <div className="h-6 w-40 bg-[var(--border)] rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-[var(--border)] rounded" />
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-4 bg-surface border border-[var(--border)] rounded-xl shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={20} className="text-emerald-500" />
        <h3 className="font-semibold text-[var(--text-primary)]">
          {isPT ? 'Próximos Prazos Fiscais' : 'Upcoming Tax Deadlines'}
        </h3>
      </div>
      
      {pendingEvents.length === 0 ? (
        <div className="text-center py-6 text-[var(--text-secondary)]">
          <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500" />
          <p>{isPT ? 'Sem prazos próximos!' : 'No upcoming deadlines!'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingEvents.slice(0, 5).map(event => {
            const eventDate = parseISO(event.eventDate)
            const daysUntil = differenceInDays(eventDate, new Date())
            const urgencyClass = getUrgencyColor(daysUntil, event.eventType)
            
            return (
              <div
                key={event.id}
                className={`p-3 border rounded-lg ${urgencyClass} transition-all`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getEventIcon(event.eventType)}
                      <span className="font-medium text-[var(--text-primary)]">
                        {isPT ? event.name_pt : event.name}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">
                      {isPT ? event.description_pt : event.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-[var(--text-secondary)]">
                        {format(eventDate, isPT ? "d 'de' MMMM" : 'MMMM d', { locale: dateLocale })}
                      </span>
                      <span className={`font-medium ${daysUntil <= 7 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {daysUntil === 0 
                          ? (isPT ? 'Hoje!' : 'Today!')
                          : daysUntil === 1 
                            ? (isPT ? 'Amanhã' : 'Tomorrow')
                            : (isPT ? `${daysUntil} dias` : `${daysUntil} days`)
                        }
                      </span>
                    </div>
                  </div>
                  
                  {onStatusChange && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleMarkDone(event.id)}
                        className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-500 transition-colors"
                        title={isPT ? 'Marcar como feito' : 'Mark as done'}
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => handleDismiss(event.id)}
                        className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--text-secondary)] transition-colors"
                        title={isPT ? 'Dispensar' : 'Dismiss'}
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          
          {pendingEvents.length > 5 && (
            <p className="text-sm text-center text-[var(--text-secondary)]">
              {isPT 
                ? `+ ${pendingEvents.length - 5} mais eventos` 
                : `+ ${pendingEvents.length - 5} more events`}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
