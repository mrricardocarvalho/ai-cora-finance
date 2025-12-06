import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '../../../../lib/supabase/server'
import { calculateDebtStrategy } from '../../../../lib/planning/debt'

export async function POST(req: Request) {
  try{
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    const body = await req.json()
    const extra = Number(body.extra || 0)
    const result = await calculateDebtStrategy(user.id, extra)
    return NextResponse.json(result)
  }catch(err){
    return NextResponse.json({ success: false, error: (err as any)?.message || 'Unknown' }, { status: 500 })
  }
}
