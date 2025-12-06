import { NextResponse } from 'next/server'
import getSafeToSpend from '../../../../lib/intelligence/safe-spend'
import { createClient as createServerSupabase } from '../../../../lib/supabase/server'

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: true, data: null })
    const res = await getSafeToSpend(user.id)
    return NextResponse.json({ success: true, data: res })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
