import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '../../../../lib/supabase/server'
import { sendNotificationToUser } from '../../../../lib/services/notifications'

export async function POST(req: Request){
  try{
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    const res = await sendNotificationToUser(user.id, 'Test Notification', 'This is a test push notification from Cora Finance', '/')
    if(!res.success) return NextResponse.json({ success: false, error: res.error }, { status: 500 })
    return NextResponse.json({ success: true })
  }catch(err){ return NextResponse.json({ success: false, error: (err as any)?.message || 'Unknown' }, { status: 500 }) }
}
