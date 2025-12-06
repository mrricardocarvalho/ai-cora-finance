"use client"

import React from 'react'
import { 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ForecastDay } from '@/lib/intelligence/forecast'

interface ForecastChartProps {
  data: ForecastDay[]
  comfortFloor: number
  className?: string
}

export function ForecastChart({ data, comfortFloor, className }: ForecastChartProps) {
  const chartData = data.map(day => ({
    date: day.date,
    balance: day.projectedBalance,
    formattedDate: format(parseISO(day.date), 'MMM d'),
    events: day.events
  }))

  const minValue = Math.min(...chartData.map(d => d.balance), comfortFloor) * 0.9
  const maxValue = Math.max(...chartData.map(d => d.balance), comfortFloor) * 1.1

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dayData = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg text-sm">
          <p className="font-medium mb-1">{dayData.formattedDate}</p>
          <p className="text-primary font-bold mb-2">
            {formatCurrency(dayData.balance)}
          </p>
          {dayData.events.length > 0 && (
            <div className="space-y-1 border-t pt-2 mt-1">
              {dayData.events.map((event: any, idx: number) => (
                <div key={idx} className="flex justify-between gap-4 text-xs">
                  <span className="text-muted-foreground">{event.description}</span>
                  <span className={event.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {event.amount >= 0 ? '+' : ''}{formatCurrency(event.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Cash Flow Forecast</CardTitle>
        <CardDescription>Projected balance for the next {data.length} days</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="formattedDate" 
              minTickGap={30}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={[minValue, maxValue]}
              tickFormatter={(value) => `€${value}`}
              tick={{ fontSize: 12 }}
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip content={<CustomTooltip />} />
            
            <ReferenceLine 
              y={comfortFloor} 
              stroke="#ef4444" 
              strokeDasharray="3 3" 
              label={{ 
                value: 'Comfort Floor', 
                position: 'insideBottomRight', 
                fill: '#ef4444',
                fontSize: 12
              }} 
            />
            
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="#2563eb" 
              fillOpacity={1} 
              fill="url(#colorBalance)" 
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
