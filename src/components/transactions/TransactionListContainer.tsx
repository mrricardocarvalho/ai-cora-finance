"use client"
import React, { useState, useCallback, useEffect } from 'react'
import { mutate } from 'swr'
import TransactionTable from './transaction-table'
import MobileTransactionList from './mobile-transaction-list'
import TransactionFilters, { type TransactionFilters as FiltersType } from './TransactionFilters'
import Sheet from '../ui/sheet'
import Skeleton from '../ui/skeleton'
import { formatDate, formatCurrency } from '../../lib/utils'
import ConfirmDialog from '../ui/confirm-dialog'
// PromptDialog replaced by CategoryPicker for category selection
// PromptDialog unused; removed
import CategoryPicker from './CategoryPicker'
import { useToast } from '../ui/toast-provider'
import { getSupabaseClient } from '../../lib/supabase/client'
import type { Transaction } from './types'
import Button from '../ui/button'
import BulkActionBar from './bulk-action-bar'
import AddTransactionDialog from './AddTransactionDialog'
import { useTranslations } from '../../lib/i18n'
// Use API route for server operations instead of importing server actions into client components

type Props = {
  initial: Transaction[]
  pageSize?: number
  accounts?: { id: string; name: string }[]
}

export default function TransactionListContainer({ initial, pageSize = 10, accounts = [] }: Props){
  const t = useTranslations()
  const [items, setItems] = useState<Transaction[]>(initial || [])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Record<string,boolean>>({})
  const [total, setTotal] = useState<number | null>(null)
  const [filters, setFilters] = useState<FiltersType>({})
  const [categories, setCategories] = useState<string[]>([])
  const allSelected = Object.keys(selected).length > 0 && Object.keys(selected).length === items.length
  const [details, setDetails] = useState<Transaction | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectAllAcrossPages, setSelectAllAcrossPages] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDeleteConfirmSelected, setShowDeleteConfirmSelected] = useState(false)
  const [showPromptEdit, setShowPromptEdit] = useState(false)
  const [showPromptEditSelected, setShowPromptEditSelected] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  // promptCategory not used; category is provided via PromptDialog's onConfirm
  const toast = useToast()
  const client = getSupabaseClient()
  const handleSelectAll = useCallback((sel: boolean) => {
    if (sel) {
      setSelected(Object.fromEntries(items.map(i => [i.id, true])))
    } else {
      setSelected({})
    }
    if(!sel) setSelectAllAcrossPages(false)
  }, [items, setSelected])

  const handleOpenDetails = useCallback((t: Transaction | null) => {
    setDetails(t)
    if(!t) return
    // fetch latest by id and update details, non-blocking
    (async ()=>{
      try{
        const resp = await fetch(`/api/transactions?id=${t.id}`)
        const json = await resp.json() as { success: boolean; data?: Transaction }
        if(json?.success && json.data) setDetails(json.data)
      } catch(err){ console.warn('Failed to fetch transaction details', err) }
    })()
  }, [setDetails])

  async function fetchPage(pageNum: number, currentFilters: FiltersType = filters){
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        pageSize: String(pageSize)
      })
      if (currentFilters.accountId) params.set('accountId', currentFilters.accountId)
      if (currentFilters.category) params.set('category', currentFilters.category)
      if (currentFilters.dateFrom) params.set('dateFrom', currentFilters.dateFrom)
      if (currentFilters.dateTo) params.set('dateTo', currentFilters.dateTo)
      if (currentFilters.search) params.set('search', currentFilters.search)
      
      const resp = await fetch(`/api/transactions?${params.toString()}`)
      const json = await resp.json()
      if (json.success && json.data) {
        setItems(json.data.data || [])
        setTotal(json.data.metadata?.total || 0)
        setTotalPages(json.data.metadata?.totalPages || 1)
        setPage(pageNum)
        setSelected({}) // Clear selection when changing pages
        
        // Extract unique categories from all fetched transactions
        const cats = [...new Set((json.data.data || []).map((t: Transaction) => t.category).filter(Boolean))] as string[]
        setCategories(prev => [...new Set([...prev, ...cats])])
      }
    } catch(err) {
      console.error('Failed to fetch transactions', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch initial page data and categories
  useEffect(() => {
    fetchPage(1)
    // Fetch all categories on mount
    fetch('/api/transactions?page=1&pageSize=1000')
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data?.data) {
          const cats = [...new Set(json.data.data.map((t: Transaction) => t.category).filter(Boolean))] as string[]
          setCategories(cats.sort())
        }
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: FiltersType) => {
    setFilters(newFilters)
    fetchPage(1, newFilters)
  }, [])

  const toggleRow = useCallback((id:string)=>{
    setSelected(s => ({ ...s, [id]: !s[id] }))
  }, [setSelected])

  const clearSelection = useCallback(()=>{ setSelected({}); setSelectAllAcrossPages(false) }, [setSelected, setSelectAllAcrossPages])
  useEffect(()=>{ if(Object.keys(selected).length === 0) setSelectAllAcrossPages(false) }, [selected])

  const handleBulkDelete = useCallback(async ()=>{
    const ids = Object.entries(selected).filter(([,v])=>v).map(([k])=>k)
    if(!selectAllAcrossPages && ids.length === 0) return
    if(selectAllAcrossPages){
      setShowDeleteConfirm(true)
      return
    }
    setShowDeleteConfirmSelected(true)
    return
  }, [selected, selectAllAcrossPages])

  const handleBulkEdit = useCallback(async ()=>{
    const ids = Object.entries(selected).filter(([,v])=>v).map(([k])=>k)
    if(!selectAllAcrossPages && ids.length === 0) return
    if(selectAllAcrossPages){
      setShowPromptEdit(true)
      return
    }
    setShowPromptEditSelected(true)
    return
  }, [selected, selectAllAcrossPages])

  // confirm dialog handlers
  const performDeleteAll = useCallback(async ()=>{
    setShowDeleteConfirm(false)
    setActionLoading(true)
    const prev = items
    setItems([]) // optimistic: clear visible items.
    setSelected({})
    setSelectAllAcrossPages(false)
    try{
      const resp = await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', selectAll: true }) })
      const res = await resp.json() as { success: boolean; deleted?: number; error?: string }
      if(!res.success){
        setItems(prev)
        toast('error', `Delete failed: ${res.error || 'unknown'}`)
      } else {
        toast('success', `Deleted ${res.deleted || 0} transactions`)
        // revalidate SWR caches for transactions and insights
        try{ mutate(`/api/transactions?pageSize=${pageSize}`); mutate('/api/transactions?pageSize=5'); mutate('/api/insights') }catch(e){}
      }
    } catch(err){ console.error(err); toast('error', 'Delete failed') }
    finally{ setActionLoading(false) }
  }, [setActionLoading, setItems, setSelected, toast, items])

  const performDeleteSelected = useCallback(async ()=>{
    setShowDeleteConfirmSelected(false)
    const ids = Object.entries(selected).filter(([,v])=>v).map(([k])=>k)
    if(ids.length === 0) return
    setActionLoading(true)
    const prev = items
    setItems(prevItems => prevItems.filter(it => !ids.includes(it.id))) // optimistic
    setSelected({})
    try{
      const resp = await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', ids }) })
      const res = await resp.json() as { success: boolean; deleted?: number; error?: string }
      if(!res.success){
        setItems(prev)
        toast('error', `Delete failed: ${res.error || 'unknown'}`)
      } else {
        toast('success', `Deleted ${res.deleted || 0} transactions`)
          try{ mutate(`/api/transactions?pageSize=${pageSize}`); mutate('/api/transactions?pageSize=5'); mutate('/api/insights') }catch(e){}
      }
    } catch(err){ console.error(err); toast('error', 'Delete failed') }
    finally{ setActionLoading(false) }
  }, [selected, setActionLoading, setItems, setSelected, toast, items])

  const performEditSelected = useCallback(async (categoryVal: string)=>{
    setShowPromptEditSelected(false)
    const ids = Object.entries(selected).filter(([,v])=>v).map(([k])=>k)
    if(ids.length === 0) return
    setActionLoading(true)
    const prev = items
    setItems(prevItems => prevItems.map(it => ids.includes(it.id) ? ({ ...it, category: categoryVal, confidence_score: 1.0 }) : it)) // optimistic
    setSelected({})
    try{
      const resp = await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update', ids, category: categoryVal }) })
      const res = await resp.json() as { success: boolean; updated?: number; error?: string }
      if(!res.success){
        setItems(prev)
        toast('error', `Update failed: ${res.error || 'unknown'}`)
      } else {
        toast('success', `Updated ${res.updated || 0} transactions`)
          try{ mutate(`/api/transactions?pageSize=${pageSize}`); mutate('/api/transactions?pageSize=5'); mutate('/api/insights') }catch(e){}
      }
    } catch(err){ console.error(err); toast('error', 'Update failed') }
    finally{ setActionLoading(false) }
  }, [selected, setActionLoading, setItems, setSelected, toast, items])

  const performEditAll = useCallback(async (categoryVal: string)=>{
    setShowPromptEdit(false)
    if(!categoryVal) return
    setActionLoading(true)
    const prev = items
    // optimistic: update visible items
    setItems(prevItems => prevItems.map(it => ({ ...it, category: categoryVal, confidence_score: 1.0 })))
    setSelected({})
    setSelectAllAcrossPages(false)
    try{
      const resp = await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update', category: categoryVal, selectAll: true }) })
      const res = await resp.json() as { success: boolean; updated?: number; error?: string }
      if(!res.success){
        setItems(prev)
        toast('error', `Update failed: ${res.error || 'unknown'}`)
      } else {
        toast('success', `Updated ${res.updated || 0} transactions`)
          try{ mutate(`/api/transactions?pageSize=${pageSize}`); mutate('/api/transactions?pageSize=5'); mutate('/api/insights') }catch(e){}
      }
    } catch(err){ console.error(err); toast('error', 'Update failed') }
    finally{ setActionLoading(false) }
  }, [setActionLoading, setSelected, toast, items])

  // keyboard shortcuts
  React.useEffect(()=>{
    function handler(e: KeyboardEvent){
      // Don't intercept keyboard events when user is typing in an input or textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }
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
      {/* Header with Add button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t.transactions.title}</h2>
        <Button 
          variant="primary" 
          onClick={() => setShowAddTransaction(true)}
          className="flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span>
          <span className="hidden sm:inline">{t.transactions.addTransaction}</span>
        </Button>
      </div>
      <TransactionFilters 
        accounts={accounts} 
        categories={categories} 
        filters={filters} 
        onFiltersChange={handleFiltersChange} 
      />
      <div className="hidden md:block">
        <TransactionTable items={items} selectedIds={selected} onToggle={toggleRow} onOpenDetails={handleOpenDetails} onSelectAll={handleSelectAll} allSelected={allSelected} />
      </div>
      <div className="md:hidden">
        <MobileTransactionList items={items} selectedIds={selected} onToggle={toggleRow} onOpenDetails={handleOpenDetails} />
      </div>
      {loading && (
        <div className="mt-4 space-y-2">
          {[...Array(3)].map((_,idx)=>(
            <Skeleton as="div" key={idx} className="p-3 border rounded h-12" />
          ))}
        </div>
      )}
      {/* Pagination Controls */}
      <div className="mt-4 border-t border-[var(--border)] pt-4">
        <div className="text-sm text-[var(--text-secondary)] text-center mb-2">
          {total !== null ? `${t.transactions.showing} ${items.length} ${t.transactions.of} ${total} ${t.transactions.title.toLowerCase()}` : ''}
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button 
            variant="ghost" 
            onClick={() => fetchPage(page - 1)} 
            disabled={loading || page <= 1}
            className="px-3 py-1"
          >
            ← {t.transactions.previous}
          </Button>
          <span className="text-sm text-[var(--text-secondary)] px-2">
            {t.transactions.page} {page} {t.transactions.of} {totalPages}
          </span>
          <Button 
            variant="ghost" 
            onClick={() => fetchPage(page + 1)} 
            disabled={loading || page >= totalPages}
            className="px-3 py-1"
          >
            {t.transactions.next} →
          </Button>
        </div>
      </div>
      {allSelected && total && total > items.length && !selectAllAcrossPages ? (
        <div className="mt-2 text-center text-sm text-[var(--text-secondary)]">{t.transactions.selected} {items.length} — <button className="underline text-[var(--primary)] hover:text-[var(--primary-hover)]" onClick={()=>setSelectAllAcrossPages(true)}>{t.transactions.selectAllAcross} {total} {t.transactions.title.toLowerCase()}</button></div>
      ) : null}
      <BulkActionBar count={Object.values(selected).filter(Boolean).length} onEdit={handleBulkEdit} onDelete={handleBulkDelete} onCancel={clearSelection} loading={actionLoading} selectAll={selectAllAcrossPages} total={total} />
      <Sheet open={Boolean(details)} onClose={()=>setDetails(null)} title={t.transactions.details}>
        {details && (
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-lg text-[var(--text-primary)]">{details.description || t.transactions.noDescription}</h4>
              <div className="text-sm text-[var(--text-muted)]">{formatDate(details.date)}</div>
            </div>
            <div className={`text-2xl font-bold ${Number(details.amount) >= 0 ? 'text-[var(--success)]' : 'text-[var(--text-primary)]'}`}>
              {formatCurrency(Number(details.amount))}
            </div>
            <div className="border-t border-[var(--border)] pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">{t.transactions.category}</span>
                <span className="font-medium text-[var(--text-primary)]">{details.category || t.transactions.noCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">{t.transactions.account}</span>
                <span className="font-medium text-[var(--text-primary)]">{details.account_name || t.transactions.unknownAccount}</span>
              </div>
              {details.confidence_score !== null && details.confidence_score !== undefined && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">{t.transactions.aiConfidence}</span>
                  <span className="font-medium text-[var(--text-primary)]">{Math.round(Number(details.confidence_score) * 100)}%</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">{t.transactions.recurring}</span>
                <span className="font-medium text-[var(--text-primary)]">{details.is_recurring ? t.transactions.yes : t.transactions.no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Dedutível IRS</span>
                <span className="font-medium text-[var(--text-primary)]">{details.tax_deductible ? 'Sim' : 'Não'}</span>
              </div>
            </div>
            {/* Action buttons */}
            <div className="border-t pt-3 flex gap-2">
              <Button 
                variant="primary"
                className="flex-1"
                disabled={actionLoading}
                onClick={async () => {
                  if (!details.category || details.category === 'Uncategorized') {
                    // If no category, open category picker
                    setSelected({ [details.id]: true })
                    setShowPromptEditSelected(true)
                    return
                  }
                  // Confirm: set confidence to 1.0 (user approved)
                  setActionLoading(true)
                  try {
                    const resp = await fetch('/api/transactions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'update', ids: [details.id], category: details.category })
                    })
                    const res = await resp.json()
                    if (res.success) {
                      toast('success', 'Transaction confirmed')
                      setDetails(null)
                      fetchPage(page)
                    } else {
                      toast('error', res.error || 'Failed to confirm')
                    }
                  } catch (e) {
                    toast('error', 'Failed to confirm')
                  } finally {
                    setActionLoading(false)
                  }
                }}
              >
                {!details.category || details.category === 'Uncategorized' ? 'Definir Categoria' : 'Confirmar ✓'}
              </Button>
              <Button 
                variant="ghost"
                className="flex-1"
                disabled={actionLoading}
                onClick={() => {
                  setSelected({ [details.id]: true })
                  setShowPromptEditSelected(true)
                }}
              >
                Alterar Categoria
              </Button>
            </div>
          </div>
        )}
      </Sheet>
      <ConfirmDialog open={showDeleteConfirm} title="Eliminar todas as transações" description={`Eliminar todas as ${total} transações? Esta ação não pode ser revertida.`} onCancel={()=>setShowDeleteConfirm(false)} onConfirm={performDeleteAll} />
      <ConfirmDialog open={showDeleteConfirmSelected} title="Eliminar transações selecionadas" description={`Eliminar as transações selecionadas? Esta ação não pode ser revertida.`} onCancel={()=>setShowDeleteConfirmSelected(false)} onConfirm={performDeleteSelected} />
      <CategoryPicker open={showPromptEdit} title="Alterar categoria de todas as transações" onClose={()=>setShowPromptEdit(false)} onConfirm={performEditAll} />
      <CategoryPicker open={showPromptEditSelected} title="Alterar categoria das transações selecionadas" onClose={()=>setShowPromptEditSelected(false)} onConfirm={performEditSelected} />
      <AddTransactionDialog 
        open={showAddTransaction} 
        onClose={() => setShowAddTransaction(false)} 
        accounts={accounts}
        onSuccess={() => fetchPage(1)}
      />
    </div>
  )
}
