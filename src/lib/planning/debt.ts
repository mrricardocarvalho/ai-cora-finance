import { addMonths } from 'date-fns'
import { createClient as createServerSupabase } from '../supabase/server'

export type DebtAccount = {
  id: string
  name?: string
  balance: number
  interest_rate: number // percent
  min_payment: number
}

export type StrategyResult = {
  payoffDate: string | null
  totalInterestPaid: number
  months: number
  graphData: { month: number; date: string; totalBalance: number; balances: { id: string; balance: number }[] }[]
}

function roundTwo(n: number){ return Math.round((n + Number.EPSILON) * 100) / 100 }

function simulateStrategy(initialDebts: DebtAccount[], extraMonthlyPayment = 0, strategy: 'avalanche'|'snowball') : StrategyResult {
  const maxMonths = 50 * 12 // 50 years max
  const debts = initialDebts.map(d => ({ ...d }))
  let totalInterest = 0
  let months = 0
  let dynamicExtra = extraMonthlyPayment
  const graphData: StrategyResult['graphData'] = []

  const epsilon = 0.000001
  while (debts.some(d => d.balance > epsilon) && months < maxMonths) {
    months++
    // track alive debts at start of month to detect newly paid debts
    const aliveAtStart = new Set(debts.filter(d => d.balance > epsilon).map(d => d.id))
    // charge monthly interest
    debts.forEach(d => {
      if (d.balance <= epsilon) return
      const interest = d.balance * (d.interest_rate / 100 / 12)
      d.balance += interest
      totalInterest += interest
    })

    // compute available cash = sum of min payments for alive debts + dynamicExtra (rolls in freed min payments for snowball)
    let available = debts.reduce((s,d) => s + (d.balance > epsilon ? Math.min(d.min_payment, d.balance) : 0), 0)
    available += dynamicExtra

    // pay minimums
    debts.forEach(d => {
      if (d.balance <= epsilon) return
      const pay = Math.min(d.min_payment, d.balance)
      d.balance -= pay
      available -= pay
    })

    // pay the extra according to strategy
    const alive = debts.filter(d => d.balance > epsilon)
    if (available > epsilon && alive.length > 0) {
      const sorted = alive.slice().sort((a,b) => {
        if (strategy === 'avalanche') return b.interest_rate - a.interest_rate
        return a.balance - b.balance
      })
      for(const target of sorted){
        if (available <= 0) break
        if (target.balance <= epsilon) continue
        const pay = Math.min(available, target.balance)
        target.balance -= pay
        available -= pay
      }
    }

    const totalBalance = debts.reduce((s,d)=> s + Math.max(0, d.balance), 0)
    graphData.push({ month: months, date: addMonths(new Date(), months).toISOString(), totalBalance: roundTwo(totalBalance), balances: debts.map(d => ({ id: d.id, balance: roundTwo(Math.max(0, d.balance)) })) })
    if (months > maxMonths) break
    // After month-end, if strategy is snowball and any debt got paid off, roll its min_payment into dynamicExtra (next months)
    if (strategy === 'snowball'){
      for(const d of debts){
        if (aliveAtStart.has(d.id) && d.balance <= epsilon && d.min_payment > 0){
          dynamicExtra += d.min_payment
          d.min_payment = 0
        }
      }
    }
  }

  const payoffDate = months >= maxMonths ? null : addMonths(new Date(), months).toISOString()
  return { payoffDate, totalInterestPaid: roundTwo(totalInterest), months, graphData }
}

export async function calculateDebtStrategy(userId: string, extraMonthlyPayment = 0) {
  if(!userId) return { success: false, error: 'userId required' }
  const supabase = await createServerSupabase()
  const res = await supabase.from('accounts').select('id, name, balance, interest_rate, min_payment, type').eq('user_id', userId).in('type', ['credit_card', 'loan'])
  if(res.error) return { success: false, error: res.error.message }
  const debts = (res.data || []).map((r:{ id: string; name?: string; balance?: number|string; interest_rate?: number|string; min_payment?: number|string }) => ({ id: r.id, name: r.name, balance: Number(r.balance || 0), interest_rate: Number(r.interest_rate || 0), min_payment: Number(r.min_payment || 0) })) as DebtAccount[]
  const avalanche = simulateStrategy(debts, extraMonthlyPayment, 'avalanche')
  const snowball = simulateStrategy(debts, extraMonthlyPayment, 'snowball')
  // Baseline is the min-payments path (no extra monthly payment)
  const baseline = simulateStrategy(debts, 0, 'avalanche')
  return { success: true, data: { avalanche, snowball, baseline } }
}

export default simulateStrategy
