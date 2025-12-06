export type EmergencyTargets = { target: number; targets: { m3: number; m6: number; m12: number }; runway: number }

export function computeEmergencyTargetsAndRunway(liquidCash: number, avgExpense: number, months = 3): EmergencyTargets{
  const safeAvg = Number(avgExpense || 0)
  const safeLiquid = Number(liquidCash || 0)
  const target = Math.round((safeAvg * months) * 100) / 100
  const targets = {
    m3: Math.round((safeAvg * 3) * 100) / 100,
    m6: Math.round((safeAvg * 6) * 100) / 100,
    m12: Math.round((safeAvg * 12) * 100) / 100,
  }
  const runway = safeAvg > 0 ? Math.round((safeLiquid / safeAvg) * 10) / 10 : 0
  return { target, targets, runway }
}
