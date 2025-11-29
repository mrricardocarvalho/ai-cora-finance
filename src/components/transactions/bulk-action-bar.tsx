"use client"
import React from 'react'
import Button from '../ui/Button'

type Props = {
  count: number
  onEdit: () => void
  onDelete: () => void
  onCancel: () => void
  loading?: boolean
}

export default function BulkActionBar({ count, onEdit, onDelete, onCancel, loading }: Props){
  if (count === 0) return null
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white border p-3 rounded shadow-md flex gap-3 items-center z-50">
      <div className="font-medium">{count} item{count>1 ? 's' : ''} selected</div>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onEdit} disabled={loading}>Edit Category</Button>
        <Button variant="ghost" onClick={onDelete} disabled={loading}>Delete</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}
