import { Client } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const client = new Client({ connectionString: process.env.DATABASE_URL })

async function run(){
  await client.connect()
  
  // Check auth.users to find user by email
  const users = await client.query(`
    SELECT id, email, created_at 
    FROM auth.users 
    WHERE email ILIKE '%ricarvalho%' OR email ILIKE '%outlook%'
    ORDER BY created_at DESC
  `)
  console.log('=== USERS MATCHING EMAIL ===')
  users.rows.forEach(u => {
    console.log(`  - ${u.email} | id: ${u.id} | created: ${u.created_at}`)
  })
  
  // If found, check their accounts
  if (users.rows.length > 0) {
    for (const user of users.rows) {
      const accounts = await client.query('SELECT * FROM public.accounts WHERE user_id = $1', [user.id])
      console.log(`\n=== ACCOUNTS FOR ${user.email} ===`)
      if (accounts.rowCount === 0) {
        console.log('  (no accounts found)')
      } else {
        accounts.rows.forEach(a => {
          console.log(`  - ${a.name} (${a.type}) - ${a.balance} @ ${a.institution}`)
        })
      }
    }
  }
  
  // Also check all auth users
  const allUsers = await client.query('SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 15')
  console.log('\n=== RECENT AUTH USERS ===')
  allUsers.rows.forEach(u => {
    console.log(`  - ${u.email} | ${u.id}`)
  })
  
  await client.end()
}

run().catch(e => { console.error(e); process.exit(1) })
