'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Button from '@/components/ui/button'
import { acceptInvite } from '@/lib/household/actions'
import { Users, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  token: string
}

export function JoinHousehold({ token }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleJoin = async () => {
    setLoading(true)
    setError(null)
    try {
      await acceptInvite(token)
      // Redirect happens in action, but if not:
      router.push('/settings/household')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Join Household</CardTitle>
          <CardDescription>
            You&apos;ve been invited to manage shared finances.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3">
              <XCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 text-blue-700 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">
                Joining will allow you to see shared accounts and contribute to household goals.
              </p>
            </div>
          )}

          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleJoin} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              'Accept Invitation'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
