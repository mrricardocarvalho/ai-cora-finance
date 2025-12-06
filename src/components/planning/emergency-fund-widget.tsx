"use client"
import React from 'react'
import { Shield } from 'lucide-react'
import { formatCurrency, formatNumber } from '../../lib/utils'
import { computeEmergencyTargetsAndRunway } from '../../lib/planning/emergency-utils'
import { parseLocalizedNumber } from '../../lib/utils'
import FormatPreview from '../ui/format-preview'
import { useTranslations } from '../../lib/i18n'

type EmergencyResult = { avgExpense: number; target: number; liquidCash: number; months: number; runway: number; targets?: { m3: number; m6: number; m12: number } }

export default function EmergencyFundWidget({ initial }: { initial?: EmergencyResult }){
  const t = useTranslations()
  const [months, setMonths] = React.useState<number>(initial?.months || 3)
  const [data, setData] = React.useState<EmergencyResult | undefined>(initial)
  const [estimateInput, setEstimateInput] = React.useState<string | undefined>(undefined)
  const [loading, setLoading] = React.useState(false)

  const fetchFor = React.useCallback(async (m:number)=>{
    setLoading(true)
    try{
      const res = await fetch('/api/planning/calculate-emergency', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ months: m }) })
      const json = await res.json()
      if(json?.success) setData(json.data)
    }catch(e){ console.error(e) }
    finally{ setLoading(false) }
  }, [])

  React.useEffect(()=>{ if(!initial) fetchFor(months) }, [initial, months, fetchFor])

  const current = data?.liquidCash ?? 0
  const target = data?.target ?? 0
  const targets = data?.targets
  const target12 = targets?.m12 ?? target
  const percent = target === 0 ? 0 : Math.min(100, Math.round((current / target) * 100))
  const pctRounded = Math.round(percent / 5) * 5
  const fillPct12 = target12 > 0 ? Math.min(100, Math.round((current / target12) * 100)) : 0
  const fillPct12Rounded = Math.round(fillPct12 / 5) * 5
  const pctClassMap: Record<number, string> = {0:'w-0',5:'w-[5%]',10:'w-[10%]',15:'w-[15%]',20:'w-[20%]',25:'w-[25%]',30:'w-[30%]',35:'w-[35%]',40:'w-[40%]',45:'w-[45%]',50:'w-[50%]',55:'w-[55%]',60:'w-[60%]',65:'w-[65%]',70:'w-[70%]',75:'w-[75%]',80:'w-[80%]',85:'w-[85%]',90:'w-[90%]',95:'w-[95%]',100:'w-[100%]'}
  const leftClassMap: Record<number, string> = {0:'left-0',5:'left-[5%]',10:'left-[10%]',15:'left-[15%]',20:'left-[20%]',25:'left-[25%]',30:'left-[30%]',35:'left-[35%]',40:'left-[40%]',45:'left-[45%]',50:'left-[50%]',55:'left-[55%]',60:'left-[60%]',65:'left-[65%]',70:'left-[70%]',75:'left-[75%]',80:'left-[80%]',85:'left-[85%]',90:'left-[90%]',95:'left-[95%]',100:'left-[100%]'}
  const runway = data?.runway ?? 0
  const runwayDisplay = runway === 0 ? t.planning.calculating : `${formatNumber(Number(runway), 1)}`
  const statusClass = runway < 3 ? 'text-danger' : (runway < 6 ? 'text-warning' : 'text-success')

  return (
    <div className="p-4 sm:p-5 border border-[var(--border)] rounded-xl bg-surface shadow-card h-full">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-[var(--bg-subtle)]"><Shield className={`w-6 h-6 ${statusClass}`} /></div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-[var(--text-secondary)]">{t.planning.emergencyFund} ({t.planning.runway})</div>
          <div className="text-lg font-semibold text-[var(--text-primary)]">{t.planning.basedOnAvgSpend} {formatCurrency(data?.avgExpense ?? 0)}/mo</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-sm text-[var(--text-secondary)]">{t.planning.currentAmount}</div>
          <div className="text-lg font-semibold text-[var(--text-primary)]">{formatCurrency(current)}</div>
        </div>
      </div>
      <div className="mt-3 w-full bg-[var(--bg-subtle)] rounded-lg h-2 overflow-hidden relative">
        <div className={`${fillPct12Rounded ? pctClassMap[fillPct12Rounded] || 'w-0' : 'w-0'} h-2 bg-[var(--primary)]`} />
        {/* ticks for 3/6/12 targets */}
        {targets && (
          <>
            <div className={`absolute top-0 h-2 w-px bg-[var(--border)] ${leftClassMap[Math.round((targets.m3 / target12) * 20) * 5] || 'left-0'}`} aria-hidden="true" />
            <div className={`absolute top-0 h-2 w-px bg-[var(--border)] ${leftClassMap[Math.round((targets.m6 / target12) * 20) * 5] || 'left-0'}`} aria-hidden="true" />
            <div className={`absolute top-0 h-2 w-px bg-[var(--border)] ${leftClassMap[100] || 'left-[100%]'}`} aria-hidden="true" />
          </>
        )}
      </div>
      <div className="mt-2 text-sm text-[var(--text-secondary)]">{t.planning.target}: {formatCurrency(target)} · {t.planning.runway}: <span className={`${statusClass} font-semibold`}>{runwayDisplay} {runway === 0 ? '' : t.planning.months}</span></div>
      {targets ? (
        <div className="mt-2 text-xs text-[var(--text-muted)]">3mo: {formatCurrency(targets.m3)} · 6mo: {formatCurrency(targets.m6)} · 12mo: {formatCurrency(targets.m12)}</div>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {[3,6,12].map(m => (
          <button key={m} className={`btn ${months === m ? 'btn-primary' : 'btn-ghost'}`} onClick={()=>{ setMonths(m); fetchFor(m) }}>{m} {t.planning.months}</button>
        ))}
        {/* Manual estimate for cold start */}
        {(!data?.avgExpense || data.avgExpense === 0) && (
          <div className="ml-2">
            <label htmlFor="estimate" className="text-xs text-[var(--text-muted)]">{t.planning.estimateMonthlySpend}</label>
            <input id="estimate" type="text" inputMode="decimal" className="input w-32 ml-2" placeholder="€0" value={estimateInput ?? ''} onChange={(e)=>{
              const valueStr = e.target.value
              setEstimateInput(valueStr)
              const v = parseLocalizedNumber(valueStr || '0')
              const computed = computeEmergencyTargetsAndRunway(current, v, months)
              setData({ avgExpense: v, target: computed.target, targets: computed.targets, liquidCash: current, months: months, runway: computed.runway })
            }} />
            <FormatPreview value={estimateInput || ''} />
          </div>
        )}
        <div className="ml-auto text-sm text-[var(--text-muted)]">{loading ? t.planning.calculating : ''}</div>
      </div>
    </div>
  )
}
