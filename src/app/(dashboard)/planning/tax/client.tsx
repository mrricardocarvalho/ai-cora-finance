"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Receipt, Calendar, HelpCircle, BookOpen, X, Loader2 } from 'lucide-react'
import { useI18n } from '../../../../lib/i18n'
import TaxDeadlinesCard, { type TaxEventDisplay } from '../../../../components/planning/TaxDeadlinesCard'
import DeductionSummaryCard from '../../../../components/planning/DeductionSummaryCard'
import TaxChecklistCard from '../../../../components/planning/TaxChecklistCard'
import type { AnnualDeductionSummary, CategoryDeductionSummary } from '../../../../lib/tax/deduction-scanner'
import type { TaxEventInstance } from '../../../../lib/tax/calendar-types'

interface TaxPlanningClientProps {
  initialEvents: TaxEventInstance[]
  initialDeductions: AnnualDeductionSummary | null
  userId?: string
}

export default function TaxPlanningClient({ 
  initialEvents, 
  initialDeductions, 
  userId 
}: TaxPlanningClientProps) {
  const { locale } = useI18n()
  const isPT = locale === 'pt-PT'
  const router = useRouter()
  
  // State for deduction details modal
  const [showDeductionDetails, setShowDeductionDetails] = useState(false)
  const [navigatingToChat, setNavigatingToChat] = useState(false)
  
  // Transform events for display
  const [events, setEvents] = useState<TaxEventDisplay[]>(() => 
    initialEvents.map(e => ({
      id: e.id,
      name: e.event.event_name,
      name_pt: e.event.event_name_pt,
      description: e.event.description,
      description_pt: e.event.description_pt,
      eventDate: e.due_date,
      eventType: e.event.event_type,
      status: e.status,
      reminderDays: e.event.reminder_days_before
    }))
  )
  
  const [checklistCompleted, setChecklistCompleted] = useState<string[]>([])
  
  const handleEventStatusChange = async (eventId: string, status: 'done' | 'not_applicable' | 'dismissed') => {
    // Optimistic update
    setEvents(prev => prev.map(e => 
      e.id === eventId ? { ...e, status } : e
    ))
    
    // Call API
    try {
      const res = await fetch('/api/tax/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, status })
      })
      
      if (!res.ok) {
        // Revert on error
        setEvents(prev => prev.map(e => 
          e.id === eventId ? { ...e, status: 'pending' } : e
        ))
      }
    } catch {
      // Revert on error
      setEvents(prev => prev.map(e => 
        e.id === eventId ? { ...e, status: 'pending' } : e
      ))
    }
  }
  
  const handleChecklistToggle = (itemId: string, completed: boolean) => {
    setChecklistCompleted(prev => 
      completed 
        ? [...prev, itemId]
        : prev.filter(id => id !== itemId)
    )
    // Could persist to user preferences in profiles table
  }
  
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link 
          href="/planning" 
          className="p-2 rounded-lg hover:bg-[var(--border)] transition-colors"
        >
          <ArrowLeft size={20} className="text-[var(--text-secondary)]" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Receipt size={24} className="text-emerald-500" />
            {isPT ? 'Planeamento Fiscal' : 'Tax Planning'}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {isPT 
              ? 'Calendário fiscal português e otimização de deduções IRS' 
              : 'Portuguese tax calendar and IRS deduction optimization'}
          </p>
        </div>
      </div>
      
      {/* Year Selector - could add later */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <Calendar size={16} />
        <span>{isPT ? 'Ano fiscal' : 'Tax year'}: {initialDeductions?.year ?? new Date().getFullYear()}</span>
      </div>
      
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tax Deadlines */}
        <TaxDeadlinesCard 
          events={events}
          onStatusChange={userId ? handleEventStatusChange : undefined}
        />
        
        {/* Deduction Summary */}
        <DeductionSummaryCard
          categories={initialDeductions?.categories ?? []}
          totalDeductible={initialDeductions?.totalDeductible ?? 0}
          totalBenefit={initialDeductions?.totalEstimatedBenefit ?? 0}
          onViewDetails={() => setShowDeductionDetails(true)}
        />
      </div>
      
      {/* Checklist */}
      <TaxChecklistCard
        completedItems={checklistCompleted}
        onToggleItem={handleChecklistToggle}
      />
      
      {/* IRS Knowledge Quick Links */}
      <div className="p-4 bg-surface border border-[var(--border)] rounded-xl shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={20} className="text-[var(--primary)]" />
          <h3 className="font-semibold text-[var(--text-primary)]">
            {isPT ? 'Informação Útil' : 'Useful Information'}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <a 
            href="https://www.portaldasfinancas.gov.pt/at/html/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors"
          >
            <div className="font-medium text-sm text-[var(--text-primary)] mb-1">
              Portal das Finanças
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {isPT ? 'Acesso oficial AT' : 'Official AT portal'}
            </p>
          </a>
          
          <a
            href="https://faturas.portaldasfinancas.gov.pt/consultarDocumentos.action"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors"
          >
            <div className="font-medium text-sm text-[var(--text-primary)] mb-1">
              e-Fatura
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {isPT ? 'Verificar faturas e deduções' : 'Check invoices and deductions'}
            </p>
          </a>
          
          <button
            onClick={() => {
              setNavigatingToChat(true)
              router.push('/chat')
            }}
            disabled={navigatingToChat}
            className="p-3 border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors text-left disabled:opacity-70"
          >
            <div className="flex items-center gap-1.5 font-medium text-sm text-[var(--text-primary)] mb-1">
              {navigatingToChat ? <Loader2 size={14} className="animate-spin" /> : <HelpCircle size={14} />}
              {isPT ? 'Perguntar à Cora' : 'Ask Cora'}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {isPT ? 'Dúvidas sobre impostos em Portugal' : 'Questions about Portuguese taxes'}
            </p>
          </button>
        </div>
      </div>
      
      {/* Disclaimer */}
      <p className="text-xs text-center text-[var(--text-secondary)]">
        {isPT 
          ? '⚠️ Esta informação é educacional. Consulte um contabilista certificado para aconselhamento fiscal personalizado.' 
          : '⚠️ This is educational information. Consult a certified accountant for personalized tax advice.'}
      </p>
      
      {/* Deduction Details Modal */}
      {showDeductionDetails && (
        <DeductionDetailsModal
          categories={initialDeductions?.categories ?? []}
          year={initialDeductions?.year ?? new Date().getFullYear()}
          totalDeductible={initialDeductions?.totalDeductible ?? 0}
          totalBenefit={initialDeductions?.totalEstimatedBenefit ?? 0}
          isPT={isPT}
          onClose={() => setShowDeductionDetails(false)}
        />
      )}
    </div>
  )
}

