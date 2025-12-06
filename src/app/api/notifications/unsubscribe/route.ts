import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '../../../../lib/supabase/server'

export async function DELETE(req: Request){
  try{
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    const res = await supabase.from('profiles').update({ push_subscription: null }).eq('id', user.id).select()
    if(res.error) return NextResponse.json({ success: false, error: res.error.message }, { status: 500 })
    return NextResponse.json({ success: true, data: res.data })
  }catch(err){ return NextResponse.json({ success: false, error: (err as any)?.message || 'Unknown' }, { status: 500 }) }
}
