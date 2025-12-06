"use client"

import React, { useState, useEffect } from 'react'
import { CashFlowForecast, WhatIfScenario } from '@/lib/intelligence/forecast'
import { ForecastChart } from '@/components/intelligence/ForecastChart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function ForecastPageClient() {
  const [forecast, setForecast] = useState<CashFlowForecast | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState('30')
  const [scenarios, setScenarios] = useState<WhatIfScenario[]>([])
  
  // New Scenario Form State
  const [newScenarioAmount, setNewScenarioAmount] = useState('')
  const [newScenarioDesc, setNewScenarioDesc] = useState('')
  const [newScenarioDate, setNewScenarioDate] = useState('')

  const fetchForecast = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        days: days,
        whatIf: JSON.stringify(scenarios)
      })
      
      const res = await fetch(`/api/intelligence/forecast?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch forecast')
      
      const data = await res.json()
      setForecast(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchForecast()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, scenarios])

  const addScenario = () => {
    if (!newScenarioAmount || !newScenarioDesc || !newScenarioDate) return

    const amount = parseFloat(newScenarioAmount)
    if (isNaN(amount)) return

    const newScenario: WhatIfScenario = {
      amount,
      description: newScenarioDesc,
      date: newScenarioDate
    }

    setScenarios([...scenarios, newScenario])
    setNewScenarioAmount('')
    setNewScenarioDesc('')
    setNewScenarioDate('')
  }

  const removeScenario = (index: number) => {
    const newScenarios = [...scenarios]
    newScenarios.splice(index, 1)
    setScenarios(newScenarios)
  }

  if (loading && !forecast) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cash Flow Forecast</h1>
          <p className="text-muted-foreground">
            Predict your future balance based on recurring expenses and income patterns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Next 30 Days</SelectItem>
              <SelectItem value="60">Next 60 Days</SelectItem>
              <SelectItem value="90">Next 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {forecast?.floorCrossingDate && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning: Comfort Floor Breach</AlertTitle>
          <AlertDescription>
            You are projected to dip below your comfort floor of {formatCurrency(forecast.comfortFloor)} on {format(new Date(forecast.floorCrossingDate), 'MMMM d, yyyy')}.
          </AlertDescription>
        </Alert>
      )}

      {forecast && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 space-y-6">
            <ForecastChart 
              data={forecast.days} 
              comfortFloor={forecast.comfortFloor} 
            />
            
            {/* Upcoming Events Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Detected recurring transactions and predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {forecast.days
                    .filter(d => d.events.length > 0)
                    .slice(0, 10) // Show first 10 days with events
                    .map((day, i) => (
                      <div key={i} className="border-b pb-3 last:border-0 last:pb-0">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          {format(new Date(day.date), 'EEEE, MMM d')}
                        </h4>
                        <div className="space-y-2">
                          {day.events.map((event, j) => (
                            <div key={j} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <Badge variant={event.source === 'predicted' ? 'outline' : event.source === 'hypothetical' ? 'secondary' : 'default'}>
                                  {event.source}
                                </Badge>
                                <span>{event.description}</span>
                              </div>
                              <span className={`font-medium ${event.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {event.amount >= 0 ? '+' : ''}{formatCurrency(event.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: What-If Scenarios */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What-If Scenarios</CardTitle>
                <CardDescription>Add hypothetical transactions to see their impact</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    placeholder="e.g. New Laptop" 
                    value={newScenarioDesc}
                    onChange={(e) => setNewScenarioDesc(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount (+/-)</Label>
                  <Input 
                    type="number" 
                    placeholder="-1500" 
                    value={newScenarioAmount}
                    onChange={(e) => setNewScenarioAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input 
                    type="date" 
                    value={newScenarioDate}
                    onChange={(e) => setNewScenarioDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    max={format(addDays(new Date(), parseInt(days)), 'yyyy-MM-dd')}
                  />
                </div>
                <Button className="w-full" onClick={addScenario} disabled={!newScenarioAmount || !newScenarioDesc || !newScenarioDate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Scenario
                </Button>

                {scenarios.length > 0 && (
                  <div className="pt-4 space-y-2">
                    <Label>Active Scenarios</Label>
                    {scenarios.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                        <div>
                          <div className="font-medium">{s.description}</div>
                          <div className="text-xs text-muted-foreground">{s.date}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={s.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(s.amount)}
                          </span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeScenario(idx)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forecast Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Starting Balance</span>
                  <span className="font-medium">{formatCurrency(forecast.startingBalance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ending Balance</span>
                  <span className="font-medium">{formatCurrency(forecast.days[forecast.days.length - 1].projectedBalance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Lowest Point</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(Math.min(...forecast.days.map(d => d.projectedBalance)))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Confidence</span>
                  <Badge variant={forecast.confidence === 'high' ? 'default' : forecast.confidence === 'medium' ? 'secondary' : 'danger'}>
                    {forecast.confidence.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
