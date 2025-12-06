"use client"
import React, { useState } from 'react'
import { CheckSquare, CheckCircle, Circle, Calendar, FileText, Receipt, CreditCard } from 'lucide-react'
import { useI18n } from '../../lib/i18n/context'

interface ChecklistItem {
  id: string
  label: string
  label_pt: string
  description?: string
  description_pt?: string
  category: 'documents' | 'deadlines' | 'deductions' | 'general'
  priority: 'high' | 'medium' | 'low'
}

const TAX_CHECKLIST: ChecklistItem[] = [
  // Documents
  {
    id: 'verify_efatura',
    label: 'Verify e-Fatura invoices',
    label_pt: 'Verificar faturas no e-Fatura',
    description: 'Check all invoices are correctly categorized',
    description_pt: 'Confirme que todas as faturas estão corretamente categorizadas',
    category: 'documents',
    priority: 'high'
  },
  {
    id: 'collect_rent_receipts',
    label: 'Collect rent receipts',
    label_pt: 'Reunir recibos de renda',
    description: 'Request annual rent receipt from landlord',
    description_pt: 'Solicite o recibo anual ao senhorio',
    category: 'documents',
    priority: 'medium'
  },
  {
    id: 'health_receipts',
    label: 'Gather health expense receipts',
    label_pt: 'Reunir recibos de saúde',
    description: 'Hospital, pharmacy, and medical expenses',
    description_pt: 'Hospital, farmácia e despesas médicas',
    category: 'documents',
    priority: 'medium'
  },
  {
    id: 'education_receipts',
    label: 'Gather education receipts',
    label_pt: 'Reunir recibos de educação',
    description: 'School fees, courses, and training',
    description_pt: 'Propinas, cursos e formação',
    category: 'documents',
    priority: 'medium'
  },
  // Deadlines
  {
    id: 'check_irs_dates',
    label: 'Check IRS submission dates',
    label_pt: 'Verificar datas do IRS',
    description: 'Usually April 1 - June 30',
    description_pt: 'Geralmente 1 de Abril - 30 de Junho',
    category: 'deadlines',
    priority: 'high'
  },
  {
    id: 'check_imi_payment',
    label: 'Check IMI payment dates',
    label_pt: 'Verificar datas do IMI',
    description: 'Property tax payments in May, August, November',
    description_pt: 'Pagamentos em Maio, Agosto, Novembro',
    category: 'deadlines',
    priority: 'medium'
  },
  // Deductions
  {
    id: 'maximize_health',
    label: 'Maximize health deductions',
    label_pt: 'Maximizar deduções de saúde',
    description: 'Up to €1,000 at 15% rate',
    description_pt: 'Até €1.000 a 15%',
    category: 'deductions',
    priority: 'medium'
  },
  {
    id: 'request_nif',
    label: 'Request NIF on invoices',
    label_pt: 'Pedir NIF nas faturas',
    description: 'Required for all deductible expenses',
    description_pt: 'Obrigatório para todas as despesas dedutíveis',
    category: 'deductions',
    priority: 'high'
  },
  // General
  {
    id: 'update_household',
    label: 'Update household information',
    label_pt: 'Atualizar agregado familiar',
    description: 'Ensure dependents are registered',
    description_pt: 'Confirme que os dependentes estão registados',
    category: 'general',
    priority: 'low'
  },
  {
    id: 'check_automatic_irs',
    label: 'Check automatic IRS option',
    label_pt: 'Verificar IRS automático',
    description: 'See if you qualify for automatic declaration',
    description_pt: 'Verifique se pode usar a declaração automática',
    category: 'general',
    priority: 'low'
  }
]

interface TaxChecklistCardProps {
  completedItems?: string[]
  onToggleItem?: (itemId: string, completed: boolean) => void
}

export default function TaxChecklistCard({ completedItems = [], onToggleItem }: TaxChecklistCardProps) {
  const { locale } = useI18n()
  const isPT = locale === 'pt-PT'
  
  const [localCompleted, setLocalCompleted] = useState<Set<string>>(new Set(completedItems))
  
  const handleToggle = (itemId: string) => {
    const newCompleted = new Set(localCompleted)
    const isNowCompleted = !newCompleted.has(itemId)
    
    if (isNowCompleted) {
      newCompleted.add(itemId)
    } else {
      newCompleted.delete(itemId)
    }
    
    setLocalCompleted(newCompleted)
    onToggleItem?.(itemId, isNowCompleted)
  }
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'documents':
        return <FileText size={14} className="text-blue-500" />
      case 'deadlines':
        return <Calendar size={14} className="text-amber-500" />
      case 'deductions':
        return <Receipt size={14} className="text-emerald-500" />
      default:
        return <CreditCard size={14} className="text-[var(--text-secondary)]" />
    }
  }
  
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { en: string; pt: string }> = {
      documents: { en: 'Documents', pt: 'Documentos' },
      deadlines: { en: 'Deadlines', pt: 'Prazos' },
      deductions: { en: 'Deductions', pt: 'Deduções' },
      general: { en: 'General', pt: 'Geral' }
    }
    return isPT ? labels[category]?.pt ?? category : labels[category]?.en ?? category
  }
  
  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-500/10 text-red-500',
      medium: 'bg-amber-500/10 text-amber-500',
      low: 'bg-[var(--border)] text-[var(--text-secondary)]'
    }
    const labels: Record<string, { en: string; pt: string }> = {
      high: { en: 'High', pt: 'Alta' },
      medium: { en: 'Medium', pt: 'Média' },
      low: { en: 'Low', pt: 'Baixa' }
    }
    return (
      <span className={`text-[10px] px-1.5 py-0.5 rounded ${colors[priority]}`}>
        {isPT ? labels[priority]?.pt : labels[priority]?.en}
      </span>
    )
  }
  
  // Group by category
  const groupedItems = TAX_CHECKLIST.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ChecklistItem[]>)
  
  const completedCount = localCompleted.size
  const totalCount = TAX_CHECKLIST.length
  const progressPercent = (completedCount / totalCount) * 100
  
  return (
    <div className="p-4 bg-surface border border-[var(--border)] rounded-xl shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare size={20} className="text-emerald-500" />
          <h3 className="font-semibold text-[var(--text-primary)]">
            {isPT ? 'Checklist Fiscal' : 'Tax Checklist'}
          </h3>
        </div>
        <span className="text-sm text-[var(--text-secondary)]">
          {completedCount}/{totalCount}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      {/* Checklist by category */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category}>
            <div className="flex items-center gap-1.5 mb-2">
              {getCategoryIcon(category)}
              <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                {getCategoryLabel(category)}
              </span>
            </div>
            
            <div className="space-y-1">
              {items.map(item => {
                const isCompleted = localCompleted.has(item.id)
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className={`w-full p-2 rounded-lg text-left transition-all flex items-start gap-2 ${
                      isCompleted 
                        ? 'bg-emerald-500/10 line-through opacity-60' 
                        : 'hover:bg-[var(--border)]'
                    }`}
                  >
                    {isCompleted 
                      ? <CheckCircle size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      : <Circle size={18} className="text-[var(--text-secondary)] mt-0.5 flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm ${isCompleted ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                          {isPT ? item.label_pt : item.label}
                        </span>
                        {!isCompleted && getPriorityBadge(item.priority)}
                      </div>
                      {item.description && (
                        <p className="text-xs text-[var(--text-secondary)]">
                          {isPT ? item.description_pt : item.description}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
