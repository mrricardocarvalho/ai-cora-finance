import React from 'react'
import NotificationManager from '../../../components/settings/notification-manager'
import NotificationForm from '../../../components/settings/notification-form'
import { getNotificationPreferences } from '../../../lib/actions/settings'
import { getHousehold } from '../../../lib/household/actions'
import { InstallButton } from '../../../components/shared/install-prompt'

export default async function NotificationsSettingsPage(){
  const res = await getNotificationPreferences()
  const prefs = res?.success ? res.data : undefined
  const household = await getHousehold()
  const hasHousehold = !!household
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">Notificações</h1>
      <p className="mt-2 text-[var(--text-secondary)]">Gere preferências de notificações push.</p>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <NotificationManager />
          <InstallButton />
        </div>
        <div>
          <NotificationForm initial={prefs} hasHousehold={hasHousehold} />
        </div>
      </div>
    </div>
  )
}
