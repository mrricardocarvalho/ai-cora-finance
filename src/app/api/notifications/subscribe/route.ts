import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '../../../../lib/supabase/server'

export async function POST(req: Request){
  try{
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    const body = await req.json()
    const subscription = body.subscription
    if(!subscription) return NextResponse.json({ success: false, error: 'subscription required' }, { status: 400 })
    // Basic shape validation
    try{
      if(typeof subscription !== 'object' || !subscription.endpoint) throw new Error('Invalid subscription: missing endpoint')
      const keys = (subscription as any).keys
      if(!keys || !keys.p256dh || !keys.auth) throw new Error('Invalid subscription: missing keys')
      const str = JSON.stringify(subscription)
      if(str.length > 10 * 1024) throw new Error('Subscription payload too large')
    }catch(err){ return NextResponse.json({ success: false, error: (err as any)?.message || 'Invalid subscription' }, { status: 400 }) }
    const res = await supabase.from('profiles').update({ push_subscription: subscription }).eq('id', user.id).select()
    if(res.error) return NextResponse.json({ success: false, error: res.error.message }, { status: 500 })
    return NextResponse.json({ success: true, data: res.data })
  }catch(err){ return NextResponse.json({ success: false, error: (err as any)?.message || 'Unknown' }, { status: 500 }) }
}
