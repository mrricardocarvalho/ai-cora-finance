import { NextResponse } from 'next/server'
import { addTransaction } from '../../../../lib/actions/investments'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const res = await addTransaction(body)
    if(!res.success) return NextResponse.json(res, { status: 400 })
    return NextResponse.json(res)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
