"use client"
import React, { useState } from 'react'
import { deleteAccount } from '../../lib/actions/accounts'
import Button from '../ui/button'
import { useRouter } from 'next/navigation'
import { mutate } from 'swr'
import { useToast } from '../ui/toast-provider'

type Props = {
  accountId: string
  onClose?: () => void
}

export default function DeleteAccountDialog({ accountId, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()

  async function onDelete() {
    setLoading(true)
    try {
      await deleteAccount(accountId)
      toast('success', 'Conta eliminada')
      try{ mutate('/api/transactions?pageSize=5'); mutate('/api/insights') }catch(e){}
      router.refresh()
      onClose?.()
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  return (
    <div className="p-4">
      <p>Tens a certeza que queres eliminar esta conta?</p>
      <div className="mt-3 flex gap-2 justify-end">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={onDelete} disabled={loading}>Eliminar</Button>
      </div>
    </div>
  )
}
