'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import crypto from 'crypto'

export async function createHousehold(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // 1. Create Household
  const { data: household, error: hhError } = await supabase
    .from('households')
    .insert({
      name,
      created_by: user.id
    })
    .select()
    .single()

  if (hhError) throw new Error(hhError.message)

  // 2. Add Creator as Admin
  const { error: memberError } = await supabase
    .from('household_members')
    .insert({
      household_id: household.id,
      user_id: user.id,
      role: 'admin'
    })

  if (memberError) {
    // Rollback household creation if member add fails (manual rollback since no transactions in HTTP API)
    await supabase.from('households').delete().eq('id', household.id)
    throw new Error(memberError.message)
  }

  revalidatePath('/settings/household')
  return household
}

export async function createInvite(householdId: string, email: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // Check if user is admin
  const { data: membership } = await supabase
    .from('household_members')
    .select('role')
    .eq('household_id', householdId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    throw new Error('Only admins can invite members')
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days

  const { data: invite, error } = await supabase
    .from('household_invites')
    .insert({
      household_id: householdId,
      email,
      token,
      invited_by: user.id,
      expires_at: expiresAt
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // TODO: Send email
  console.log(`[Household] Invite created for ${email}. Link: /household/join/${token}`)

  revalidatePath('/settings/household')
  return invite
}

export async function acceptInvite(token: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // If not logged in, we should probably redirect to login with return URL
    // But for server action, we expect auth.
    throw new Error('Please log in to accept the invite')
  }

  // 1. Validate Invite
  const { data: invite } = await supabase
    .from('household_invites')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!invite) throw new Error('Invalid or expired invite')

  // 2. Add Member
  const { error: memberError } = await supabase
    .from('household_members')
    .insert({
      household_id: invite.household_id,
      user_id: user.id,
      role: 'member'
    })

  if (memberError) {
    if (memberError.code === '23505') { // Unique violation
      throw new Error('You are already a member of this household')
    }
    throw new Error(memberError.message)
  }

  // 3. Mark Invite Accepted
  await supabase
    .from('household_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id)

  revalidatePath('/settings/household')
  redirect('/settings/household')
}

export async function leaveHousehold(householdId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // Check if last admin
  const { data: members } = await supabase
    .from('household_members')
    .select('*')
    .eq('household_id', householdId)

  const admins = members?.filter(m => m.role === 'admin') || []
  const isMeAdmin = admins.some(a => a.user_id === user.id)

  if (isMeAdmin && admins.length === 1 && members!.length > 1) {
    throw new Error('You must assign another admin before leaving')
  }

  // If last member, delete household?
  // For now, just leave. If last member leaves, household remains empty (or we can clean up).
  
  const { error } = await supabase
    .from('household_members')
    .delete()
    .eq('household_id', householdId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/settings/household')
}

export async function getHousehold() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: membership } = await supabase
    .from('household_members')
    .select(`
      role,
      joined_at,
      households (
        id,
        name,
        created_at,
        household_members (
          user_id,
          role,
          joined_at
        )
      )
    `)
    .eq('user_id', user.id)
    .single()

  if (!membership) return null

  return {
    ...membership.households,
    my_role: membership.role
  }
}
