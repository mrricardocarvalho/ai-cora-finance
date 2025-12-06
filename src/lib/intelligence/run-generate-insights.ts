import { generateInsights, getInsights } from './insights'
import { createClient } from '../supabase/server'

async function run(){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) { console.error('No auth user in server client'); process.exit(1) }
  const res = await generateInsights(user.id)
  console.log('generate res', res)
  const list = await getInsights(user.id)
  console.log('insights:', list)
}

run().catch(e=>{ console.error(e); process.exit(2) })
