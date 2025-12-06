"use client"
import React, { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '../../lib/supabase/client'
import { Button } from '../../components/ui'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [showResetForm, setShowResetForm] = React.useState(false)

  // Check for config error from middleware
  React.useEffect(() => {
    if (searchParams.get('error') === 'config') {
      setMessage('Missing Supabase configuration. Please check your environment variables.')
    }
  }, [searchParams])

  // Check if user is already logged in
  React.useEffect(() => {
    const checkSession = async () => {
      const client = getSupabaseClient()
      if (!client) return
      
      const { data: { session } } = await client.auth.getSession()
      if (session) {
        router.push('/')
      }
    }
    checkSession()
  }, [router])

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      setMessage('Please enter your email address.')
      return
    }
    setMessage('')
    setIsLoading(true)
    
    const client = getSupabaseClient()
    if (!client) {
      setMessage('Missing Supabase configuration. Please check environment variables.')
      setIsLoading(false)
      return
    }
    
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?type=recovery`
    })
    
    setIsLoading(false)
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for a password reset link.')
      setShowResetForm(false)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    setIsLoading(true)
    
    const client = getSupabaseClient()
    if (!client) {
      setMessage('Missing Supabase configuration. Please check environment variables.')
      setIsLoading(false)
      return
    }
    
    const { error } = await client.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`
      }
    })
    
    setIsLoading(false)
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for a confirmation link.')
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    setIsLoading(true)
    
    const client = getSupabaseClient()
    if (!client) {
      setMessage('Missing Supabase configuration. Please check environment variables.')
      setIsLoading(false)
      return
    }
    
    const { data, error } = await client.auth.signInWithPassword({ email, password })
    
    if (error) {
      setIsLoading(false)
      setMessage(error.message)
      return
    }
    
    // Ensure profile exists after sign in
    if (data.user) {
      const { data: existingProfile } = await client
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle()
      
      if (!existingProfile) {
        await client.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          comfort_floor: 500,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Lisbon'
        })
      }
    }
    
    setMessage('Signed in — redirecting...')
    // Force page reload to pick up new session cookies
    window.location.href = '/'
  }

  if (showResetForm) {
    return (
      <div className="w-full max-w-md bg-[var(--surface-glass)] backdrop-blur-xl p-8 rounded-2xl border border-[var(--border-glass)] shadow-[var(--shadow-elevated)]">
        <h1 className="text-xl font-semibold mb-6 text-[var(--text-primary)]">Reset Password</h1>
        <form className="space-y-5" onSubmit={handlePasswordReset}>
          <div>
            <label htmlFor="reset-email" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Email</label>
            <input 
              id="reset-email" 
              name="email" 
              type="email" 
              autoComplete="email" 
              required 
              disabled={isLoading}
              className="w-full p-3 bg-[var(--surface-glass)] backdrop-blur-sm border border-[var(--border-glass)] rounded-xl text-[var(--text-on-glass)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 disabled:opacity-50 transition-all duration-300" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowResetForm(false)} disabled={isLoading}>
              Back to Login
            </Button>
          </div>
          {message && (
            <div className={`text-sm p-3 rounded-xl ${message.includes('error') || message.includes('Missing') ? 'bg-[var(--danger-glass)] text-[var(--danger)]' : 'bg-[var(--success-glass)] text-[var(--success)]'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md bg-[var(--surface-glass)] backdrop-blur-xl p-8 rounded-2xl border border-[var(--border-glass)] shadow-[var(--shadow-elevated)]">
      <h1 className="text-xl font-semibold mb-6 text-[var(--text-primary)]">Login / Sign Up</h1>
      <form className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Email</label>
          <input 
            id="email" 
            name="email" 
            type="email" 
            autoComplete="email" 
            required 
            disabled={isLoading}
            className="w-full p-3 bg-[var(--surface-glass)] backdrop-blur-sm border border-[var(--border-glass)] rounded-xl text-[var(--text-on-glass)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 disabled:opacity-50 transition-all duration-300" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Password</label>
          <input 
            id="password" 
            name="password" 
            type="password" 
            autoComplete="current-password" 
            required 
            disabled={isLoading}
            className="w-full p-3 bg-[var(--surface-glass)] backdrop-blur-sm border border-[var(--border-glass)] rounded-xl text-[var(--text-on-glass)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 disabled:opacity-50 transition-all duration-300" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <Button type="button" variant="primary" onClick={handleSignIn} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Sign In'}
            </Button>
            <Button type="button" variant="ghost" onClick={handleSignUp} disabled={isLoading}>
              Sign Up
            </Button>
          </div>
          <button 
            type="button" 
            onClick={() => { setMessage(''); setShowResetForm(true) }}
            className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline text-left transition-colors"
          >
            Forgot your password?
          </button>
        </div>
        {message && (
          <div className={`text-sm p-3 rounded-xl ${message.includes('error') || message.includes('Missing') ? 'bg-[var(--danger-glass)] text-[var(--danger)]' : 'bg-[var(--surface-glass)] text-[var(--text-secondary)]'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}

function LoginFallback() {
  return (
    <div className="w-full max-w-md bg-[var(--surface-glass)] backdrop-blur-xl p-8 rounded-2xl border border-[var(--border-glass)] shadow-[var(--shadow-elevated)] animate-pulse">
      <div className="h-7 w-40 bg-[var(--border-glass)] rounded-lg mb-6" />
      <div className="space-y-5">
        <div className="h-12 bg-[var(--border-glass)] rounded-xl" />
        <div className="h-12 bg-[var(--border-glass)] rounded-xl" />
        <div className="h-11 w-28 bg-[var(--border-glass)] rounded-xl" />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-mesh-gradient">
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
