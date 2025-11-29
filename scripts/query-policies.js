import { Client } from 'pg'
import dotenv from 'dotenv'
dotenv.config()
const client = new Client({ connectionString: process.env.DATABASE_URL })
async function run(){
  await client.connect()
  const res = await client.query("select polname, polcmd, polpermissive, polqual::text, polwithcheck::text from pg_policy where polrelid = 'public.accounts'::regclass")
  console.log('Policies for accounts:')
  console.log(res.rows)
  const tRes = await client.query("select polname, polcmd, polpermissive, polqual::text, polwithcheck::text from pg_policy where polrelid = 'public.transactions'::regclass")
  console.log('Policies for transactions:')
  console.log(tRes.rows)
  const rls = await client.query("select relname, relrowsecurity, relforcerowsecurity from pg_class where relname in ('accounts','transactions')")
  console.log('RLS status for tables:', rls.rows)
  await client.end()
}
run().catch(e=>{ console.error(e); process.exit(1) })
