"use client"
import React from 'react'
import Sheet from '../ui/sheet'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { investmentSchema, InvestmentFormData } from '../../lib/validations/investment'
import TickerSearch from './ticker-search'
import { useToast } from '../ui/toast-provider'
import { parseLocalizedNumber, formatCurrency } from '../../lib/utils'
import FormatPreview from '../ui/format-preview'
import Button from '../ui/button'
import { useRouter } from 'next/navigation'
import { mutate } from 'swr'
import { useTranslations } from '../../lib/i18n'

export default function AddInvestmentDialog({ open, onClose }:{ open: boolean; onClose: ()=>void }){
  const t = useTranslations()
  const toast = useToast()
  const router = useRouter()
  const form = useForm<InvestmentFormData>({ mode: 'onChange', resolver: zodResolver(investmentSchema), defaultValues: { accountId: '', ticker: '', type: 'buy', quantity: 0, pricePerShare: 0, fees: 0, date: new Date().toISOString().slice(0,10) } })

  const [accounts, setAccounts] = React.useState<{ id: string; name: string }[]>([])
  
  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      form.reset({
        accountId: '',
        ticker: '',
        type: 'buy',
        quantity: 0,
        pricePerShare: 0,
        fees: 0,
        date: new Date().toISOString().slice(0, 10)
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  React.useEffect(()=>{
    fetch('/api/accounts/brokers').then(r=>r.json()).then(j=> setAccounts(j.data || [])).catch(()=>setAccounts([]))
  }, [])

  const [insufficient, setInsufficient] = React.useState<string | null>(null)

  const watchedTicker = form.watch('ticker')
  const watchedAccount = form.watch('accountId')
  const watchedType = form.watch('type')
  const watchedQuantity = form.watch('quantity')

  React.useEffect(()=>{
    const ticker = watchedTicker
    const acct = watchedAccount
    const type = watchedType
    const q = Number(watchedQuantity || 0)
    if(type === 'sell' && acct && ticker && q > 0){
      fetch(`/api/holdings/quantity?accountId=${encodeURIComponent(acct)}&ticker=${encodeURIComponent(ticker)}`).then(r=>r.json()).then(j=>{
        const qty = j?.data?.quantity || 0
        if(q > qty) setInsufficient(`${t.portfolio.insufficientShares}: ${qty}`)
        else setInsufficient(null)
      }).catch(()=>setInsufficient(null))
    } else {
      setInsufficient(null)
    }
  }, [watchedTicker, watchedAccount, watchedType, watchedQuantity, t])

  async function onSubmit(values: InvestmentFormData){
    try{
      const res = await fetch('/api/investments/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
      const json = await res.json()
      if(!json.success) throw new Error(json.error || 'Failed')
      toast('success', t.portfolio.investmentAdded)
      onClose()
      try{ mutate('/api/transactions?pageSize=5'); mutate('/api/insights') }catch(e){}
      // refresh the current route to pick up new holdings
      router.refresh()
    }catch(err){
      const message = err instanceof Error ? err.message : String(err)
      toast('error', message)
    }
  }

  const inputClass = "w-full p-3 border border-[var(--border)] rounded-xl bg-surface text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
  const labelClass = "text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide"

  return (
    <Sheet open={open} onClose={onClose} title={t.portfolio.addInvestment}>
      <form onSubmit={form.handleSubmit((d)=> onSubmit(d))}>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={labelClass}>{t.portfolio.account}</label>
            <Controller name="accountId" control={form.control} render={({ field }) => (
              <select {...field} className={`${inputClass} mt-1.5`}>
                <option value="">{t.portfolio.selectInvestmentAccount}</option>
                {accounts.map(a => (<option key={a.id} value={a.id}>{a.name}</option>))}
              </select>
            )} />
          </div>

          <div>
            <label className={labelClass}>{t.portfolio.ticker}</label>
            <div className="mt-1.5">
              <Controller name="ticker" control={form.control} render={({ field }) => (
                <TickerSearch value={field.value} onSelect={(val)=>field.onChange(val)} />
              )} />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t.transactions.type}</label>
            <Controller name="type" control={form.control} render={({ field }) => (
              <select {...field} className={`${inputClass} mt-1.5`}>
                <option value="buy">{t.portfolio.buy}</option>
                <option value="sell">{t.portfolio.sell}</option>
                <option value="dividend">{t.portfolio.dividend}</option>
              </select>
            )} />
          </div>

          <div>
            <label className={labelClass}>{t.portfolio.quantity}</label>
            <input type="text" inputMode="decimal" {...form.register('quantity', { setValueAs: (v) => parseLocalizedNumber(v) })} className={`${inputClass} mt-1.5`} />
            <FormatPreview value={form.watch('quantity')} />
            {insufficient ? <div className="text-[var(--danger)] text-sm mt-1">{insufficient}</div> : null}
          </div>

          <div>
            <label className={labelClass}>{t.portfolio.pricePerShare}</label>
            <input type="text" inputMode="decimal" {...form.register('pricePerShare', { setValueAs: (v) => parseLocalizedNumber(v) })} className={`${inputClass} mt-1.5`} />
            <FormatPreview value={form.watch('pricePerShare')} />
          </div>

          <div>
            <label className={labelClass}>{t.portfolio.fees}</label>
            <input type="text" inputMode="decimal" {...form.register('fees', { setValueAs: (v) => parseLocalizedNumber(v) })} className={`${inputClass} mt-1.5`} />
            <div className="text-sm text-[var(--text-secondary)] mt-2 p-3 bg-[var(--bg-subtle)] rounded-xl">
              {t.portfolio.total}: <span className="font-semibold text-[var(--text-primary)]">{formatCurrency(Number(form.watch('pricePerShare') || 0) * Number(form.watch('quantity') || 0))}</span>
            </div>
          </div>

          <div>
            <label className={labelClass}>{t.transactions.date}</label>
            <input type="date" {...form.register('date')} className={`${inputClass} mt-1.5`} />
          </div>
          
          <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button variant="ghost" onClick={onClose}>{t.common.cancel}</Button>
            <Button type="submit" disabled={Boolean(insufficient) || !form.formState.isValid}>{t.common.add}</Button>
          </div>
        </div>
      </form>
    </Sheet>
  )
}
