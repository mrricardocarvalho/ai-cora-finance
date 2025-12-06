'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Button from '@/components/ui/button'
import PromptDialog from '@/components/ui/prompt-dialog'
import { InviteMemberForm } from './InviteMemberForm'
import { createHousehold, leaveHousehold } from '@/lib/household/actions'
import { Users, LogOut, Plus, Shield, User } from 'lucide-react'
import { format } from 'date-fns'

interface HouseholdData {
  id: string
  name: string
  created_at: string
  my_role: string
  household_members: {
    user_id: string
    role: string
    joined_at: string
  }[]
}

interface Props {
  initialData: HouseholdData | null
}

export function HouseholdManagement({ initialData }: Props) {
  const [household] = useState<HouseholdData | null>(initialData)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCreate = async (name: string) => {
    setShowCreateDialog(false)
    setLoading(true)
    try {
      await createHousehold(name)
      // Refresh page or update state. Since createHousehold revalidates path, 
      // we might just need to reload or wait for server action to update UI if we used a server component wrapper.
      // But here we are in client component. 
      // For simplicity, we'll reload to get fresh data or we could optimistically update if we had full user object.
      window.location.reload() 
    } catch (error) {
      console.error(error)
      alert('Failed to create household')
    } finally {
      setLoading(false)
    }
  }

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this household?')) return
    setLoading(true)
    try {
      await leaveHousehold(household!.id)
      window.location.reload()
    } catch (error) {
      console.error(error)
      alert('Failed to leave household')
    } finally {
      setLoading(false)
    }
  }

  if (!household) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Household</h2>
            <p className="text-muted-foreground">Manage shared finances with your partner or family.</p>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-semibold">Create a Household</h3>
              <p className="text-muted-foreground">
                Combine your financial power. Track shared expenses, goals, and budgets together while keeping personal accounts private.
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              Create Household
            </Button>
          </CardContent>
        </Card>

        <PromptDialog
          open={showCreateDialog}
          title="Name your Household"
          placeholder="e.g. The Smiths"
          onCancel={() => setShowCreateDialog(false)}
          onConfirm={handleCreate}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{household.name}</h2>
          <p className="text-muted-foreground">
            Established {format(new Date(household.created_at), 'MMMM yyyy')}
          </p>
        </div>
        <Button variant="danger" onClick={handleLeave} disabled={loading}>
          <LogOut className="w-4 h-4 mr-2" />
          Leave Household
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>People with access to shared finances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {household.household_members.map((member) => (
              <div key={member.user_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-full">
                    {member.role === 'admin' ? (
                      <Shield className="w-4 h-4 text-primary" />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {member.user_id === household.household_members.find(m => m.role === 'admin')?.user_id ? 'Admin' : 'Member'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined {format(new Date(member.joined_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-xs font-medium px-2 py-1 bg-background rounded border">
                  {member.role}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {household.my_role === 'admin' && (
          <InviteMemberForm householdId={household.id} />
        )}
      </div>
    </div>
  )
}
