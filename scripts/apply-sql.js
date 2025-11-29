import fs from 'fs'
import { Client } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const sqlPath = './db/migrations/0003_fix_rls_compare.sql'
const sql = fs.readFileSync(sqlPath, 'utf8')
const sqlView = `create or replace view public.v_auth_uid as select auth.uid() as uid`;
const client = new Client({ connectionString: process.env.DATABASE_URL })

async function run(){
  await client.connect()
  console.log('Connected to DB, applying SQL from', sqlPath)
  await client.query(sql)
  // Create a helper view for testing auth.uid()
  await client.query(sqlView)
  console.log('SQL executed')
  await client.end()
}

run().catch(e=>{ console.error(e); process.exit(1) })
