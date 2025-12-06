import getSafeToSpend from './safe-spend'

async function run(){
  const USER_ID = process.env.TEST_USER_ID
  if(!USER_ID){ console.error('Set TEST_USER_ID env var'); process.exit(1) }
  const res = await getSafeToSpend(USER_ID)
  console.log('SafeToSpend:', res)
}

run().catch(e=>{ console.error(e); process.exit(2) })
