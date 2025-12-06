import { NextResponse } from 'next/server'
import { searchAssets } from '../../../../lib/actions/investments'

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const q = params.get('q') || ''
  try {
    const res = await searchAssets(q)
    return NextResponse.json(res)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
