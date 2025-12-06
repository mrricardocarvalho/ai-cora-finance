import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWeeklySummary } from '@/lib/intelligence/weekly-summary'

export async function GET(request: Request) {
  // Verify cron secret if needed (skip for now as per dev env)
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = await createClient()
  
  // Get all users who have completed onboarding
  const { data: users } = await supabase.from('profiles')
    .select('id')
    .eq('onboarding_completed', true)
  
  if (!users) return NextResponse.json({ success: true, processed: 0 })

  let processed = 0
  const errors = []

  for (const user of users) {
    try {
      await generateWeeklySummary(user.id)
      processed++
    } catch (e) {
      console.error(`Failed to generate summary for ${user.id}`, e)
      errors.push(user.id)
    }
  }

  return NextResponse.json({ success: true, processed, errors })
}
