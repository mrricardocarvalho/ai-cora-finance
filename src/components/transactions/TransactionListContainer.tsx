"use client"
import React, { useState, useCallback } from 'react'
import TransactionTable from './transaction-table'
import MobileTransactionList from './mobile-transaction-list'
import { getSupabaseClient } from '../../lib/supabase/client'
import type { Transaction } from './types'
import Button from '../ui/Button'
import BulkActionBar from './bulk-action-bar'
// Use API route for server operations instead of importing server actions into client components

export default function TransactionListContainer({ initial, pageSize = 20 }: { initial: Transaction[]; pageSize?: number }){
  const [items, setItems] = useState<Transaction[]>(initial || [])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Record<string,boolean>>({})
  const [actionLoading, setActionLoading] = useState(false)
  const client = getSupabaseClient()

  async function loadMore(){
    if(!client) return
    setLoading(true)
    const from = page * pageSize
    const to = from + pageSize - 1
    const res = await client.from('transactions').select('*').order('date', { ascending: false }).range(from, to)
    if(res.error){ console.error(res.error) } else {
      setItems(s => [...s, ...(res.data || [])])
      setPage(p => p + 1)
    }
    setLoading(false)
  }

  const toggleRow = useCallback((id:string)=>{
    setSelected(s => ({ ...s, [id]: !s[id] }))
  }, [setSelected])

  const clearSelection = useCallback(()=>{ setSelected({}) }, [setSelected])

  const handleBulkDelete = useCallback(async ()=>{
    const ids = Object.entries(selected).filter(([,v])=>v).map(([k])=>k)
    if(ids.length === 0) return
    if(!confirm(`Delete ${ids.length} transactions?`)) return
    setActionLoading(true)
    // optimistic: remove from UI
    setItems(prev => prev.filter(it => !ids.includes(it.id)))
    try{
      const resp = await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', ids }) })
      const res = await resp.json() as { success: boolean; deleted?: number; error?: string }
      if(!res.success) { alert(`Delete failed: ${res.error || 'unknown'}`); }
      clearSelection()
    } catch(err){ console.error(err); alert('Delete failed'); }
    finally{ setActionLoading(false) }
  }, [selected, setActionLoading, setItems, clearSelection])

  const handleBulkEdit = useCallback(async ()=>{
    const ids = Object.entries(selected).filter(([,v])=>v).map(([k])=>k)
    if(ids.length === 0) return
    const category = prompt('Enter category (e.g., Food, Transport)')
    if(!category) return
    setActionLoading(true)
    // optimistic: update items locally
    setItems(prev => prev.map(it => ids.includes(it.id) ? ({ ...it, category, confidence_score: 1.0 }) : it))
    try{
      const resp = await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update', ids, category }) })
      const res = await resp.json() as { success: boolean; updated?: number; error?: string }
      if(!res.success){ alert(`Update failed: ${res.error || 'unknown'}`) }
      clearSelection()
    } catch(err){ console.error(err); alert('Update failed') }
    finally{ setActionLoading(false) }
  }, [selected, setActionLoading, setItems, clearSelection])

  // keyboard shortcuts
  React.useEffect(()=>{
    function handler(e: KeyboardEvent){
      if(e.code === 'Escape'){ clearSelection(); e.preventDefault() }
      if(e.code === 'Delete' || e.code === 'Backspace'){ handleBulkDelete(); e.preventDefault() }
      if(e.code === 'Space'){
        const active = document.activeElement as HTMLElement | null
        if(active && active.closest('[data-row-id]')){
          const row = active.closest('[data-row-id]')!.getAttribute('data-row-id')!
          toggleRow(row)
          e.preventDefault()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return ()=> window.removeEventListener('keydown', handler)
  }, [selected, handleBulkDelete, handleBulkEdit, toggleRow, clearSelection])

  return (
    <div>
      <div className="hidden md:block">
        <TransactionTable items={items} selectedIds={selected} onToggle={toggleRow} />
      </div>
      <div className="md:hidden">
        <MobileTransactionList items={items} selectedIds={selected} onToggle={toggleRow} />
      </div>
      <div className="mt-3 flex justify-center">
        <Button variant="ghost" onClick={loadMore} disabled={loading}>{loading ? 'Loading...' : 'Load More'}</Button>
      </div>
      <BulkActionBar count={Object.values(selected).filter(Boolean).length} onEdit={handleBulkEdit} onDelete={handleBulkDelete} onCancel={clearSelection} loading={actionLoading} />
    </div>
  )
}
