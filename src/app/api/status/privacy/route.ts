import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '../../../../lib/supabase/server'
import { createAdminSupabase } from '../../../../lib/supabase/admin'

export async function GET(req: Request){
  try{
    const proto = req.headers.get('x-forwarded-proto') || new URL(req.url).protocol || ''
    const encrypted = proto.includes('https') || process.env.NODE_ENV === 'production'
    const supabase = await createServerSupabase()
    // test DB connection
    const q = await supabase.from('profiles').select('id').limit(1)
    const dbConnected = !q.error
    // check RLS enabled by inspecting pg_policies for transactions
    let rlsEnabled = false
    try{
      // If admin client available, use it for catalog query
      const adminClient = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminSupabase() : null
      const clientToUse = adminClient || supabase
      const pol = await clientToUse.from('pg_policies').select('*').eq('tablename', 'transactions').limit(1)
      if(!pol.error && pol.data && pol.data.length > 0) rlsEnabled = true
    }catch(e){ /* ignore */ }
    const region = process.env.NEXT_PUBLIC_SUPABASE_REGION || 'unknown'
    return NextResponse.json({ success: true, encrypted: Boolean(encrypted), dbConnected: Boolean(dbConnected), rlsEnabled: Boolean(rlsEnabled), region })
  }catch(err){
    return NextResponse.json({ success: false, error: (err as any)?.message || 'Unknown' }, { status: 500 })
  }
}
