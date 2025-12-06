"use client"
import React from 'react'
import { useReactTable, getCoreRowModel, flexRender, ColumnDef, CellContext } from '@tanstack/react-table'
import type { Transaction } from './types'
import { format } from 'date-fns'
import { formatDate, formatCurrency } from '../../lib/utils'
import { Badge } from '../ui/badge'
import { useTranslations } from '../../lib/i18n'

function categoryColorClass(cat?: string){
  if(!cat) return 'bg-[var(--bg-subtle)]'
  const key = cat.toLowerCase()
  if(['groceries','food','restaurants'].some(k=>key.includes(k))) return 'bg-[var(--warning)]/10 text-[var(--warning)]'
  if(['salary','income','refund'].some(k=>key.includes(k))) return 'bg-[var(--success)]/10 text-[var(--success)]'
  if(['transport','fuel','taxi'].some(k=>key.includes(k))) return 'bg-[var(--primary)]/10 text-[var(--primary)]'
  return 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
}

export default function TransactionTable({ items, selectedIds = {}, onToggle, onOpenDetails, onSelectAll, allSelected }:{ items: Transaction[]; selectedIds?: Record<string, boolean>; onToggle?: (id: string)=>void; onOpenDetails?: (t: Transaction | null)=>void; onSelectAll?: (selected: boolean)=>void; allSelected?: boolean }){
  const t = useTranslations()
  const columns = React.useMemo<ColumnDef<Transaction, unknown>[]>(()=>{
    return [
    // Selection column - renders a checkbox
    { id: 'select', header: () => (
      <input type="checkbox" aria-label={t.transactions.selectAll} title={t.transactions.selectAll} checked={Boolean(allSelected)} onChange={(e)=>{ onSelectAll?.(e.target.checked) }} />
      ), cell: (info: CellContext<Transaction, unknown>) => {
        const id = info.row.original.id
        const checked = Boolean(selectedIds?.[id])
        return <input aria-label={`Select transaction ${id}`} type="checkbox" checked={checked} onChange={()=>onToggle?.(id)} />
      }
    },
    { accessorKey: 'date', header: t.transactions.date, cell: (info: CellContext<Transaction, unknown>) => formatDate(info.getValue() as string) },
    { accessorKey: 'description', header: t.transactions.description },
    { accessorKey: 'category', header: t.transactions.category, cell: (info: CellContext<Transaction, unknown>)=> <Badge className={categoryColorClass(String(info.getValue()))}>{String(info.getValue())}</Badge> },
    { accessorKey: 'amount', header: t.transactions.amount, cell: (info: CellContext<Transaction, unknown>)=> (
      <div className={Number(info.getValue()) < 0 ? 'text-red-600' : 'text-green-600'}>
        {formatCurrency(Math.abs(Number(info.getValue())))}
      </div>
    ) },
    { accessorKey: 'account_name', header: t.transactions.account, cell: (info: CellContext<Transaction, unknown>) => (
      <span className="text-sm text-[var(--text-secondary)] block max-w-[80px] truncate" title={String(info.getValue() || 'Unknown')}>{String(info.getValue() || 'Unknown')}</span>
    ) },
    { accessorKey: 'confidence_score', header: t.transactions.confidence, cell: (info: CellContext<Transaction, unknown>)=> {
        const val = info.getValue() as number | null | undefined
        const row = info.row.original
        // Show OK if: confidence >= 0.8, OR category is set and confidence is null (regex-imported, user-categorized)
        const hasConfidence = val !== null && val !== undefined && !isNaN(Number(val))
        const isOk = (hasConfidence && Number(val) >= 0.8) || (!hasConfidence && row.category && row.category !== 'Uncategorized')
        return isOk ? <Badge variant='default'>{t.transactions.ok}</Badge> : <Badge variant='warning'>{t.transactions.review}</Badge>
      }
    },
    { id: 'actions', header: t.transactions.actions, cell: (info: CellContext<Transaction, unknown>)=> {
        const tx = info.row.original
        return <button className="text-sm text-primary" onClick={()=>onOpenDetails?.(tx)}>{t.transactions.details}</button>
      } },
    ]
  }, [onToggle, selectedIds, onOpenDetails, onSelectAll, allSelected, t])

  const table = useReactTable({ data: items, columns, getCoreRowModel: getCoreRowModel() })
  return (
    <div className="overflow-auto border border-[var(--border)] rounded-xl bg-surface">
      <table className="w-full table-auto">
        <thead>
          {table.getHeaderGroups().map(hg=> (
            <tr key={hg.id}>
              {hg.headers.map(h=> (
                <th key={h.id} className="text-left p-3 border-b border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium">{flexRender(h.column.columnDef.header, h.getContext())}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row=> (
            <tr key={row.id} className="hover:bg-[var(--bg-subtle)] transition-colors" tabIndex={0} data-row-id={row.original.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="p-3 border-b border-[var(--border)] text-[var(--text-primary)]">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
