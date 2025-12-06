import { NextResponse } from 'next/server'
import { deleteAccountAndUser } from '../../../../lib/actions/user-data'

export async function POST(req: Request){
  try{
    const body = await req.json()
    const confirm = body?.confirm
    if(confirm !== 'DELETE') return NextResponse.json({ success: false, error: 'Confirmation required' }, { status: 400 })
    const res = await deleteAccountAndUser()
    if(!res.success) return NextResponse.json({ success: false, error: res.error }, { status: 500 })
    return NextResponse.json({ success: true })
  }catch(err){ return NextResponse.json({ success: false, error: (err as any)?.message || 'Unknown' }, { status: 500 }) }
}
