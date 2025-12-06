import { Client } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const client = new Client({ connectionString: process.env.DATABASE_URL })

async function run(){
  await client.connect()
  console.log('Connected to DB')
  
  // Get the user ID for ricarvalho@outlook.com
  const userRes = await client.query(`SELECT id FROM auth.users WHERE email = 'ricarvalho@outlook.com'`)
  if (userRes.rowCount === 0) {
    console.log('User ricarvalho@outlook.com not found!')
    await client.end()
    return
  }
  const keepUserId = userRes.rows[0].id
  console.log(`Keeping data for user: ${keepUserId}`)
  
  // Delete in correct order (child tables first to respect foreign keys)
  
  // Delete transactions first (references accounts)
  const txDel = await client.query('DELETE FROM public.transactions WHERE user_id != $1 RETURNING id', [keepUserId])
  console.log(`Deleted ${txDel.rowCount} transactions`)
  
  // Delete holdings (references accounts)
  const holdDel = await client.query('DELETE FROM public.holdings WHERE user_id != $1 RETURNING id', [keepUserId])
  console.log(`Deleted ${holdDel.rowCount} holdings`)
  
  // Delete investment_transactions (references accounts)
  const invDel = await client.query('DELETE FROM public.investment_transactions WHERE user_id != $1 RETURNING id', [keepUserId])
  console.log(`Deleted ${invDel.rowCount} investment_transactions`)
  
  // Delete goals (may reference accounts)
  const goalDel = await client.query('DELETE FROM public.goals WHERE user_id != $1 RETURNING id', [keepUserId])
  console.log(`Deleted ${goalDel.rowCount} goals`)
  
  // Now delete accounts
  const accDel = await client.query('DELETE FROM public.accounts WHERE user_id != $1 RETURNING id', [keepUserId])
  console.log(`Deleted ${accDel.rowCount} accounts`)
  
  // Delete insights
  const insDel = await client.query('DELETE FROM public.insights WHERE user_id != $1 RETURNING id', [keepUserId])
  console.log(`Deleted ${insDel.rowCount} insights`)
  
  // Delete monthly_summaries
  const sumDel = await client.query('DELETE FROM public.monthly_summaries WHERE user_id != $1 RETURNING id', [keepUserId])
  console.log(`Deleted ${sumDel.rowCount} monthly_summaries`)
  
  // Delete recurring_patterns
  const recDel = await client.query('DELETE FROM public.recurring_patterns WHERE user_id != $1 RETURNING id', [keepUserId])
  console.log(`Deleted ${recDel.rowCount} recurring_patterns`)
  
  // Delete tax_exposure_cache
  const taxDel = await client.query('DELETE FROM public.tax_exposure_cache WHERE user_id != $1', [keepUserId])
  console.log(`Deleted ${taxDel.rowCount} tax_exposure_cache`)

  // Delete profiles not belonging to this user
  const profDel = await client.query('DELETE FROM public.profiles WHERE id != $1', [keepUserId])
  console.log(`Deleted ${profDel.rowCount} profiles`)

  // Delete test users from auth.users (not the main user)
  const authDel = await client.query(`DELETE FROM auth.users WHERE id != $1`, [keepUserId])
  
  console.log('\nCleanup complete!')
  
  // Show remaining data
  const remaining = await client.query('SELECT COUNT(*) as cnt FROM public.accounts WHERE user_id = $1', [keepUserId])
  console.log(`Remaining accounts for your user: ${remaining.rows[0].cnt}`)
  
  await client.end()
}

run().catch(e => { console.error(e); process.exit(1) })