// Deduction Details Modal Component
function DeductionDetailsModal({
  categories,
  year,
  totalDeductible,
  totalBenefit,
  isPT,
  onClose
}: {
  categories: CategoryDeductionSummary[]
  year: number
  totalDeductible: number
  totalBenefit: number
  isPT: boolean
  onClose: () => void
}) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat(isPT ? 'pt-PT' : 'en-US', { style: 'currency', currency: 'EUR' }).format(value)
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div 
        className="bg-surface border border-[var(--border)] rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {isPT ? 'Deduções IRS Detalhadas' : 'Detailed Tax Deductions'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {isPT ? `Ano fiscal ${year}` : `Tax year ${year}`}
            </p>
          </div>
          <button 
            onClick={onClose}
            title={isPT ? 'Fechar' : 'Close'}
            className="p-2 rounded-lg hover:bg-[var(--border)] transition-colors"
          >
            <X size={20} className="text-[var(--text-secondary)]" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-xs text-[var(--text-secondary)] mb-1">
                {isPT ? 'Total Dedutível' : 'Total Deductible'}
              </p>
              <p className="text-xl font-bold text-emerald-500">{formatCurrency(totalDeductible)}</p>
            </div>
            <div className="p-3 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-lg">
              <p className="text-xs text-[var(--text-secondary)] mb-1">
                {isPT ? 'Benefício Estimado' : 'Estimated Benefit'}
              </p>
              <p className="text-xl font-bold text-[var(--primary)]">{formatCurrency(totalBenefit)}</p>
            </div>
          </div>
          
          {/* Categories */}
          {categories.length === 0 ? (
            <p className="text-center text-[var(--text-secondary)] py-8">
              {isPT 
                ? 'Sem deduções detetadas. Importe transações para ver as suas deduções.' 
                : 'No deductions detected. Import transactions to see your deductions.'}
            </p>
          ) : (
            <div className="space-y-4">
              {categories.map(cat => (
                <div key={cat.categoryId} className="p-4 border border-[var(--border)] rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-[var(--text-primary)]">
                        {isPT ? cat.categoryNamePt : cat.categoryName}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {isPT ? cat.descriptionPt : cat.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[var(--text-primary)]">{formatCurrency(cat.deductibleAmount)}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {isPT ? 'de' : 'of'} {formatCurrency(cat.maxDeduction)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full transition-all ${
                        cat.percentOfMax >= 80 ? 'bg-emerald-500' :
                        cat.percentOfMax >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(cat.percentOfMax, 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                    <span>
                      {isPT ? 'Taxa:' : 'Rate:'} {(cat.rate * 100).toFixed(0)}%
                      {cat.vatBased && ` (${isPT ? 'base IVA' : 'VAT-based'})`}
                    </span>
                    <span>
                      {isPT ? 'Gasto:' : 'Spent:'} {formatCurrency(cat.totalSpent)}
                    </span>
                  </div>
                  
                  {/* Transactions count */}
                  {cat.transactions.length > 0 && (
                    <p className="text-xs text-[var(--text-secondary)] mt-2">
                      {cat.transactions.length} {isPT ? 'transações detetadas' : 'transactions detected'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--border)]/30">
          <p className="text-xs text-[var(--text-secondary)] text-center">
            {isPT 
              ? 'Valores estimados baseados nas suas transações. Confirme no Portal das Finanças.' 
              : 'Estimated values based on your transactions. Confirm on Portal das Finanças.'}
          </p>
        </div>
      </div>
    </div>
  )
}
