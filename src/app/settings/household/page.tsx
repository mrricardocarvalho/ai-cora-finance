import { HouseholdManagement } from '@/components/household/HouseholdManagement'
import { HouseholdDashboard } from '@/components/household/HouseholdDashboard'
import { getHousehold } from '@/lib/household/actions'
import { getHouseholdSummary } from '@/lib/household/summary'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function HouseholdPage() {
  const household = await getHousehold()
  const summary = household ? await getHouseholdSummary() : null

  return (
    <div className="container max-w-4xl py-8">
      {household && summary ? (
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <HouseholdDashboard summary={summary} />
          </TabsContent>
          <TabsContent value="manage">
            <HouseholdManagement initialData={household as any} />
          </TabsContent>
        </Tabs>
      ) : (
        <HouseholdManagement initialData={household as any} />
      )}
    </div>
  )
}
