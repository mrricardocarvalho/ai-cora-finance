"use client"
import React from 'react'
import FIREChart from './fire-chart'
import { formatCurrency, formatDate, formatNumber, parseLocalizedNumber } from '../../lib/utils'
import FormatPreview from '../ui/format-preview'
import { useTranslations } from '../../lib/i18n'

export default function FireSimulator({ initial }: { initial?: any }){
  const t = useTranslations()
  const [monthlySavings, setMonthlySavings] = React.useState(initial?.annualSavings ? Math.round((initial.annualSavings/12) * 100) / 100 : 0)
  const [savingsInput, setSavingsInput] = React.useState<string>('')
  const [withdrawalRate, setWithdrawalRate] = React.useState<number>(0.04)
  const [avgMonthlyExpenseEstimate, setAvgMonthlyExpenseEstimate] = React.useState<number|undefined>(undefined)
  const [projection, setProjection] = React.useState(initial)
  const [baselineYearsToFI, setBaselineYearsToFI] = React.useState<number|null>(initial?.yearsToFI ?? null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(()=>{ setProjection(initial) }, [initial])

  const fetchProjection = React.useCallback(async (ms:number)=>{
    setLoading(true)
    try{
      const payload: any = { monthlySavings: ms, withdrawalRate }
      if(typeof avgMonthlyExpenseEstimate === 'number') payload.avgMonthlyExpense = avgMonthlyExpenseEstimate
      const res = await fetch('/api/planning/calculate-fire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json()
      if(json?.success) setProjection(json.data)
    }catch(e){ console.error(e) }
    finally{ setLoading(false) }
  }, [withdrawalRate, avgMonthlyExpenseEstimate])

  React.useEffect(()=>{ const timer = setTimeout(()=> fetchProjection(monthlySavings), 300); return ()=> clearTimeout(timer) }, [monthlySavings, fetchProjection, withdrawalRate, avgMonthlyExpenseEstimate])

  const yearsToFI = projection?.yearsToFI ?? null
  const retirementDate = projection?.retirementDate ?? null
  const impact = baselineYearsToFI !== null && yearsToFI !== null ? baselineYearsToFI - yearsToFI : null
  const baselineMonthly = initial?.annualSavings ? Math.round((initial.annualSavings/12) * 100) / 100 : 0
  const currentInvestments = projection?.currentInvestments ?? 0

  React.useEffect(()=>{ if(initial){ setBaselineYearsToFI(initial.yearsToFI ?? null) } }, [initial])

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setMonthlySavings(value)
    setSavingsInput('')  // Clear input when using slider
  }
  
  // Handle direct input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valueStr = e.target.value
    setSavingsInput(valueStr)
    const parsed = parseLocalizedNumber(valueStr)
    if (!isNaN(parsed) && parsed >= 0) {
      setMonthlySavings(parsed)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
        <div>
          <div className="text-sm text-[var(--text-secondary)]">{t.planning.fireProjection}</div>
          <div className="text-lg font-semibold text-[var(--text-primary)]">{t.planning.currentNetWorth}: {formatCurrency(projection?.currentNetWorth || 0)}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-[var(--text-secondary)]">{t.planning.fiTarget}</div>
          <div className="text-lg font-semibold text-[var(--text-primary)]">{formatCurrency(projection?.fiNumber || 0)}</div>
        </div>
      </div>

      <div>
        <label htmlFor="fire-savings" className="text-sm text-[var(--text-secondary)]">{t.planning.monthlySavings}</label>
        <div className="flex items-center gap-3 mt-1">
          <input 
            id="fire-savings" 
            type="range" 
            min={0} 
            max={10000} 
            step={100} 
            value={monthlySavings} 
            onChange={handleSliderChange} 
            disabled={loading} 
            className="flex-1"
            aria-valuetext={`${formatCurrency(monthlySavings)} / month`} 
          />
          <div className="flex items-center gap-1">
            <input 
              type="text"
              inputMode="decimal"
              className="input w-28 text-right"
              placeholder="€0"
              value={savingsInput || (monthlySavings > 0 ? formatNumber(monthlySavings, 0) : '')}
              onChange={handleInputChange}
              onBlur={() => setSavingsInput('')}
            />
            <span className="text-sm text-[var(--text-muted)]">€/mo</span>
          </div>
        </div>
        <div className="text-xs text-[var(--text-muted)] mt-1">{t.planning.monthlySavings}: {formatCurrency(monthlySavings)}</div>
      </div>

      <div>
        <label className="text-sm text-[var(--text-secondary)]">{t.planning.withdrawalRate}</label>
        <div className="flex items-center gap-2 mt-1">
          {[0.035, 0.04, 0.045].map(r => (
            <button key={r} className={`btn ${withdrawalRate === r ? 'btn-primary' : 'btn-ghost'}`} onClick={()=> setWithdrawalRate(r)}>{formatNumber(r*100, 1)}%</button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="avg-expense" className="text-sm text-[var(--text-secondary)]">{t.planning.estimatedMonthlyExpense}</label>
        <input id="avg-expense" type="text" className="input w-48 mt-1" inputMode="decimal" placeholder="€0" value={avgMonthlyExpenseEstimate ?? ''} onChange={(e)=> setAvgMonthlyExpenseEstimate(e.target.value ? parseLocalizedNumber(e.target.value) : undefined)} />
        <FormatPreview value={avgMonthlyExpenseEstimate} />
      </div>

      <div>
        <FIREChart 
          series={projection?.series || []} 
          fiNumber={projection?.fiNumber || 0} 
          currentInvestments={currentInvestments}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 border border-[var(--border)] rounded-xl bg-[var(--bg-subtle)]">
          <div className="text-sm text-[var(--text-secondary)]">{t.planning.yearsToFI}</div>
          <div className="text-lg font-semibold text-[var(--text-primary)]">{yearsToFI ?? '—'}</div>
        </div>
        <div className="p-3 border border-[var(--border)] rounded-xl bg-[var(--bg-subtle)]">
          <div className="text-sm text-[var(--text-secondary)]">{t.planning.retirementDate}</div>
          <div className="text-lg font-semibold text-[var(--text-primary)]">{retirementDate ? formatDate(retirementDate) : '—'}</div>
        </div>
        <div className="p-3 border border-[var(--border)] rounded-xl bg-[var(--bg-subtle)]">
          <div className="text-sm text-[var(--text-secondary)]">{t.planning.annualSavings}</div>
          <div className="text-lg font-semibold text-[var(--text-primary)]">{formatCurrency((monthlySavings || 0) * 12)}</div>
        </div>
      </div>
      {impact !== null && impact !== 0 ? (
        <div className="p-3 border border-[var(--border)] rounded-xl bg-[var(--bg-subtle)]">
          <div className="text-sm text-[var(--text-secondary)]">{t.planning.impact}</div>
          <div className="text-lg font-semibold text-[var(--text-primary)]">{t.planning.savingExtra} {formatCurrency(Math.abs(monthlySavings - baselineMonthly))} {impact > 0 ? t.planning.bringsRetirement : t.planning.delaysRetirement} {Math.abs(impact)} {t.planning.years}.</div>
        </div>
      ) : null}
    </div>
  )
}
