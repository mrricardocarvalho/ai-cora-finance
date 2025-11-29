import React from 'react'
import { Lock } from 'lucide-react'

export default function PrivacyShield(){
  return (
    <div className="flex items-center gap-2 text-green-600">
      <Lock size={16} />
      <span className="text-sm">Encrypted</span>
    </div>
  )
}
