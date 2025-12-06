import { NextResponse } from 'next/server'

export async function GET(){
  try{
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY
    if(!publicKey) return NextResponse.json({ success: false, error: 'VAPID public key not configured' }, { status: 500 })
    return NextResponse.json({ success: true, publicKey })
  }catch(err){
    return NextResponse.json({ success: false, error: (err as any)?.message || 'Unknown' }, { status: 500 })
  }
}
