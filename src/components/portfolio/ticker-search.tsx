"use client"
import React from 'react'

interface MarketResult {
  symbol: string
  shortName?: string
  longName?: string
  regularMarketPrice?: number
  currency?: string
}

interface Suggestion {
  symbol: string
  name?: string
  exchange?: string
}

export default function TickerSearch({ value, onSelect }:{ value?: string; onSelect: (ticker: string)=>void }){
  const [query, setQuery] = React.useState(value || '')
  const [results, setResults] = React.useState<{ ticker: string; name: string }[]>([])
  const [marketResult, setMarketResult] = React.useState<MarketResult | null>(null)
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(()=>{
    const t = setTimeout(()=>{
      if(!query) { setResults([]); setMarketResult(null); return }
      setLoading(true)
      setError(null)
      fetch(`/api/assets/search?q=${encodeURIComponent(query)}`).then(r=>r.json()).then(j=>{
        setResults(j.data || [])
        setLoading(false)
      }).catch((e)=>{ 
        console.error('[TickerSearch] Local search error:', e)
        setResults([])
        setLoading(false) 
      })
    }, 300)
    return ()=> clearTimeout(t)
  }, [query])

  async function searchMarket(ticker: string){
    if(!ticker) return
    setLoading(true)
    setError(null)
    setMarketResult(null)
    setSuggestions([])
    try{
      const res = await fetch(`/api/market/quote?ticker=${encodeURIComponent(ticker)}`)
      const json = await res.json()
      
      if(json.success && json.data){
        const data = json.data
        // Show the found asset to the user
        setMarketResult({
          symbol: data.symbol,
          shortName: data.shortName,
          longName: data.longName,
          regularMarketPrice: data.regularMarketPrice,
          currency: data.currency
        })
      } else if (json.suggestions && json.suggestions.length > 0) {
        // Show suggestions for user to pick
        setSuggestions(json.suggestions)
      } else {
        setError(json.error || 'Asset not found on market')
      }
    }catch(e){ 
      console.error('[TickerSearch] Error:', e)
      setError('Failed to search market')
    }
    setLoading(false)
  }

  function selectMarketResult(symbol: string){
    onSelect(symbol)
    setQuery(symbol)
    setMarketResult(null)
    setSuggestions([])
    setResults([])
  }

  async function selectSuggestion(symbol: string){
    // Fetch the full quote for this suggestion
    setLoading(true)
    setSuggestions([])
    try {
      const res = await fetch(`/api/market/quote?ticker=${encodeURIComponent(symbol)}`)
      const json = await res.json()
      if(json.success && json.data){
        setMarketResult({
          symbol: json.data.symbol,
          shortName: json.data.shortName,
          longName: json.data.longName,
          regularMarketPrice: json.data.regularMarketPrice,
          currency: json.data.currency
        })
      } else {
        // Even if no full data, let user select it
        selectMarketResult(symbol)
      }
    } catch {
      selectMarketResult(symbol)
    }
    setLoading(false)
  }

  return (
    <div className="relative">
      <input 
        value={query} 
        onChange={e=>setQuery(e.target.value)} 
        placeholder="Ticker or Name" 
        className="w-full p-3 border border-[var(--border)] rounded-xl bg-surface text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all" 
      />
      {loading ? <div className="text-xs text-[var(--text-muted)] mt-2">Searching...</div> : null}
      
      {/* Local database results */}
      {results.length > 0 && (
        <div className="absolute z-20 left-0 right-0 bg-surface border border-[var(--border)] rounded-xl mt-2 max-h-40 overflow-auto shadow-lg">
          {results.map(r=> (
            <div key={r.ticker} className="p-3 hover:bg-[var(--bg-subtle)] cursor-pointer transition-colors first:rounded-t-xl last:rounded-b-xl" onClick={()=>{ onSelect(r.ticker); setQuery(r.ticker); setResults([]) }}>
              <div className="font-semibold text-[var(--text-primary)]">{r.ticker}</div>
              <div className="text-xs text-[var(--text-secondary)]">{r.name}</div>
            </div>
          ))}
        </div>
      )}
      
      {/* Market search result - show in a box for user to confirm */}
      {marketResult && (
        <div className="mt-3 p-4 border border-[var(--success)]/30 bg-[var(--success-light)] rounded-xl">
          <div className="text-sm font-semibold text-[var(--success)] mb-2">Found on Market:</div>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold text-[var(--text-primary)]">{marketResult.symbol}</div>
              <div className="text-xs text-[var(--text-secondary)]">{marketResult.longName || marketResult.shortName}</div>
            </div>
            {marketResult.regularMarketPrice && (
              <div className="text-right">
                <div className="font-semibold text-[var(--text-primary)]">{marketResult.regularMarketPrice.toFixed(2)}</div>
                <div className="text-xs text-[var(--text-muted)]">{marketResult.currency}</div>
              </div>
            )}
          </div>
          <button 
            type="button" 
            className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-[var(--success)] to-emerald-600 text-white rounded-xl text-sm font-medium hover:shadow-md transition-all"
            onClick={()=> selectMarketResult(marketResult.symbol)}
          >
            Use {marketResult.symbol}
          </button>
        </div>
      )}
      
      {/* Suggestions from Yahoo search */}
      {suggestions.length > 0 && (
        <div className="mt-3 p-4 border border-[var(--info)]/30 bg-[var(--info-light)] rounded-xl">
          <div className="text-sm font-semibold text-[var(--info)] mb-3">Did you mean:</div>
          <div className="space-y-1">
            {suggestions.map(s => (
              <button
                key={s.symbol}
                type="button"
                className="w-full text-left p-3 hover:bg-[var(--primary)]/10 rounded-xl flex justify-between items-center transition-colors"
                onClick={() => selectSuggestion(s.symbol)}
              >
                <div>
                  <div className="font-semibold text-sm text-[var(--text-primary)]">{s.symbol}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{s.name}</div>
                </div>
                <div className="text-xs text-[var(--text-muted)]">{s.exchange}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mt-2 text-xs text-[var(--danger)] p-2 bg-[var(--danger-light)] rounded-lg">{error}</div>
      )}
      
      {/* Search market prompt - only show when no local results and no market result */}
      {results.length === 0 && !marketResult && query && !loading && (
        <div className="mt-3 text-sm text-[var(--text-secondary)] flex items-center gap-2">
          <span>No assets found locally.</span>
          <button type="button" className="text-[var(--primary)] font-medium hover:underline" onClick={()=>searchMarket(query)}>Search Market</button>
        </div>
      )}
    </div>
  )
}
