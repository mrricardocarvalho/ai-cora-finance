import { Client } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const client = new Client({ connectionString: process.env.DATABASE_URL })

async function run(){
  await client.connect()
  console.log('Connected to DB')
  
  // Check existing tables
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `)
  console.log('Existing tables:', tables.rows.map(r => r.table_name))
  
  // Check required tables
  const required = ['profiles', 'accounts', 'transactions', 'recurring_patterns', 'insights', 'monthly_summaries', 'assets', 'holdings', 'investment_transactions', 'goals', 'tax_exposure_cache']
  const existing = tables.rows.map(r => r.table_name)
  const missing = required.filter(t => !existing.includes(t))
  
  if (missing.length > 0) {
    console.log('MISSING TABLES:', missing)
  } else {
    console.log('All required tables exist!')
  }
  
  await client.end()
}

run().catch(e => { console.error(e); process.exit(1) })
