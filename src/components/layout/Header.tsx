import React from 'react'
import Logo from '../shared/Logo'
import Avatar from '../shared/Avatar'

export default function Header(){
  return (
    <header className="w-full border-b bg-background flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <Logo />
        <div className="text-sm text-slate-500">Safe-to-Spend: <strong>420,00 €</strong></div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-600">Welcome back</div>
        <Avatar />
      </div>
    </header>
  )
}
