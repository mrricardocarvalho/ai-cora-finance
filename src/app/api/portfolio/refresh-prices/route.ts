import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import YahooFinance from 'yahoo-finance2'

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's holdings to find which tickers need updating
    const { data: holdings, error: holdingsError } = await supabase
      .from('holdings')
      .select('ticker')
      .eq('user_id', user.id)
    
    if (holdingsError) {
      return NextResponse.json({ success: false, error: holdingsError.message }, { status: 500 })
    }

    const tickers = [...new Set((holdings || []).map(h => h.ticker).filter(Boolean))]
    
    if (tickers.length === 0) {
      return NextResponse.json({ success: true, updated: 0 })
    }

    const results: { ticker: string; price: number | null; error?: string }[] = []

    // Update prices for each ticker
    for (const ticker of tickers) {
      try {
        const quote = await yahooFinance.quote(ticker)
        type YahooQuote = { 
          regularMarketPrice?: number
          regularMarketPreviousClose?: number
          shortName?: string
          longName?: string
        }
        const q = quote as YahooQuote
        const price = q?.regularMarketPrice ?? q?.regularMarketPreviousClose ?? null
        const previousClose = q?.regularMarketPreviousClose ?? null
        const name = q?.shortName || q?.longName || ticker
        
        if (price != null) {
          // Update or insert asset with price, previous close, and name
          const { error: updateError } = await supabase
            .from('assets')
            .upsert({ 
              ticker, 
              current_price: price,
              previous_close: previousClose,
              name: name,
              last_updated: new Date().toISOString(),
              type: 'stock'
            }, { onConflict: 'ticker' })
          
          if (updateError) {
            console.error(`[RefreshPrices] Update error for ${ticker}:`, updateError)
            results.push({ ticker, price: null, error: updateError.message })
          } else {
            results.push({ ticker, price })
          }
        } else {
          results.push({ ticker, price: null, error: 'No price available' })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`[RefreshPrices] Error for ${ticker}:`, message)
        results.push({ ticker, price: null, error: message })
      }
      
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200))
    }

    const updated = results.filter(r => r.price !== null).length
    const failed = results.filter(r => r.price === null)

    return NextResponse.json({ 
      success: true, 
      updated,
      failed: failed.length > 0 ? failed : undefined,
      results 
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('refresh-prices error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
