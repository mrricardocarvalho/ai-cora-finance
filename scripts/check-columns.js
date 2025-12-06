import { Client } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const client = new Client({ connectionString: process.env.DATABASE_URL })

async function run(){
  await client.connect()
  
  const r = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name='accounts' 
    ORDER BY ordinal_position
  `)
  console.log('Accounts table columns:')
  r.rows.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`))
  
  await client.end()
}

run().catch(e => { console.error(e); process.exit(1) })
