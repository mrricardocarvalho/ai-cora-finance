"use client"
import React from 'react'
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../lib/utils'

export default function AllocationChart({ data }:{ data: { name: string; value: number; color?: string }[] }){
  const colors = data.map(d => d.color || '#8884d8')
  const total = data.reduce((sum, d) => sum + d.value, 0)
  
  // Sort by value descending for the legend
  const sortedData = [...data].sort((a, b) => b.value - a.value)
  
  return (
    <div className="flex flex-col">
      <div className="h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              dataKey="value" 
              data={data} 
              cx="50%" 
              cy="50%" 
              outerRadius={65} 
              innerRadius={30} 
              label={false}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`c-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string) => [formatCurrency(Math.round(value)), name]}
              contentStyle={{ 
                backgroundColor: 'var(--bg-surface)', 
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label with total */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {formatCurrency(Math.round(total))}
          </span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 px-2">
        {sortedData.map((item, i) => {
          const percent = total > 0 ? (item.value / total) * 100 : 0
          const originalIndex = data.findIndex(d => d.name === item.name)
          return (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <div 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                style={{ backgroundColor: colors[originalIndex] }}
              />
              <span className="text-[var(--text-secondary)] truncate flex-1">{item.name}</span>
              <span className="text-[var(--text-primary)] font-medium">{percent.toFixed(0)}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
