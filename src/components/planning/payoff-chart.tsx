"use client"
import React from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { formatMonthYear } from '../../lib/utils'

export default function PayoffChart({ baseline, strategy, colorBaseline = '#64748B', colorStrategy = '#0D9488' }: { baseline: any[]; strategy: any[]; colorBaseline?: string; colorStrategy?: string }){
  // Map graph data to a common data array by month
  const months = Math.max(baseline.length, strategy.length)
  const data = Array.from({ length: months }, (_, i)=>({
    month: i + 1,
    date: baseline[i]?.date ? formatMonthYear(baseline[i].date) : (strategy[i]?.date ? formatMonthYear(strategy[i].date) : ''),
    baseline: baseline[i]?.totalBalance ?? null,
    strategy: strategy[i]?.totalBalance ?? null
  }))

  const interval = Math.max(0, Math.ceil(months / 12) - 1)
  return (
    <div className="w-full h-80">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" interval={interval} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line dot={false} type="monotone" name="Baseline" dataKey="baseline" stroke={colorBaseline} strokeWidth={2} strokeDasharray="5 5" opacity={0.7} />
          <Line dot={false} type="monotone" name="Strategy" dataKey="strategy" stroke={colorStrategy} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
