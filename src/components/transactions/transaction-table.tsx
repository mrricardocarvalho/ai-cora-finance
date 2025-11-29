"use client"
import React from 'react'
import { useReactTable, getCoreRowModel, flexRender, ColumnDef, CellContext } from '@tanstack/react-table'
import type { Transaction } from './types'
import { format } from 'date-fns'
import { Badge } from '../ui/Badge'

export default function TransactionTable({ items, selectedIds = {}, onToggle }:{ items: Transaction[]; selectedIds?: Record<string, boolean>; onToggle?: (id: string)=>void }){
  const columns = React.useMemo<ColumnDef<Transaction, unknown>[]>(()=>{
    return [
    // Selection column - renders a checkbox
    { id: 'select', header: () => (
        <input type="checkbox" aria-label="select-all" onChange={()=>{
          // Selecting all handled in container logic if needed
        }} />
      ), cell: (info: CellContext<Transaction, unknown>) => {
        const id = info.row.original.id
        const checked = Boolean(selectedIds?.[id])
        return <input aria-label={`select-${id}`} type="checkbox" checked={checked} onChange={()=>onToggle?.(id)} />
      }
    },
    { accessorKey: 'date', header: 'Date', cell: (info: CellContext<Transaction, unknown>) => format(new Date(info.getValue() as string), 'dd/MM/yyyy') },
    { accessorKey: 'merchant', header: 'Description' },
    { accessorKey: 'category', header: 'Category', cell: (info: CellContext<Transaction, unknown>)=> <Badge>{String(info.getValue())}</Badge> },
    { accessorKey: 'amount', header: 'Amount', cell: (info: CellContext<Transaction, unknown>)=> (
      <div className={Number(info.getValue()) < 0 ? 'text-red-600' : 'text-green-600'}>
        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Math.abs(Number(info.getValue())))}
      </div>
    ) },
    { accessorKey: 'confidence_score', header: 'Confidence', cell: (info: CellContext<Transaction, unknown>)=> {
        const val = Number(info.getValue())
        return (isNaN(val) || val < 0.8) ? <Badge variant='warning'>Review</Badge> : <Badge variant='default'>OK</Badge>
      }
    },
    { id: 'actions', header: 'Actions', cell: (info: CellContext<Transaction, unknown>)=> {
        const t = info.row.original
        return <button className="text-sm text-primary" onClick={()=>alert(JSON.stringify(t, null, 2))}>Details</button>
      } },
    ]
  }, [onToggle, selectedIds])

  const table = useReactTable({ data: items, columns, getCoreRowModel: getCoreRowModel() })
  return (
    <div className="overflow-auto border rounded">
      <table className="w-full table-auto">
        <thead>
          {table.getHeaderGroups().map(hg=> (
            <tr key={hg.id}>
              {hg.headers.map(h=> (
                <th key={h.id} className="text-left p-2 border-b">{flexRender(h.column.columnDef.header, h.getContext())}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row=> (
            <tr key={row.id} className="hover:bg-slate-50" tabIndex={0} data-row-id={row.original.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="p-2 border-b">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
