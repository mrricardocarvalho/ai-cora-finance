"use client"
import React from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts'
import { formatCurrency } from '../../lib/utils'

interface FIREChartProps {
  series: any[]
  fiNumber: number
  currentInvestments?: number
  colorNetWorth?: string
  colorInvestments?: string
  colorFI?: string
}

export default function FIREChart({ 
  series, 
  fiNumber, 
  currentInvestments = 0,
  colorNetWorth = '#0D9488', 
  colorInvestments = '#6366F1',
  colorFI = '#10B981' 
}: FIREChartProps){
  // Calculate investments growth projection (7% annual return, no additional contributions)
  const data = series.map((s, i) => {
    const investmentsGrowth = currentInvestments * Math.pow(1.07, i)
    return { 
      year: s.year, 
      date: new Date(s.date).getFullYear(), 
      netWorth: s.netWorth,
      investments: Math.round(investmentsGrowth)
    }
  })
  
  const crossing = data.find(d => d.netWorth >= fiNumber)
  
  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
          <YAxis 
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
              if (value >= 1000) return `${Math.round(value / 1000)}k`
              return value
            }}
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [formatCurrency(Number(value)), name]}
            contentStyle={{ 
              backgroundColor: 'var(--bg-surface)', 
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <ReferenceLine 
            y={fiNumber} 
            stroke={colorFI} 
            label={{ value: 'FI Target', position: 'right', fill: 'var(--text-secondary)', fontSize: 11 }} 
            strokeDasharray="3 3" 
          />
          {/* Investments only line (no additional savings) */}
          {currentInvestments > 0 && (
            <Line 
              dot={false} 
              type="monotone" 
              name="Investments Only" 
              dataKey="investments" 
              stroke={colorInvestments} 
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}
          {/* Projected Net Worth (with savings) */}
          <Line 
            dot={false} 
            type="monotone" 
            name="Projected Net Worth" 
            dataKey="netWorth" 
            stroke={colorNetWorth} 
            strokeWidth={2} 
          />
          {crossing && (
            <ReferenceDot 
              x={crossing.date} 
              y={crossing.netWorth} 
              r={6} 
              fill={colorNetWorth} 
              stroke="white"
              label={{ 
                position: 'top', 
                value: `🎉 ${crossing.date}`, 
                fill: 'var(--text-primary)',
                fontSize: 12
              }} 
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
