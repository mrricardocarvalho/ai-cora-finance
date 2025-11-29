import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import crypto from 'crypto'

dotenv.config()
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const pubKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const srKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if(!url || !pubKey || !srKey){
  console.error('Missing env vars'); process.exit(1)
}
  console.log('Using pubKey === srKey?', pubKey === srKey)

const anonClient = createClient(url, pubKey)
const adminClient = createClient(url, srKey)

async function run(){
  const uidA = 'rls-test-a-'+Date.now()
  const emailA = `rls-test-a-${Date.now()}@example.com`
  const pwd = 'Password123!'
  // Create user A via service role to avoid client-side email validation
  console.log('Creating user A via admin api')
  const r = await adminClient.auth.admin.createUser({ email: emailA, password: pwd, email_confirm: true })
  console.log('Create user A response:', JSON.stringify(r, null, 2))
  // get user id
  const userId = r.data?.user?.id
  if(!userId){ console.error('No user id from signUp'); process.exit(1)}
  console.log('User A id:', userId)
  // Create a profile for user A (required for FK) and an account via service role
  const p = await adminClient.from('profiles').insert([{ id: userId, email: emailA }]).select()
  console.log('Profile create:', p.error, p.data)
  const acc = await adminClient.from('accounts').insert([{ id: crypto.randomUUID(), user_id: userId, name: 'Account A', type: 'checking', balance: 100.00, institution: 'TestBank' }]).select()
  console.log('Account create:', acc.error, acc.data)

  // Sign in as user A to get session
  const s = await anonClient.auth.signInWithPassword({ email: emailA, password: pwd })
  if(s.error){ console.error('Sign in error:', s.error); process.exit(1)}
  const token = s.data.session?.access_token
  console.log('Token A snippet:', token?.slice(0, 20))
  // decode payload
  if(token){
    const payload = token.split('.')[1]
    const decoded = Buffer.from(payload, 'base64').toString('utf-8')
    console.log('Token A payload:', decoded)
  }
  const clientA = createClient(url, pubKey, { global: { headers: { Authorization: `Bearer ${token}` } } })
  // fetch accounts as userA
  const a1 = await clientA.from('accounts').select('*')
  console.log('User A accounts:', a1.error, a1.data)

  // Direct REST fetch with Authorization header (bypassing supabase client) to check RLS behavior
  const restA = await fetch(`${url}/rest/v1/accounts`, { headers: { Authorization: `Bearer ${token}`, apikey: pubKey } })
  const restAData = await restA.json()
  console.log('Direct REST User A accounts:', restAData)
  // Check auth.uid() via helper view
  const restAUid = await fetch(`${url}/rest/v1/v_auth_uid`, { headers: { Authorization: `Bearer ${token}`, apikey: pubKey } })
  console.log('Direct REST auth.uid() for A:', await restAUid.json())

  // Create user B via service role
  const emailB = `rls-test-b-${Date.now()}@example.com`
  const r2 = await adminClient.auth.admin.createUser({ email: emailB, password: pwd, email_confirm: true })
  console.log('Create user B response:', JSON.stringify(r2, null, 2))
  const userIdB = r2.data?.user?.id
  // Create profile for B so FK allows account creation
  const pB = await adminClient.from('profiles').insert([{ id: userIdB, email: emailB }]).select()
  console.log('Profile create B:', pB.error, pB.data)
  console.log('User B id:', userIdB)
  const s2 = await anonClient.auth.signInWithPassword({ email: emailB, password: pwd })
  const tokenB = s2.data.session?.access_token
  console.log('Token B snippet:', tokenB?.slice(0,20))
  if(tokenB){
    const payloadB = tokenB.split('.')[1]
    const decodedB = Buffer.from(payloadB, 'base64').toString('utf-8')
    console.log('Token B payload:', decodedB)
  }
  const clientB = createClient(url, pubKey, { global: { headers: { Authorization: `Bearer ${tokenB}` } } })
  const b1 = await clientB.from('accounts').select('*')
  console.log('User B accounts (should not include A):', b1.error, b1.data)

  const restB = await fetch(`${url}/rest/v1/accounts`, { headers: { Authorization: `Bearer ${tokenB}`, apikey: pubKey } })
  const restBData = await restB.json()
  console.log('Direct REST User B accounts (should not include A):', restBData)
  const restBUid = await fetch(`${url}/rest/v1/v_auth_uid`, { headers: { Authorization: `Bearer ${tokenB}`, apikey: pubKey } })
  console.log('Direct REST auth.uid() for B:', await restBUid.json())

  // Try inserting account for user A as user B (should fail)
  const tryInsertA = await clientB.from('accounts').insert([{ id: crypto.randomUUID(), user_id: userId, name: 'Account A for B', type: 'checking', balance: 10.00, institution: 'TestBank' }])
  console.log('User B inserting account for A (should fail):', tryInsertA.error, tryInsertA.data)

  // Try inserting account for user B as user B (should succeed)
  const tryInsertB = await clientB.from('accounts').insert([{ id: crypto.randomUUID(), user_id: userIdB, name: 'Account B own', type: 'checking', balance: 5.00, institution: 'TestBank' }]).select()
  console.log('User B inserting account for B (should succeed):', tryInsertB.error, tryInsertB.data)

}

run().catch(e=>{ console.error(e); process.exit(1) })
