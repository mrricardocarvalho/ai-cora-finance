import { Client } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const client = new Client({ connectionString: process.env.DATABASE_URL })

async function run(){
  await client.connect()
  
  // Check all accounts
  const accounts = await client.query('SELECT id, user_id, name, type, balance, institution FROM public.accounts ORDER BY updated_at DESC')
  console.log('=== ALL ACCOUNTS ===')
  console.log('Total:', accounts.rowCount)
  accounts.rows.forEach(a => {
    console.log(`  - ${a.name} (${a.type}) - ${a.balance} @ ${a.institution}`)
    console.log(`    user_id: ${a.user_id}`)
  })
  
  // Check all profiles to see who the users are
  const profiles = await client.query('SELECT id, display_name, onboarding_completed FROM public.profiles')
  console.log('\n=== ALL USERS ===')
  profiles.rows.forEach(p => {
    console.log(`  - ${p.display_name || '(no name)'} | id: ${p.id} | onboarded: ${p.onboarding_completed}`)
  })
  
  await client.end()
}

run().catch(e => { console.error(e); process.exit(1) })
