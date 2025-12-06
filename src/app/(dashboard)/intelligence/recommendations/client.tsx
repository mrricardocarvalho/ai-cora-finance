"use client"

import React, { useState, useEffect } from 'react'
import { Recommendation } from '@/lib/intelligence/recommendations'
import { RecommendationCard } from '@/components/intelligence/RecommendationCard'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function RecommendationsPageClient() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchRecommendations = async () => {
    try {
      const res = await fetch('/api/intelligence/recommendations')
      const data = await res.json()
      if (data.success) {
        setRecommendations(data.data || [])
      }
    } catch {
      console.error('Failed to fetch recommendations')
    } finally {
      setLoading(false)
    }
  }

  const refreshAnalysis = async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/intelligence/recommendations', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast({
          title: "Analysis Complete",
          description: `Found ${data.created?.length || 0} new recommendations.`,
        })
        fetchRecommendations()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh analysis.",
        variant: "destructive"
      })
    } finally {
      setRefreshing(false)
    }
  }

  const handleAction = async (id: string, action: 'completed' | 'dismissed' | 'snoozed') => {
    // Optimistic update
    setRecommendations(prev => prev.filter(r => r.id !== id))

    try {
      const res = await fetch('/api/intelligence/recommendations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: action })
      })
      if (!res.ok) throw new Error()
      
      toast({
        title: action === 'snoozed' ? "Snoozed" : action === 'dismissed' ? "Dismissed" : "Completed",
        description: "Recommendation updated.",
      })
    } catch (error) {
      // Revert on error (simplified, would need full state management for perfect revert)
      fetchRecommendations()
      toast({
        title: "Error",
        description: "Failed to update recommendation.",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [])

  if (loading) {
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
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            Smart Recommendations
          </h1>
          <p className="text-muted-foreground">
            AI-driven insights to improve your financial health.
          </p>
        </div>
        <Button onClick={refreshAnalysis} disabled={refreshing}>
          {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh Analysis
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No active recommendations</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2">
            You&apos;re doing great! Check back later or click refresh to run a new analysis.
          </p>
          <Button variant="outline" className="mt-4" onClick={refreshAnalysis} disabled={refreshing}>
            Run Analysis Now
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map(rec => (
            <RecommendationCard 
              key={rec.id} 
              recommendation={rec} 
              onAction={handleAction} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
