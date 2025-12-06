import { NextResponse } from 'next/server'
import { recomputeTaxExposure } from '../../../../lib/actions/tax'
import { createClient as createServerSupabase } from '../../../../lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    const res = await recomputeTaxExposure(user.id)
    if(!res.success) return NextResponse.json(res, { status: 500 })
    return NextResponse.json(res)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
