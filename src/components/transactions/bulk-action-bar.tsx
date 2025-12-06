"use client"
import React from 'react'
import Button from '../ui/button'

type Props = {
  count: number
  onEdit: () => void
  onDelete: () => void
  onCancel: () => void
  loading?: boolean
  selectAll?: boolean
  total?: number | null
}

export default function BulkActionBar({ count, onEdit, onDelete, onCancel, loading, selectAll, total }: Props){
  if (count === 0 && !selectAll) return null
  const displayCount = selectAll && total ? total : count
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-surface border border-[var(--border)] p-4 rounded-2xl shadow-elevated flex gap-3 items-center z-50 backdrop-blur-sm" aria-live="polite">
      <div className="font-medium">{displayCount} item{displayCount>1 ? 's' : ''} selected{selectAll ? ' (all)' : ''}</div>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onEdit} disabled={loading}>Edit Category</Button>
        <Button variant="ghost" onClick={onDelete} disabled={loading}>Delete</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}
