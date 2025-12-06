import { calculateFIFOGainsForTicker, calculateFIFOGainsForPortfolio } from './tax'

describe('FIFO tax calculations', ()=>{
  it('calculates realized and unrealized correctly for example', ()=>{
    const txs = [
      { id: '1', ticker: 'FOO', type: 'buy', quantity: 10, price_per_share: 100, fees: 0, date: '2023-01-01' },
      { id: '2', ticker: 'FOO', type: 'buy', quantity: 10, price_per_share: 200, fees: 0, date: '2023-02-01' },
      { id: '3', ticker: 'FOO', type: 'sell', quantity: 10, price_per_share: 300, fees: 0, date: '2023-03-01' }
    ] as any
    const res = calculateFIFOGainsForTicker(txs, 300)
    // Realized gain: sell 10 from first buy: (300-100)*10 = 2000
    // Unrealized gain: remaining 10 from second buy sold at 300: (300-200)*10 = 1000
    // total gain = 3000, tax = (2000+1000)*0.28 = 840.00
    expect(res.realizedGain).toBeCloseTo(2000)
    expect(res.unrealizedGain).toBeCloseTo(1000)
    expect(res.gain).toBeCloseTo(3000)
    expect(res.tax).toBeCloseTo(840)
  })

  it('applies buy fees and sell fees in realized gain', ()=>{
    const txs = [
      { id: '1', ticker: 'FEE', type: 'buy', quantity: 10, price_per_share: 100, fees: 10, date: '2023-01-01' },
      { id: '2', ticker: 'FEE', type: 'sell', quantity: 5, price_per_share: 150, fees: 2, date: '2023-02-01' }
    ] as any
    const res = calculateFIFOGainsForTicker(txs, 150)
    // buy fees allocated to matched = 10*(5/10)=5; sell fees allocated to matched portion = 2
    // realized gain = (150*5) - (100*5) - 5 - 2 = 750 - 500 - 7 = 243
    expect(res.realizedGain).toBeCloseTo(243)
    expect(res.tax).toBeCloseTo(Math.round(243*0.28*100)/100)
  })

  it('ignores negative gains for tax calc', ()=>{
    const txs = [
      { id: '1', ticker: 'NEG', type: 'buy', quantity: 10, price_per_share: 100, fees: 0, date: '2023-01-01' }
    ] as any
    const res = calculateFIFOGainsForTicker(txs, 50)
    // unrealized is negative (-500) but tax should be 0
    expect(res.unrealizedGain).toBeCloseTo(-500)
    expect(res.tax).toBeCloseTo(0)
  })

  it('handles sells exceeding buys gracefully (no negative inventory)', ()=>{
    const txs = [
      { id: '1', ticker: 'S1', type: 'buy', quantity: 5, price_per_share: 100, fees: 0, date: '2023-01-01' },
      { id: '2', ticker: 'S1', type: 'sell', quantity: 10, price_per_share: 150, fees: 0, date: '2023-02-01' }
    ] as any
    const res = calculateFIFOGainsForTicker(txs, 150)
    // Sell exceeds buys — realized gains should be matched for 5 units and remaining sells beyond buys ignored
    // Realized: (150-100)*5 = 250
    expect(res.realizedGain).toBeCloseTo(250)
    // No remaining inventory -> unrealized 0
    expect(res.unrealizedGain).toBeCloseTo(0)
  })

  it('calculates portfolio-level exposure with multiple tickers', ()=>{
    const txsFoo = [
      { id: '1', ticker: 'FOO', type: 'buy', quantity: 10, price_per_share: 100, fees: 0, date: '2023-01-01' },
      { id: '2', ticker: 'FOO', type: 'buy', quantity: 10, price_per_share: 200, fees: 0, date: '2023-02-01' },
      { id: '3', ticker: 'FOO', type: 'sell', quantity: 10, price_per_share: 300, fees: 0, date: '2023-03-01' }
    ] as any
    const txsBar = [
      { id: '4', ticker: 'BAR', type: 'buy', quantity: 5, price_per_share: 50, fees: 0, date: '2023-01-01' }
    ] as any
    const grouped: Record<string, any[]> = { FOO: txsFoo, BAR: txsBar }
    const prices = { FOO: 300, BAR: 60 }
    const res = calculateFIFOGainsForPortfolio(grouped as any, prices as any)
    expect(res.byTicker.FOO.gain).toBeCloseTo(3000)
    expect(res.byTicker.BAR.gain).toBeCloseTo(50)
    expect(res.totalTax).toBeCloseTo((3000+50)*0.28)
  })
})
