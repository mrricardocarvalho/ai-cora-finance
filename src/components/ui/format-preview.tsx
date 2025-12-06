"use client"
import React from 'react'
import { parseLocalizedNumber, formatCurrency } from '../../lib/utils'

export default function FormatPreview({ value }: { value?: string | number | null | undefined }){
  if (value === undefined || value === null || value === '') return null
  const n = typeof value === 'number' ? value : parseLocalizedNumber(String(value))
  return (
    <div className="text-sm text-[var(--text-muted)] mt-1" aria-hidden="true">{formatCurrency(n)}</div>
  )
}
