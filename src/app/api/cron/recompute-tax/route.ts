import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '../../../../lib/supabase/server'
import { recomputeTaxExposure } from '../../../../lib/actions/tax'

export async function GET(request: Request) {
  const secret = request.headers.get('CRON_SECRET') || request.headers.get('x-cron-secret')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = await createServerSupabase()
  const { data: profiles, error } = await supabase.from('profiles').select('id')
  if(error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  const results: any[] = []
  for(const p of profiles || []){
    try{
      const r = await recomputeTaxExposure(p.id)
      results.push({ user: p.id, success: !!r.success })
    }catch(e){ results.push({ user: p.id, error: String(e) }) }
  }
  return NextResponse.json({ success: true, results })
}
