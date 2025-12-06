import { NextResponse } from 'next/server'
import updateAssetPrices from '../../../../lib/services/market-data'

export async function GET(request: Request) {
  const secret = request.headers.get('CRON_SECRET') || request.headers.get('x-cron-secret')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await updateAssetPrices()
    return NextResponse.json({ success: true, result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('update-prices failed', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
