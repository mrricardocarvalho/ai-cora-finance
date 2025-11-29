"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '../../lib/supabase/client'
import { Button } from '../../components/ui'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [message, setMessage] = React.useState('')

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    const client = getSupabaseClient()
    if (!client) { setMessage('Missing Supabase configuration'); return }
    const { error } = await client.auth.signUp({ email, password })
    if (error) setMessage(error.message)
    else setMessage('Check email for confirmation link.')
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    const client = getSupabaseClient()
    if (!client) { setMessage('Missing Supabase configuration'); return }
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    else { setMessage('Signed in — redirecting...'); router.push('/dashboard') }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface p-6 rounded-md border">
        <h1 className="text-lg font-semibold mb-4">Login / Sign Up</h1>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required className="w-full p-2 border rounded" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required className="w-full p-2 border rounded" value={password} onChange={(e)=>setPassword(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="primary" onClick={handleSignIn}>Sign In</Button>
            <Button type="button" variant="ghost" onClick={handleSignUp}>Sign Up</Button>
          </div>
          {message && <div className="text-sm text-slate-500">{message}</div>}
        </form>
      </div>
    </div>
  )
}
