"use client"
import React, { useState } from 'react'
import { deleteAccount } from '../../lib/actions/accounts'
import Button from '../ui/Button'
import { useRouter } from 'next/navigation'

type Props = {
  accountId: string
  onClose?: () => void
}

export default function DeleteAccountDialog({ accountId, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onDelete() {
    setLoading(true)
    try {
      await deleteAccount(accountId)
      window.alert('Account deleted')
      router.refresh()
      onClose?.()
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  return (
    <div className="p-4">
      <p>Are you sure you want to delete this account?</p>
      <div className="mt-3 flex gap-2 justify-end">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={onDelete} disabled={loading}>Delete</Button>
      </div>
    </div>
  )
}
