"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '../../lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = React.useState('Processing authentication...')

  React.useEffect(() => {
    const handleAuthCallback = async () => {
      const client = getSupabaseClient()
      if (!client) {
        setStatus('Configuration error. Redirecting to login...')
        setTimeout(() => router.replace('/login?error=config'), 1500)
        return
      }

      // Handle the OAuth callback - Supabase will automatically exchange the code
      const { data: { session }, error } = await client.auth.getSession()
      
      if (error) {
        setStatus(`Authentication error: ${error.message}`)
        setTimeout(() => router.replace('/login'), 2000)
        return
      }

      if (session) {
        setStatus('Setting up your account...')
        
        // Ensure user profile exists
        const { data: existingProfile } = await client
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle()
        
        if (!existingProfile) {
          // Create profile for new user
          const { error: profileError } = await client
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              comfort_floor: 500, // Default comfort floor
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Lisbon'
            })
          
          if (profileError) {
            console.warn('Failed to create profile:', profileError.message)
          }
        }
        
        setStatus('Authenticated! Redirecting...')
        // Force full page reload to ensure cookies are properly set
        window.location.href = '/'
      } else {
        setStatus('No session found. Redirecting to login...')
        setTimeout(() => router.replace('/login'), 1500)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="p-6 bg-surface rounded-md border text-center">
        <div className="animate-pulse mb-4">
          <div className="w-8 h-8 mx-auto rounded-full bg-primary"></div>
        </div>
        <p>{status}</p>
      </div>
    </div>
  )
}
