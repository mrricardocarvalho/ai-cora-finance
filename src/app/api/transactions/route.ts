import { NextRequest, NextResponse } from 'next/server'
import { bulkUpdateCategories, bulkDeleteTransactions, bulkUpdateAllCategories, bulkDeleteAllTransactions, getTransactionById, getTransactions } from '../../../lib/actions/transactions'
import { createClient as createServerSupabase } from '../../../lib/supabase/server'

const MAX_BULK_ITEMS = 500

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, ids, category, selectAll } = body
    if (!selectAll && (!ids || !Array.isArray(ids) || ids.length === 0)) return NextResponse.json({ success: false, error: 'No ids provided' }, { status: 400 })
    if (action === 'update') {
      if (selectAll) {
        // server-side safety: disallow selectAll if user has too many transactions
        const supabase = await createServerSupabase()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
        const countRes = await supabase.from('transactions').select('id', { count: 'exact' }).eq('user_id', user.id)
        const total = countRes.count ?? 0
        if (total > MAX_BULK_ITEMS) return NextResponse.json({ success: false, error: `Too many transactions for selectAll (${total}). Use selection or smaller filters.` }, { status: 400 })
        const res = await bulkUpdateAllCategories(category)
        return NextResponse.json(res)
      }
      const res = await bulkUpdateCategories(ids, category)
      return NextResponse.json(res)
    }
    if (action === 'delete') {
      if (selectAll) {
        // server-side safety: disallow selectAll if user has too many transactions
        const supabase = await createServerSupabase()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
        const countRes = await supabase.from('transactions').select('id', { count: 'exact' }).eq('user_id', user.id)
        const total = countRes.count ?? 0
        if (total > MAX_BULK_ITEMS) return NextResponse.json({ success: false, error: `Too many transactions for selectAll (${total}). Use selection or smaller filters.` }, { status: 400 })
        const res = await bulkDeleteAllTransactions()
        return NextResponse.json(res)
      }
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (id) {
      const res = await getTransactionById(id)
      return NextResponse.json({ success: true, data: res })
    }
    // Pagination and filter params
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '5', 10)
    const accountId = searchParams.get('accountId') || undefined
    const category = searchParams.get('category') || undefined
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined
    const search = searchParams.get('search') || undefined
    
    const res = await getTransactions({ page, pageSize, accountId, category, dateFrom, dateTo, search })
    return NextResponse.json({ success: true, data: res })
  } catch (err: unknown) {
    if (err instanceof Error) return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
