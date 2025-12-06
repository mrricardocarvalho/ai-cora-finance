"use client"
import React from 'react'

type Props = {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline'
  className?: string
}

export function Badge({ children, variant='default', className = '' }: Props){
  const base = 'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium'
  const variants = {
    default: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]',
    primary: 'bg-[var(--primary)]/10 text-[var(--primary)]',
    success: 'bg-[var(--success-light)] text-[var(--success)]',
    warning: 'bg-[var(--warning-light)] text-amber-700',
    danger: 'bg-[var(--danger-light)] text-[var(--danger)]',
    info: 'bg-[var(--info-light)] text-[var(--info)]',
    secondary: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]',
    outline: 'border border-[var(--border)] text-[var(--text-secondary)] bg-transparent'
  }
  return <span className={`${base} ${variants[variant as keyof typeof variants] || variants.default} ${className}`}>{children}</span>
}

export default Badge
