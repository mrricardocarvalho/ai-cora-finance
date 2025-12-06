"use server"
import { calculateDebtStrategy } from '../planning/debt'
import { calculateEmergencyTarget, ensureEmergencyWarning } from '../planning/emergency'
import { calculateFIREProjection } from '../planning/fire'

export async function calculateDebtStrategyForUser(userId: string, extraMonthlyPayment = 0){
  // Validate user via supabase auth, but accept a passed userId
  if(!userId) return { success: false, error: 'userId required' }
  return await calculateDebtStrategy(userId, extraMonthlyPayment)
}

export async function calculateEmergencyTargetForUser(userId: string, months = 3){
  if(!userId) return { success: false, error: 'userId required' }
  const res = await calculateEmergencyTarget(userId, months)
  if(!res.success) return res
  // Optionally, create an insight if under 3 months
  try{ await ensureEmergencyWarning(userId, res.data?.avgExpense ?? 0, res.data?.liquidCash ?? 0) }catch(e){ console.warn('ensureEmergencyWarning failed', e) }
  return res
}

export async function calculateFIREProjectionForUser(userId: string, monthlySavings = undefined, growthRate = 0.07, withdrawalRate = 0.04){
  if(!userId) return { success: false, error: 'userId required' }
  return await calculateFIREProjection(userId, monthlySavings, growthRate, withdrawalRate)
}
