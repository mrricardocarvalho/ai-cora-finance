import { recalculateMonthlySummary, getQuickStats } from '../actions/analytics'
import { createClient } from '../supabase/server'

async function run(){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) { console.error('No server user'); process.exit(1) }
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const res = await recalculateMonthlySummary(user.id, d)
  console.log('recalc result:', res)
  const stats = await getQuickStats(user.id)
  console.log('quick stats:', stats)
}

run().catch(e=>{ console.error(e); process.exit(2) })
