"use client"
import React from 'react'

export function Progress({ value = 0, max = 100, className = '' }: { value?: number; max?: number; className?: string }){
  const pct = Math.max(0, Math.min(max, Number(value)))
  const pctRounded = Math.round(pct / 5) * 5
  const pctClassMap: Record<number, string> = {
    0: 'w-0', 5: 'w-[5%]', 10: 'w-[10%]', 15: 'w-[15%]', 20: 'w-[20%]', 25: 'w-[25%]', 30: 'w-[30%]', 35: 'w-[35%]', 40: 'w-[40%]', 45: 'w-[45%]', 50: 'w-[50%]', 55: 'w-[55%]', 60: 'w-[60%]', 65: 'w-[65%]', 70: 'w-[70%]', 75: 'w-[75%]', 80: 'w-[80%]', 85: 'w-[85%]', 90: 'w-[90%]', 95: 'w-[95%]', 100: 'w-[100%]'
  }
  return (
    <div className={`relative ${className}`} role="progressbar" aria-label={`Progress ${pct}%`}>
      <div className="w-full bg-[var(--bg-subtle)] rounded h-full">
        <div className={`h-full bg-primary rounded transition-all ${pctClassMap[pctRounded] || 'w-0'}`} />
      </div>
      <span className="sr-only">{pct}%</span>
    </div>
  )
}

export default Progress

