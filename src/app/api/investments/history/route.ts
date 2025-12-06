import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get('ticker')
  
  if (!ticker) {
    return NextResponse.json({ success: false, error: 'ticker required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('investment_transactions')
    .select('id, type, quantity, price_per_share, fees, date')
    .eq('user_id', user.id)
    .eq('ticker', ticker.toUpperCase())
    .order('date', { ascending: false })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  // Calculate total for each transaction
  const transactions = (data || []).map(tx => ({
    ...tx,
    total: Number(tx.quantity) * Number(tx.price_per_share)
  }))

  return NextResponse.json({ success: true, data: transactions })
}
