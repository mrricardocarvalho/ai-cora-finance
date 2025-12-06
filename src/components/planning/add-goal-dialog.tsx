"use client"
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { goalSchema, GoalForm } from '../../lib/validations/goals'
import { formatCurrency, parseLocalizedNumber } from '../../lib/utils'
import FormatPreview from '../ui/format-preview'
import { createGoal } from '../../lib/actions/goals'
import { useRouter } from 'next/navigation'
import { useToast } from '../ui/toast-provider'
import { useTranslations } from '../../lib/i18n'

export default function AddGoalDialog({ onSuccess, onClose, accounts }: { onSuccess?: () => void; onClose?: () => void; accounts?: Array<any> }){
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm<GoalForm>({ resolver: zodResolver(goalSchema) })
  const linkedAccountId = watch('linked_account_id')
  const router = useRouter()
  const toast = useToast()
  const t = useTranslations()
  
  const onSubmit = async (data: GoalForm)=>{
    try{
      const res = await createGoal(data)
      if(res?.success){ toast('success', t.planning.goalCreated); reset(); router.refresh(); onSuccess?.() }
      else { throw new Error(res?.error || 'Unknown error') }
    }catch(e){ console.error('create goal failed', e); toast('error', (e as any)?.message || 'Failed') }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3">
      <div>
        <label htmlFor="goal-name" className="text-sm">{t.planning.goalName}</label>
        <input id="goal-name" {...register('name')} className="w-full input" />
      </div>
      <div>
        <label htmlFor="goal-visibility" className="text-sm">{t.accounts.visibility}</label>
        <select id="goal-visibility" {...register('visibility')} className="w-full input">
          <option value="personal">{t.accounts.visibilities.personal}</option>
          <option value="shared">{t.accounts.visibilities.shared}</option>
        </select>
      </div>
      <div>
        <label htmlFor="goal-target" className="text-sm">{t.planning.targetAmount}</label>
        <input id="goal-target" {...register('target_amount', { setValueAs: (v) => parseLocalizedNumber(v) })} className="w-full input" type="text" inputMode="decimal" />
        <FormatPreview value={watch('target_amount')} />
      </div>
      {accounts && accounts.length > 0 && (
        <div>
          <label htmlFor="goal-linked" className="text-sm">{t.planning.linkedAccount}</label>
          <select id="goal-linked" {...register('linked_account_id')} className="w-full input" aria-label={t.planning.linkedAccount}>
            <option value="">{t.planning.none}</option>
            {accounts.map((a: any)=> <option key={a.id} value={a.id}>{a.name} — {formatCurrency(Number(a.balance || 0))}</option>)}
          </select>
          {linkedAccountId ? <div className="text-sm text-[var(--text-muted)] mt-1">{t.planning.amountSyncNote}</div> : null}
        </div>
      )}
      {!linkedAccountId && (
        <div>
          <label htmlFor="goal-current" className="text-sm">{t.planning.currentAmount}</label>
          <input id="goal-current" {...register('current_amount', { setValueAs: (v) => parseLocalizedNumber(v) })} className="w-full input" type="text" inputMode="decimal" />
          <FormatPreview value={watch('current_amount')} />
        </div>
      )}
      <div>
        <label className="text-sm">{t.planning.deadline}</label>
        <input {...register('deadline')} type="date" className="w-full input"/>
      </div>
      <div className="flex justify-end gap-2">
        {onClose && (
          <button type="button" className="btn btn-ghost" onClick={onClose}>{t.common.cancel}</button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? t.planning.saving : t.planning.create}</button>
      </div>
    </form>
  )
}
