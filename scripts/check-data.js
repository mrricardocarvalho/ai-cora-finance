import { Client } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const client = new Client({ connectionString: process.env.DATABASE_URL })

async function run(){
  await client.connect()
  console.log('Connected to DB')
  
  // Check holdings data
  const holdings = await client.query('SELECT * FROM public.holdings LIMIT 5')
  console.log('Holdings count:', holdings.rowCount)
  console.log('Holdings data:', holdings.rows)
  
  // Check accounts data
  const accounts = await client.query('SELECT * FROM public.accounts LIMIT 5')
  console.log('Accounts count:', accounts.rowCount)
  console.log('Accounts data:', accounts.rows)
  
  // Check assets data
  const assets = await client.query('SELECT * FROM public.assets LIMIT 5')
  console.log('Assets count:', assets.rowCount)
  console.log('Assets data:', assets.rows)
  
  await client.end()
}

run().catch(e => { console.error(e); process.exit(1) })
