import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '../../../../lib/supabase/server'
import { calculateFIREProjection } from '../../../../lib/planning/fire'

export async function POST(req: Request){
  try{
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
      const body = await req.json()
      let monthlySavings = typeof body.monthlySavings !== 'undefined' ? Number(body.monthlySavings) : undefined
      let growthRate = typeof body.growthRate !== 'undefined' ? Number(body.growthRate) : 0.07
      let withdrawalRate = typeof body.withdrawalRate !== 'undefined' ? Number(body.withdrawalRate) : 0.04
      let avgMonthlyExpense = typeof body.avgMonthlyExpense !== 'undefined' ? Number(body.avgMonthlyExpense) : undefined
    // validate inputs
    if(monthlySavings !== undefined && monthlySavings < 0) monthlySavings = 0
    if(typeof growthRate !== 'number' || growthRate <= 0 || growthRate > 0.5) growthRate = 0.07
    if(typeof withdrawalRate !== 'number' || withdrawalRate <= 0 || withdrawalRate > 0.2) withdrawalRate = 0.04
      if(typeof avgMonthlyExpense !== 'undefined' && avgMonthlyExpense < 0) avgMonthlyExpense = undefined
      const result = await calculateFIREProjection(user.id, monthlySavings, growthRate, withdrawalRate, avgMonthlyExpense)
    return NextResponse.json(result)
  }catch(err){
    return NextResponse.json({ success: false, error: (err as any)?.message || 'Unknown' }, { status: 500 })
  }
}
