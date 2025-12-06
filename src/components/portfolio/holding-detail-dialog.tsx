"use client"
import React from 'react'
import Sheet from '../ui/sheet'
import Button from '../ui/button'
import { formatCurrency, formatNumber, formatDate } from '../../lib/utils'
import { useRouter } from 'next/navigation'
import { useToast } from '../ui/toast-provider'
import { parseLocalizedNumber } from '../../lib/utils'
import { useTranslations } from '../../lib/i18n'

type Holding = {
  id: string
  ticker: string
  name: string
  quantity: number
  avg_cost_basis: number
  current_price: number
  value: number
  cost: number
  unrealized: number
  percent: number
}

type Transaction = {
  id: string
  type: 'buy' | 'sell' | 'dividend'
  quantity: number
  price_per_share: number
  fees: number
  date: string
  total: number
}

type Props = {
  open: boolean
  onClose: () => void
  holding: Holding
}

export default function HoldingDetailDialog({ open, onClose, holding }: Props) {
  const t = useTranslations()
  const router = useRouter()
  const toast = useToast()
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [loading, setLoading] = React.useState(false)
  const [showSellForm, setShowSellForm] = React.useState(false)
  const [sellQuantity, setSellQuantity] = React.useState('')
  const [sellPrice, setSellPrice] = React.useState('')
  const [sellFees, setSellFees] = React.useState('')
  const [sellDate, setSellDate] = React.useState(new Date().toISOString().slice(0, 10))
  const [submitting, setSubmitting] = React.useState(false)
  const [accounts, setAccounts] = React.useState<{ id: string; name: string }[]>([])
  const [selectedAccount, setSelectedAccount] = React.useState('')

  // Fetch transaction history for this ticker
  React.useEffect(() => {
    if (!open || !holding.ticker) return
    setLoading(true)
    fetch(`/api/investments/history?ticker=${encodeURIComponent(holding.ticker)}`)
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          setTransactions(j.data || [])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [open, holding.ticker])

  // Fetch broker accounts
  React.useEffect(() => {
    if (!open) return
    fetch('/api/accounts/brokers')
      .then(r => r.json())
      .then(j => {
        const accts = j.data || []
        setAccounts(accts)
        if (accts.length === 1) setSelectedAccount(accts[0].id)
      })
      .catch(() => setAccounts([]))
  }, [open])

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setShowSellForm(false)
      setSellQuantity('')
      setSellPrice(holding.current_price?.toString() || '')
      setSellFees('')
      setSellDate(new Date().toISOString().slice(0, 10))
    }
  }, [open, holding.current_price])

  const handleSell = async () => {
    const qty = parseLocalizedNumber(sellQuantity)
    const price = parseLocalizedNumber(sellPrice)
    const fees = parseLocalizedNumber(sellFees) || 0
    
    if (!selectedAccount) {
      toast('error', t.portfolio.selectAccount)
      return
    }
    if (qty <= 0 || qty > holding.quantity) {
      toast('error', `${t.portfolio.invalidQuantity}. ${t.portfolio.shares}: ${holding.quantity}`)
      return
    }
    if (price <= 0) {
      toast('error', t.portfolio.invalidPrice)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/investments/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedAccount,
          ticker: holding.ticker,
          type: 'sell',
          quantity: qty,
          pricePerShare: price,
          fees,
          date: sellDate
        })
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to sell')
      toast('success', `${t.portfolio.soldSuccess} ${qty} ${t.portfolio.shares.toLowerCase()} ${holding.ticker}`)
      onClose()
      router.refresh()
    } catch (err) {
      toast('error', err instanceof Error ? err.message : t.portfolio.sellFailed)
    } finally {
      setSubmitting(false)
    }
  }

  const plPercent = holding.cost > 0 ? ((holding.value - holding.cost) / holding.cost) * 100 : 0
  const inputClass = "w-full p-2.5 border border-[var(--border)] rounded-lg bg-surface text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"

  return (
    <Sheet open={open} onClose={onClose} title={`${t.portfolio.detailsOf} ${holding.ticker}`}>
      <div className="space-y-5">
        {/* Holding Summary */}
        <div className="p-4 bg-[var(--bg-subtle)] rounded-xl">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{holding.ticker}</h3>
              {holding.name !== holding.ticker && (
                <p className="text-sm text-[var(--text-secondary)]">{holding.name}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-[var(--text-primary)]">{formatCurrency(holding.value)}</div>
              <div className={`text-sm font-medium ${holding.unrealized >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {holding.unrealized >= 0 ? '+' : ''}{formatCurrency(holding.unrealized)} ({plPercent >= 0 ? '+' : ''}{plPercent.toFixed(1)}%)
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-[var(--text-muted)]">{t.portfolio.shares}</span>
              <div className="font-medium text-[var(--text-primary)]">{formatNumber(holding.quantity, 2)}</div>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">{t.portfolio.avgCost}</span>
              <div className="font-medium text-[var(--text-primary)]">{formatCurrency(holding.avg_cost_basis)}</div>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">{t.portfolio.current}</span>
              <div className="font-medium text-[var(--text-primary)]">{formatCurrency(holding.current_price)}</div>
            </div>
          </div>
        </div>

        {/* Sell Form */}
        {showSellForm ? (
          <div className="p-4 border border-[var(--border)] rounded-xl space-y-3">
            <h4 className="font-semibold text-[var(--text-primary)]">{t.portfolio.sell} {holding.ticker}</h4>
            
            {accounts.length > 1 && (
              <div>
                <label htmlFor="sell-account" className="text-xs text-[var(--text-muted)]">{t.portfolio.account}</label>
                <select 
                  id="sell-account"
                  value={selectedAccount} 
                  onChange={e => setSelectedAccount(e.target.value)}
                  className={inputClass}
                  aria-label={t.portfolio.selectAccount}
                >
                  <option value="">{t.portfolio.selectAccount}</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sell-quantity" className="text-xs text-[var(--text-muted)]">{t.portfolio.quantity} (max: {formatNumber(holding.quantity, 2)})</label>
                <input 
                  id="sell-quantity"
                  type="text" 
                  inputMode="decimal"
                  value={sellQuantity}
                  onChange={e => setSellQuantity(e.target.value)}
                  placeholder="0"
                  className={inputClass}
                  aria-label={t.portfolio.quantity}
                />
              </div>
              <div>
                <label htmlFor="sell-price" className="text-xs text-[var(--text-muted)]">{t.portfolio.pricePerShare}</label>
                <input 
                  id="sell-price"
                  type="text"
                  inputMode="decimal"
                  value={sellPrice}
                  onChange={e => setSellPrice(e.target.value)}
                  placeholder="0.00"
                  className={inputClass}
                  aria-label={t.portfolio.pricePerShare}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sell-fees" className="text-xs text-[var(--text-muted)]">{t.portfolio.fees}</label>
                <input 
                  id="sell-fees"
                  type="text"
                  inputMode="decimal"
                  value={sellFees}
                  onChange={e => setSellFees(e.target.value)}
                  placeholder="0"
                  className={inputClass}
                  aria-label={t.portfolio.fees}
                />
              </div>
              <div>
                <label htmlFor="sell-date" className="text-xs text-[var(--text-muted)]">{t.transactions.date}</label>
                <input 
                  id="sell-date"
                  type="date"
                  value={sellDate}
                  onChange={e => setSellDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            
            {parseLocalizedNumber(sellQuantity) > 0 && parseLocalizedNumber(sellPrice) > 0 && (
              <div className="p-2 bg-[var(--bg-subtle)] rounded-lg text-sm">
                <span className="text-[var(--text-muted)]">{t.portfolio.saleTotal}: </span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {formatCurrency(parseLocalizedNumber(sellQuantity) * parseLocalizedNumber(sellPrice) - (parseLocalizedNumber(sellFees) || 0))}
                </span>
              </div>
            )}
            
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowSellForm(false)} className="flex-1">{t.common.cancel}</Button>
              <Button variant="primary" onClick={handleSell} disabled={submitting} className="flex-1">
                {submitting ? t.portfolio.selling : t.portfolio.confirmSell}
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="primary" onClick={() => setShowSellForm(true)} className="w-full">
            {t.portfolio.sellShares}
          </Button>
        )}

        {/* Transaction History */}
        <div>
          <h4 className="font-semibold text-[var(--text-primary)] mb-3">{t.portfolio.transactionHistory}</h4>
          {loading ? (
            <div className="text-sm text-[var(--text-muted)]">{t.portfolio.loadingHistory}</div>
          ) : transactions.length === 0 ? (
            <div className="text-sm text-[var(--text-muted)] p-4 text-center border border-dashed border-[var(--border)] rounded-xl">
              {t.portfolio.noTransactions}
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transactions.map(tx => (
                <div 
                  key={tx.id} 
                  className="flex justify-between items-center p-3 border border-[var(--border)] rounded-lg hover:bg-[var(--bg-subtle)] transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        tx.type === 'buy' ? 'bg-emerald-100 text-emerald-700' :
                        tx.type === 'sell' ? 'bg-rose-100 text-rose-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {tx.type.toUpperCase()}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">{formatDate(tx.date)}</span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                      {formatNumber(tx.quantity, 2)} @ {formatCurrency(tx.price_per_share)}
                      {tx.fees > 0 && ` (fees: ${formatCurrency(tx.fees)})`}
                    </div>
                  </div>
                  <div className={`font-medium ${tx.type === 'sell' ? 'text-[var(--success)]' : 'text-[var(--text-primary)]'}`}>
                    {tx.type === 'sell' ? '+' : '-'}{formatCurrency(tx.quantity * tx.price_per_share)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Sheet>
  )
}
