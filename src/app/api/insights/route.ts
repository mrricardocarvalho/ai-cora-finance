import { NextResponse } from 'next/server'
import { getInsights } from '../../../lib/actions/insights'
import { createClient as createServerSupabase } from '../../../lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) return NextResponse.json({ success: true, data: [] })
    const res = await getInsights(user.id)
    if(!res.success) return NextResponse.json(res, { status: 500 })
    return NextResponse.json({ success: true, data: res.data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
