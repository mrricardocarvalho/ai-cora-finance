'use client'

import React, { useState, useEffect } from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  ReferenceArea
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { AlertTriangle, TrendingDown, CalendarDays, Info } from 'lucide-react'
import { useTranslations } from '../../lib/i18n'
import { formatCurrency } from '../../lib/utils'

interface ForecastEvent {
  type: 'income' | 'expense'
  description: string
  amount: number
  source: 'recurring' | 'predicted' | 'hypothetical'
}

interface ForecastDay {
  date: string
  projectedBalance: number
  events: ForecastEvent[]
  confidence: 'high' | 'medium' | 'low'
}

interface CashFlowForecast {
  success: boolean
  days: ForecastDay[]
  startingBalance: number
  comfortFloor: number
  floorCrossingDate: string | null
  daysUntilFloor: number | null
  confidence: 'high' | 'medium' | 'low'
  error?: string
}

// AC #2: Color scheme for visual elements
const COLORS = {
  healthy: '#22c55e', // green-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  floor: '#ef4444',
  dangerZone: 'rgba(239, 68, 68, 0.1)'
}

// Custom tooltip component - AC #3
const CustomTooltip = ({ active, payload, label: _label }: { active?: boolean; payload?: Array<{ payload: ForecastDay }>; label?: string }) => {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload
  const date = parseISO(data.date)
  const formattedDate = format(date, 'MMM d, yyyy')

  return (
    <div className="bg-[var(--surface-glass)] backdrop-blur-xl border border-[var(--border-glass)] rounded-2xl p-3 shadow-float">
      <p className="font-medium text-[var(--text-primary)]">{formattedDate}</p>
      <p className="text-lg font-semibold text-[var(--text-primary)]">
        {formatCurrency(data.projectedBalance)}
      </p>
      {data.events.length > 0 && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-[var(--text-secondary)]">Scheduled:</p>
          {data.events.map((event, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className={event.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                {event.description}
              </span>
              <span className={event.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                {event.type === 'income' ? '+' : ''}{formatCurrency(event.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Get line color based on balance relative to floor - AC #2
function getLineColor(balance: number, floor: number): string {
  if (balance < floor) return COLORS.danger
  if (balance < floor * 1.2) return COLORS.warning
  return COLORS.healthy
}

// Skeleton loader
function ForecastSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 w-1/3 rounded-full bg-[var(--surface-subtle)]" />
      <div className="h-48 rounded-2xl bg-[var(--surface-glass)] border border-[var(--border-glass)] shadow-glass" />
    </div>
  )
}

export default function CashFlowForecastChart() {
  const t = useTranslations()
  const [forecast, setForecast] = useState<CashFlowForecast | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchForecast() {
      try {
        const res = await fetch('/api/intelligence/forecast?days=30')
        const data = await res.json()
        if (data.success) {
          setForecast(data)
        } else {
          setError(data.error || 'Failed to load forecast')
        }
      } catch {
        setError('Failed to load forecast')
      } finally {
        setLoading(false)
      }
    }
    fetchForecast()
  }, [])

  if (loading) {
    return (
      <div className="p-4 bg-[var(--surface-glass)] backdrop-blur-lg border border-[var(--border-glass)] rounded-2xl shadow-glass">
        <ForecastSkeleton />
      </div>
    )
  }

  if (error || !forecast) {
    return (
      <div className="p-4 bg-[var(--surface-glass)] backdrop-blur-lg border border-[var(--border-glass)] rounded-2xl shadow-glass">
        <p className="text-[var(--text-muted)]">{error || 'Unable to generate forecast'}</p>
      </div>
    )
  }

  // Prepare chart data - simplify for mobile (AC #5)
  const chartData = forecast.days.map(day => ({
    ...day,
    displayDate: format(parseISO(day.date), 'MMM d'),
    isToday: day.date === forecast.days[0].date
  }))

  // Find floor crossing point for danger zone
  const floorCrossingIndex = forecast.floorCrossingDate
    ? chartData.findIndex(d => d.date === forecast.floorCrossingDate)
    : -1

  // Determine overall line color based on worst case
  const minBalance = Math.min(...chartData.map(d => d.projectedBalance))
  const lineColor = getLineColor(minBalance, forecast.comfortFloor)

  return (
    <div className="p-4 sm:p-5 bg-[var(--surface-glass)] backdrop-blur-lg border border-[var(--border-glass)] rounded-2xl shadow-glass hover:shadow-elevated transition-all duration-300 ease-smooth">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="font-semibold text-[var(--text-primary)]">
            {t.widgets.forecast.title}
          </h3>
        </div>
        
        {/* AC #5: Confidence indicator */}
        <div className="flex items-center gap-1 text-xs">
          <Info className="w-3 h-3" />
          <span className={`
            ${forecast.confidence === 'high' ? 'text-green-600' : ''}
            ${forecast.confidence === 'medium' ? 'text-amber-600' : ''}
            ${forecast.confidence === 'low' ? 'text-red-600' : ''}
          `}>
            {forecast.confidence === 'high' && t.widgets.forecast.highConfidence}
            {forecast.confidence === 'medium' && t.widgets.forecast.mediumConfidence}
            {forecast.confidence === 'low' && t.widgets.forecast.lowConfidence}
          </span>
        </div>
      </div>

      {/* AC #6: Days until floor warning */}
      {forecast.daysUntilFloor !== null && forecast.floorCrossingDate && (
        <div className="mb-4 p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">
              {forecast.daysUntilFloor} {t.widgets.forecast.daysUntilFloor}
            </p>
            <p className="text-sm text-red-600 dark:text-red-300 flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {format(parseISO(forecast.floorCrossingDate), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
      )}

      {/* Chart - AC #1, #2, #3, #4 */}
      <div className="h-48 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `€${Math.round(v / 1000)}k`}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* AC #4: Danger zone when below floor */}
            {floorCrossingIndex >= 0 && (
              <ReferenceArea
                x1={chartData[floorCrossingIndex]?.displayDate}
                x2={chartData[chartData.length - 1]?.displayDate}
                fill={COLORS.dangerZone}
                fillOpacity={1}
              />
            )}
            
            {/* AC #2: Comfort floor line */}
            <ReferenceLine 
              y={forecast.comfortFloor} 
              stroke={COLORS.floor}
              strokeDasharray="5 5"
              label={{ 
                value: t.widgets.forecast.comfortFloor, 
                position: 'right',
                fill: COLORS.floor,
                fontSize: 10
              }}
            />
            
            {/* Main balance line - AC #2: color transitions */}
            <Line
              type="monotone"
              dataKey="projectedBalance"
              stroke={lineColor}
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload, index } = props
                // Show dots for days with events
                if (payload.events && payload.events.length > 0) {
                  return (
                    <circle
                      key={`dot-${index}`}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={payload.events[0].type === 'income' ? COLORS.healthy : COLORS.warning}
                      stroke="white"
                      strokeWidth={2}
                    />
                  )
                }
                return <circle key={`dot-empty-${index}`} cx={cx} cy={cy} r={0} />
              }}
              activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-[var(--text-secondary)]">{t.widgets.forecast.currentBalance}</p>
          <p className="font-semibold text-[var(--text-primary)]">
            {formatCurrency(forecast.startingBalance)}
          </p>
        </div>
        <div>
          <p className="text-[var(--text-secondary)]">{t.widgets.forecast.projected30Days}</p>
          <p className={`font-semibold ${
            chartData[chartData.length - 1]?.projectedBalance >= forecast.comfortFloor 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {formatCurrency(chartData[chartData.length - 1]?.projectedBalance || 0)}
          </p>
        </div>
      </div>
    </div>
  )
}
