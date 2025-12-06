import { NextResponse } from 'next/server'
import { exportUserData } from '../../../../lib/actions/user-data'

export async function GET(req: Request){
  try{
    const res = await exportUserData()
    if(!res.success) return NextResponse.json({ success: false, error: res.error }, { status: 500 })
    // Return data as JSON
    return NextResponse.json({ success: true, data: res.data })
  }catch(err){ return NextResponse.json({ success: false, error: (err as any)?.message || 'Unknown' }, { status: 500 }) }
}
