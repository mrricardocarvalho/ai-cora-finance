import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '../../../../lib/supabase/server'

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams
    const accountId = params.get('accountId')
    const ticker = params.get('ticker')
    if(!accountId || !ticker) return NextResponse.json({ success: false, error: 'accountId and ticker required' }, { status: 400 })
    const supabase = await createServerSupabase()
    const { data, error } = await supabase.from('holdings').select('quantity').eq('account_id', accountId).eq('ticker', ticker).limit(1).single()
    if(error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    const qty = Number(data?.quantity || 0)
    return NextResponse.json({ success: true, data: { quantity: qty } })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
