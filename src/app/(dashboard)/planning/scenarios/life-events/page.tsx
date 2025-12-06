import React from 'react'
import { extractBaseline } from '@/lib/planning/scenario-data'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import LifeEventPageClient from './client'

export default async function LifeEventPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div className="p-8 text-center">Please sign in to access scenarios.</div>
  }

  try {
    const baseline = await extractBaseline(user.id)
    return <LifeEventPageClient baseline={baseline} />
  } catch (error) {
    console.error('Failed to load baseline:', error)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load financial data. Please try again later.
      </div>
    )
  }
}
