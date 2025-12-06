import fs from 'fs'
import { Client } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

// Get SQL file path from command line argument or use default
const sqlPath = process.argv[2] || './db/migrations/0003_fix_rls_compare.sql'
const sql = fs.readFileSync(sqlPath, 'utf8')
const client = new Client({ connectionString: process.env.DATABASE_URL })

async function run(){
  await client.connect()
  console.log('Connected to DB, applying SQL from', sqlPath)
  await client.query(sql)
  console.log('SQL executed successfully')
  await client.end()
}

run().catch(e=>{ console.error(e); process.exit(1) })
