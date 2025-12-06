import { NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

// Initialize Yahoo Finance v3
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const ticker = params.get('ticker') || ''
  if(!ticker) return NextResponse.json({ success: false, error: 'ticker required' }, { status: 400 })
  try {
    // Try direct quote first
    try {
      const q = await yahooFinance.quote(ticker)
      
      if (q && q.symbol) {
        return NextResponse.json({ success: true, data: q })
      }
    } catch (quoteErr) {
      // Direct quote failed, fall through to search
    }
    
    // If direct quote fails, try search
    const searchResults = await yahooFinance.search(ticker)
    
    if (searchResults?.quotes?.length > 0) {
      // Return search results for user to pick
      return NextResponse.json({ 
        success: true, 
        data: null,
        suggestions: searchResults.quotes.slice(0, 10).map((q) => ({
          symbol: 'symbol' in q ? q.symbol : undefined,
          name: 'shortname' in q ? q.shortname : ('longname' in q ? q.longname : undefined),
          exchange: 'exchDisp' in q ? q.exchDisp : ('exchange' in q ? q.exchange : undefined)
        }))
      })
    }
    
    return NextResponse.json({ success: false, error: `Ticker "${ticker}" not found` }, { status: 404 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[MarketQuote] Error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
