import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '../../../../lib/supabase/server'

export async function GET(){
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from('accounts').select('id,name,type').eq('type', 'broker')
  if(error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}
