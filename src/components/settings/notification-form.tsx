"use client"
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { notificationPreferencesSchema, NotificationPreferences } from '../../lib/validations/notifications'
import { updateNotificationPreferences } from '../../lib/actions/settings'
import { useToast } from '../ui/toast-provider'
import { useNetworkStatus } from '../shared/network-status'
import { Users, Bell, Clock, TrendingUp, Target, CreditCard } from 'lucide-react'

export default function NotificationForm({ initial, hasHousehold = false }: { initial?: NotificationPreferences; hasHousehold?: boolean }){
  const online = useNetworkStatus()
  const { register, handleSubmit } = useForm<NotificationPreferences>({ resolver: zodResolver(notificationPreferencesSchema) as any, defaultValues: initial })
  const toast = useToast()
  const onSubmit = async (data: NotificationPreferences)=>{
    try{
      const res = await updateNotificationPreferences(data)
      if(res?.success) toast('success', 'Preferências atualizadas')
      else toast('error', res?.error || 'Falha')
    }catch(e){ console.error(e); toast('error', (e as any)?.message || 'Unknown') }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* Personal Notifications */}
      <div className="p-4 bg-[var(--bg-subtle)] rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Personal Notifications</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-3 bg-surface rounded-lg cursor-pointer hover:bg-[var(--bg-hover)] transition-colors">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <span className="text-sm">Alertas Urgentes</span>
            </div>
            <input type="checkbox" {...register('urgent')} className="w-4 h-4 rounded" />
          </label>
          <label className="flex items-center justify-between p-3 bg-surface rounded-lg cursor-pointer hover:bg-[var(--bg-hover)] transition-colors">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm">Oportunidades</span>
            </div>
            <input type="checkbox" {...register('opportunities')} className="w-4 h-4 rounded" />
          </label>
          <label className="flex items-center justify-between p-3 bg-surface rounded-lg cursor-pointer hover:bg-[var(--bg-hover)] transition-colors">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Resumo Semanal</span>
            </div>
            <input type="checkbox" {...register('weekly_summary')} className="w-4 h-4 rounded" />
          </label>
        </div>
      </div>

      {/* Household Notifications - only show if user has household */}
      {hasHousehold && (
        <div className="p-4 bg-[var(--bg-subtle)] rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Household Notifications</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center justify-between p-3 bg-surface rounded-lg cursor-pointer hover:bg-[var(--bg-hover)] transition-colors">
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-primary" />
                <div>
                  <span className="text-sm block">Shared Goal Updates</span>
                  <span className="text-xs text-[var(--text-muted)]">When goals progress changes</span>
                </div>
              </div>
              <input type="checkbox" {...register('household_goal_updates')} className="w-4 h-4 rounded" />
            </label>
            <label className="flex items-center justify-between p-3 bg-surface rounded-lg cursor-pointer hover:bg-[var(--bg-hover)] transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-orange-500" />
                <div>
                  <span className="text-sm block">Spending Alerts</span>
                  <span className="text-xs text-[var(--text-muted)]">Household budget exceeded</span>
                </div>
              </div>
              <input type="checkbox" {...register('household_spending_alerts')} className="w-4 h-4 rounded" />
            </label>
            <label className="flex items-center justify-between p-3 bg-surface rounded-lg cursor-pointer hover:bg-[var(--bg-hover)] transition-colors">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-blue-500" />
                <div>
                  <span className="text-sm block">Household Activity</span>
                  <span className="text-xs text-[var(--text-muted)]">New transactions on shared accounts</span>
                </div>
              </div>
              <input type="checkbox" {...register('household_activity')} className="w-4 h-4 rounded" />
            </label>
            <label className="flex items-center justify-between p-3 bg-surface rounded-lg cursor-pointer hover:bg-[var(--bg-hover)] transition-colors">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-purple-500" />
                <div>
                  <span className="text-sm block">Member Activity</span>
                  <span className="text-xs text-[var(--text-muted)]">When members join/leave</span>
                </div>
              </div>
              <input type="checkbox" {...register('household_member_activity')} className="w-4 h-4 rounded" />
            </label>
          </div>
        </div>
      )}

      {/* Quiet Hours */}
      <div className="p-4 bg-[var(--bg-subtle)] rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Quiet Hours</h3>
        </div>
        <label className="flex items-center justify-between p-3 bg-surface rounded-lg cursor-pointer hover:bg-[var(--bg-hover)] transition-colors mb-4">
          <span className="text-sm">Enable Quiet Hours</span>
          <input type="checkbox" {...register('quiet_hours_enabled')} className="w-4 h-4 rounded" />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[var(--text-secondary)] block mb-1">Start Time</label>
            <input 
              type="time" 
              {...register('quiet_hours_start')} 
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20" 
            />
          </div>
          <div>
            <label className="text-sm text-[var(--text-secondary)] block mb-1">End Time</label>
            <input 
              type="time" 
              {...register('quiet_hours_end')} 
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20" 
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {!online && <div className="text-sm text-yellow-600 p-3 bg-yellow-50 rounded-lg">Offline: As alterações estarão desativadas até a ligação ser restaurada.</div>}
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50" type="submit" disabled={!online}>
            Guardar Preferências
          </button>
        </div>
      </div>
    </form>
  )
}
