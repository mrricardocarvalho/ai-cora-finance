import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '../../../../lib/supabase/server'
import { recalculateAllAccountBalances } from '../../../../lib/actions/accounts'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const results = await recalculateAllAccountBalances(user.id)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Account balances recalculated',
      results 
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
