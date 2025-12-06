import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '../../../../lib/supabase/server'
import { calculateEmergencyTarget } from '../../../../lib/planning/emergency'

export async function POST(req: Request){
  try{
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    const body = await req.json()
    let months = Number(body.months || 3)
    if (![3,6,12].includes(months)) months = 3
    const result = await calculateEmergencyTarget(user.id, months)
    return NextResponse.json(result)
  }catch(err){
    return NextResponse.json({ success: false, error: (err as any)?.message || 'Unknown' }, { status: 500 })
  }
}
