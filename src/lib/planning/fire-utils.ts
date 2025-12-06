export type FIRESeriesItem = { year: number; date: string; netWorth: number }
export type FIREProjectionData = { currentNetWorth: number; fiNumber: number; annualSavings: number; yearsToFI: number | null; retirementDate: string | null; series: FIRESeriesItem[] }

export function computeFIREProjection(currentNetWorth: number, avgMonthlyExpense: number, annualSavings: number, growthRate = 0.07, withdrawalRate = 0.04, capYears = 50): FIREProjectionData{
  const fiNumber = withdrawalRate > 0 ? Math.round(((avgMonthlyExpense * 12) / withdrawalRate) * 100) / 100 : Math.round((avgMonthlyExpense * 12 * 25) * 100) / 100
  let currentNW = Number(currentNetWorth || 0)
  const series: FIRESeriesItem[] = []
  let yearsToFI: number | null = null
  let retirementDate: string | null = null
  const now = new Date()
  for(let year=0; year<=capYears; year++){
    series.push({ year, date: new Date(now.getFullYear() + year, now.getMonth(), now.getDate()).toISOString(), netWorth: Math.round(currentNW * 100) / 100 })
    if(fiNumber > 0 && currentNW >= fiNumber){ yearsToFI = year; retirementDate = series[year].date; break }
    const growth = currentNW * growthRate
    currentNW += growth
    currentNW += annualSavings
  }
  if(yearsToFI === null && fiNumber > 0){ yearsToFI = null; retirementDate = null }
  return { currentNetWorth: Math.round(currentNetWorth * 100) / 100, fiNumber, annualSavings: Math.round(annualSavings * 100) / 100, yearsToFI, retirementDate, series }
}
