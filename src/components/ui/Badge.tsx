"use client"
import React from 'react'

type Props = {
  children: React.ReactNode
  variant?: 'default'|'warning'
}

export function Badge({ children, variant='default' }: Props){
  const base = 'inline-flex items-center px-2 py-1 rounded text-sm'
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    warning: 'bg-yellow-100 text-yellow-900'
  }
  return <span className={`${base} ${variants[variant]}`}>{children}</span>
}

export default Badge
