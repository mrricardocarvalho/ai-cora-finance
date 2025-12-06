"use client"
import React from 'react'

export default function Skeleton({ className = '', children, as = 'div' }: { className?: string; children?: React.ReactNode; as?: any }){
  const Tag = as as any
  return (
    <Tag aria-hidden="true" role="presentation" className={`animate-pulse bg-[var(--bg-subtle)] ${className}`}>{children}</Tag>
  )
}
