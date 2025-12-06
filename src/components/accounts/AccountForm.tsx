"use client"
import React, { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AccountForm as AccountFormType, accountSchema } from '../../lib/validations/accounts'
import { createAccount, updateAccount } from '../../lib/actions/accounts'
import { useRouter } from 'next/navigation'
import Button from '../ui/button'
import { parseLocalizedNumber } from '../../lib/utils'
import FormatPreview from '../ui/format-preview'
import { useToast } from '../ui/toast-provider'
import { useTranslations } from '../../lib/i18n'

type Props = {
  initial?: Partial<AccountFormType>
  accountId?: string
  onClose?: () => void
}

export default function AccountFormComponent({ initial, accountId, onClose }: Props) {
  const router = useRouter()
  const uid = React.useId()
  const t = useTranslations()
  // no explicit ref: react-hook-form's register will manage the ref
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm<AccountFormType>({ resolver: zodResolver(accountSchema) })

  useEffect(()=>{ const el = document.getElementById(`account-name-${uid}`) as HTMLInputElement | null; if(el) el.focus() }, [uid])
  useEffect(()=>{ reset({ name: initial?.name || '', institution: initial?.institution || '', type: initial?.type ?? 'checking', visibility: initial?.visibility ?? 'personal', balance: Number(initial?.balance ?? 0), interest_rate: initial?.interest_rate ? Number(initial.interest_rate) : undefined, min_payment: initial?.min_payment ? Number(initial.min_payment) : undefined, due_date: initial?.due_date ?? undefined } as any) }, [initial, reset])
  const type = watch('type')
  const toast = useToast()

  async function onSubmit(values: AccountFormType) {
    try {
      if (accountId) {
        await updateAccount(accountId, values)
        toast('success', t.accounts.updated)
      } else {
        await createAccount(values)
        toast('success', t.accounts.created)
      }
      router.refresh()
      onClose?.()
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof Error) toast('error', err.message)
      else toast('error', String(err))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" role="dialog" aria-modal="true" aria-labelledby={`account-form-${uid}`}>
      <div>
        <label htmlFor={`account-name-${uid}`} className="block text-sm font-medium">{t.accounts.name}</label>
        <input id={`account-name-${uid}`} title={t.accounts.name} placeholder={`ex: ${t.accounts.types.checking}`} {...register('name')} className="mt-1 block w-full" />
        {errors.name && <p className="text-sm text-red-600">{String(errors.name?.message)}</p>}
      </div>
      <div>
        <label htmlFor={`account-institution-${uid}`} className="block text-sm font-medium">{t.accounts.institution}</label>
        <input id={`account-institution-${uid}`} title={t.accounts.institution} placeholder="ex: Moey" {...register('institution')} className="mt-1 block w-full" />
        {errors.institution && <p className="text-sm text-red-600">{String(errors.institution?.message)}</p>}
      </div>
      <div>
        <label htmlFor={`account-type-${uid}`} className="block text-sm font-medium">{t.accounts.type}</label>
        <select id={`account-type-${uid}`} title={t.accounts.type} {...register('type')} className="mt-1 block w-full">
          <option value="checking">{t.accounts.types.checking}</option>
          <option value="savings">{t.accounts.types.savings}</option>
          <option value="credit_card">{t.accounts.types.credit_card}</option>
          <option value="loan">{t.accounts.types.loan}</option>
          <option value="broker">{t.accounts.types.broker}</option>
        </select>
        {errors.type && <p className="text-sm text-red-600">{String(errors.type?.message)}</p>}
      </div>
      <div>
        <label htmlFor={`account-visibility-${uid}`} className="block text-sm font-medium">{t.accounts.visibility}</label>
        <select id={`account-visibility-${uid}`} title={t.accounts.visibility} {...register('visibility')} className="mt-1 block w-full">
          <option value="personal">{t.accounts.visibilities.personal}</option>
          <option value="shared">{t.accounts.visibilities.shared}</option>
        </select>
        {errors.visibility && <p className="text-sm text-red-600">{String(errors.visibility?.message)}</p>}
      </div>
      <div>
        <label htmlFor={`account-balance-${uid}`} className="block text-sm font-medium">{t.accounts.balance}</label>
        <input id={`account-balance-${uid}`} title={t.accounts.balance} placeholder="0.00" {...register('balance', { setValueAs: (v) => parseLocalizedNumber(v) })} className="mt-1 block w-full" />
        {errors.balance && <p className="text-sm text-red-600">{String(errors.balance?.message)}</p>}
        <FormatPreview value={watch('balance')} />
      </div>
      {(type === 'credit_card' || type === 'loan') && (
        <>
          <div>
            <label className="block text-sm font-medium">{t.accounts.interestRate} {type === 'credit_card' || type === 'loan' ? <span className='text-red-600'>*</span> : null}</label>
            <input type="number" step="0.01" {...register('interest_rate', { valueAsNumber: true })} className="mt-1 block w-full" />
            {errors.interest_rate && <p className="text-sm text-red-600">{String(errors.interest_rate?.message)}</p>}
          </div>
            <div>
            <label className="block text-sm font-medium">{t.accounts.minPayment} {type === 'credit_card' || type === 'loan' ? <span className='text-red-600'>*</span> : null}</label>
            <input type="text" inputMode="decimal" {...register('min_payment', { setValueAs: (v) => parseLocalizedNumber(v) })} className="mt-1 block w-full" />
            {errors.min_payment && <p className="text-sm text-red-600">{String(errors.min_payment?.message)}</p>}
              <FormatPreview value={watch('min_payment')} />
          </div>
          <div>
            <label className="block text-sm font-medium">{t.accounts.dueDate} {type === 'credit_card' || type === 'loan' ? <span className='text-red-600'>*</span> : null}</label>
            <input type="number" {...register('due_date', { valueAsNumber: true })} className="mt-1 block w-full" />
            {errors.due_date && <p className="text-sm text-red-600">{String(errors.due_date?.message)}</p>}
          </div>
        </>
      )}
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" type="button" onClick={onClose}>{t.common.cancel}</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t.common.loading : (accountId ? t.accounts.updated.replace('atualizada', 'Atualizar').replace('updated', 'Update') : t.accounts.addAccount)}</Button>
      </div>
    </form>
  )
}
