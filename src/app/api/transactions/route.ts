import { NextRequest, NextResponse } from 'next/server'
import { bulkUpdateCategories, bulkDeleteTransactions } from '../../../lib/actions/transactions'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, ids, category } = body
    if (!ids || !Array.isArray(ids) || ids.length === 0) return NextResponse.json({ success: false, error: 'No ids provided' }, { status: 400 })
    if (action === 'update') {
      const res = await bulkUpdateCategories(ids, category)
      return NextResponse.json(res)
    }
    if (action === 'delete') {
      const res = await bulkDeleteTransactions(ids)
      return NextResponse.json(res)
    }
    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
