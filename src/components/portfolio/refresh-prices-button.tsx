"use client"
import React, { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import Button from '../ui/button'
import { useToast } from '../ui/toast-provider'
import { useRouter } from 'next/navigation'

export default function RefreshPricesButton() {
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const router = useRouter()

  async function handleRefresh() {
    setLoading(true)
    try {
      const res = await fetch('/api/portfolio/refresh-prices', { method: 'POST' })
      const json = await res.json()
      
      if (json.success) {
        toast('success', `Updated ${json.updated} price${json.updated !== 1 ? 's' : ''}`)
        router.refresh()
      } else {
        toast('error', json.error || 'Failed to refresh prices')
      }
    } catch (err) {
      toast('error', 'Failed to refresh prices')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleRefresh} 
      disabled={loading}
      className="gap-2"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Updating...' : 'Refresh Prices'}
    </Button>
  )
}
