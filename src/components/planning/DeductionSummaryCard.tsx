"use client"
import React from 'react'
import { Receipt, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react'
import { useI18n } from '../../lib/i18n/context'
import type { CategoryDeductionSummary } from '../../lib/tax/deduction-scanner'

interface DeductionSummaryCardProps {
  categories: CategoryDeductionSummary[]
  totalDeductible: number
  totalBenefit: number
  loading?: boolean
  onViewDetails?: () => void
}

export default function DeductionSummaryCard({ 
  categories, 
  totalDeductible, 
  totalBenefit,
  loading,
  onViewDetails
}: DeductionSummaryCardProps) {
  const { locale } = useI18n()
  const isPT = locale === 'pt-PT'
  
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(value)
  
  const getProgressColor = (percent: number): string => {
    if (percent >= 80) return 'bg-emerald-500'
    if (percent >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }
  
  if (loading) {
    return (
      <div className="p-4 bg-surface border border-[var(--border)] rounded-xl shadow-card animate-pulse">
        <div className="h-6 w-48 bg-[var(--border)] rounded mb-4" />
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="h-20 bg-[var(--border)] rounded" />
          <div className="h-20 bg-[var(--border)] rounded" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-[var(--border)] rounded" />
          ))}
        </div>
      </div>
    )
  }
  
  // Top categories by usage
  const topCategories = [...categories]
    .sort((a, b) => b.percentOfMax - a.percentOfMax)
    .slice(0, 4)
  
  return (
    <div className="p-4 bg-surface border border-[var(--border)] rounded-xl shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Receipt size={20} className="text-emerald-500" />
          <h3 className="font-semibold text-[var(--text-primary)]">
            {isPT ? 'Deduções IRS' : 'Tax Deductions'}
          </h3>
        </div>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            {isPT ? 'Ver detalhes' : 'View details'}
            <ChevronRight size={14} />
          </button>
        )}
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <Receipt size={14} className="text-emerald-500" />
            <span className="text-xs text-[var(--text-secondary)]">
              {isPT ? 'Dedutível' : 'Deductible'}
            </span>
          </div>
          <p className="text-lg font-semibold text-emerald-500">
            {formatCurrency(totalDeductible)}
          </p>
        </div>
        
        <div className="p-3 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={14} className="text-[var(--primary)]" />
            <span className="text-xs text-[var(--text-secondary)]">
              {isPT ? 'Benefício Est.' : 'Est. Benefit'}
            </span>
          </div>
          <p className="text-lg font-semibold text-[var(--primary)]">
            {formatCurrency(totalBenefit)}
          </p>
        </div>
      </div>
      
      {/* Category Progress */}
      {topCategories.length === 0 ? (
        <div className="text-center py-4 text-[var(--text-secondary)]">
          <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            {isPT 
              ? 'Sem deduções detetadas. Importe transações para começar.' 
              : 'No deductions detected. Import transactions to start.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {topCategories.map(cat => (
            <div key={cat.categoryId}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {isPT ? cat.categoryNamePt : cat.categoryName}
                </span>
                <span className="text-xs text-[var(--text-secondary)]">
                  {formatCurrency(cat.deductibleAmount)} / {formatCurrency(cat.maxDeduction)}
                </span>
              </div>
              <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getProgressColor(cat.percentOfMax)} transition-all duration-500`}
                  style={{ width: `${Math.min(cat.percentOfMax, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* NIF Reminder */}
      {categories.some(c => c.requiresNIF) && (
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[var(--text-secondary)]">
              {isPT 
                ? 'Lembre-se: peça sempre fatura com NIF para maximizar deduções.' 
                : 'Remember: always request invoices with NIF to maximize deductions.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
