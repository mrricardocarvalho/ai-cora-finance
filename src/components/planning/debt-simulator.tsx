"use client"
import React from 'react'
import { format } from 'date-fns'
import PayoffChart from './payoff-chart'
import { formatCurrency, formatMonthYear, celebrate, formatNumber } from '../../lib/utils'

type Strategy = 'avalanche' | 'snowball'

export default function DebtSimulator({ baseline, defaultStrategy, defaultAccounts }: { baseline: any; defaultStrategy: any; defaultAccounts: any[] }){
  const [extra, setExtra] = React.useState(0)
  const [strategy, setStrategy] = React.useState<Strategy>('avalanche')
  const [result, setResult] = React.useState(defaultStrategy)
  const prevMonthsRef = React.useRef<number | null>(result?.months ?? null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(()=>{ setResult(defaultStrategy) }, [defaultStrategy])

  const cacheRef = React.useRef(new Map<number, any>())
  const fetchSim = React.useCallback(async (extraAmt: number)=>{
    setLoading(true)
    try{
      setError(null)
      // use cached result when present
      if(cacheRef.current.has(extraAmt)){
        const cached = cacheRef.current.get(extraAmt)
        setResult(cached[strategy])
        setLoading(false)
        return
      }
      const res = await fetch('/api/planning/calculate-strategy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ extra: extraAmt }) })
      const json = await res.json()
      if(json?.success){ setResult(json.data[strategy]) }
      // cache the full response for reuse
      if(json?.success) cacheRef.current.set(extraAmt, json.data)
    }catch(e){ console.error(e); setError((e as any)?.message || 'Error calculating strategy') }
    finally{ setLoading(false) }
  }, [strategy])

  // debounce
  React.useEffect(()=>{ const t = setTimeout(()=>{ fetchSim(extra) }, 300); return ()=> clearTimeout(t) }, [fetchSim, extra])

  // Celebrate if payoff becomes immediate (months -> 0)
  React.useEffect(()=>{
    const prev = prevMonthsRef.current ?? null
    const current = result?.months ?? null
    if(prev !== null && current === 0 && prev > 0){ celebrate() }
    prevMonthsRef.current = current
  }, [result])

  const totalDebt = defaultAccounts.reduce((s, a)=> s + (a.balance || 0), 0)
  const avgInterest = totalDebt > 0 ? defaultAccounts.reduce((s, a)=> s + ((a.balance || 0) * (a.interest_rate || 0)), 0) / (totalDebt || 1) : 0
  const payoffDate = result?.payoffDate ? formatMonthYear(result.payoffDate) : 'N/A'

  const baselineMonths = baseline?.months || 0
  const baselineInterest = baseline?.totalInterestPaid || 0
  const impactMonths = baselineMonths - (result?.months || 0)
  const interestSaved = baselineInterest - (result?.totalInterestPaid || 0)

  return (
    <div className="p-4 space-y-4 bg-surface border border-[var(--border)] rounded-xl shadow-card">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm text-[var(--text-secondary)]">Total Debt</div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(totalDebt)}</div>
          <div className="text-sm text-[var(--text-muted)]">Avg Interest: {formatNumber(avgInterest, 2)}%</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-[var(--text-secondary)]">Projected Payoff</div>
          <div className="text-xl font-semibold text-[var(--text-primary)]">{payoffDate}</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <label htmlFor="extra-slider" className="text-sm text-[var(--text-secondary)]">Extra Monthly Payment</label>
          <input id="extra-slider" title="Extra monthly payment" aria-label="Extra monthly payment" aria-valuetext={`€${extra} per month`} type="range" min={0} max={1000} step={10} value={extra} onChange={e=>setExtra(Number(e.target.value))} disabled={loading} className="accent-[var(--primary)]" />
          <div className="w-20 text-right text-[var(--text-primary)]">€{extra}</div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={()=>setStrategy('avalanche')} disabled={loading} className={`btn ${strategy === 'avalanche' ? 'btn-primary' : 'btn-ghost'}`}>Avalanche <span className="ml-2 badge">Financially Optimal</span></button>
          <button onClick={()=>setStrategy('snowball')} disabled={loading} className={`btn ${strategy === 'snowball' ? 'btn-primary' : 'btn-ghost'}`}>Snowball <span className="ml-2 badge badge-warning">Psychological Win</span></button>
        </div>
      </div>

      <div>
        <PayoffChart baseline={baseline.graphData} strategy={result?.graphData || []} colorBaseline="#64748B" colorStrategy={strategy === 'avalanche' ? '#0D9488' : '#F59E0B'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 border border-[var(--border)] rounded-xl bg-[var(--bg-subtle)]">
          <div className="text-sm text-[var(--text-secondary)]">By paying an extra</div>
          <div className="text-lg font-semibold text-[var(--text-primary)]">{formatCurrency(extra)}/month</div>
        </div>
        <div className="p-3 border border-[var(--border)] rounded-xl bg-[var(--bg-subtle)]">
          <div className="text-sm text-[var(--text-secondary)]">You will be debt-free</div>
          <div className="text-lg font-semibold text-[var(--text-primary)]">{impactMonths > 0 ? `${impactMonths} months earlier` : 'No change'}</div>
        </div>
        <div className="p-3 border border-[var(--border)] rounded-xl bg-[var(--bg-subtle)]">
          <div className="text-sm text-[var(--text-secondary)]">Interest Saved</div>
          <div className="text-lg font-semibold text-[var(--success)]" aria-live="polite">{formatCurrency(Math.max(0, Number(interestSaved || 0)))}</div>
        </div>
      </div>
      {loading && (<div role="status" className="text-sm text-[var(--text-muted)]">Calculating…</div>)}
      {error && (<div role="alert" className="text-sm text-[var(--danger)]">{error}</div>)}
    </div>
  )
}
