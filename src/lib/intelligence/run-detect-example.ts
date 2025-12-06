import detectRecurringPatterns from './recurring'

async function run(){
  const userId = process.env.TEST_USER_ID
  if(!userId) { console.error('Please set TEST_USER_ID'); process.exit(1) }
  const res = await detectRecurringPatterns(userId)
  console.log('Result:', res)
}

run().catch(err=>{ console.error(err); process.exit(2) })
