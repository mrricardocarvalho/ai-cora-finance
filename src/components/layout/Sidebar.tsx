import React from 'react'
import Link from 'next/link'
import { Home, BarChart3, Wallet, Target } from 'lucide-react'
import PrivacyShield from '../shared/PrivacyShield'

export default function Sidebar() {
  return (
    <div className="w-64 h-screen p-4 border-r bg-surface flex flex-col justify-between">
      <nav>
        <div className="mb-6">
          <Link href="/">
            <div className="flex items-center gap-2 font-semibold">
              <div className="w-8 h-8 rounded-full bg-primary" aria-hidden="true" />
              <span className="text-slate-900">Cora</span>
            </div>
          </Link>
        </div>
        <ul className="space-y-2">
          <li>
            <Link href="/" className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
              <Home /> <span>Home</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
              <BarChart3 /> <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/data" className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
              <Wallet /> <span>Data</span>
            </Link>
          </li>
          <li>
            <Link href="/planning" className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
              <Target /> <span>Goals</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="pt-6">
        <div className="mb-4">
          <div className="text-xs text-slate-500 mb-2">Privacy</div>
          <PrivacyShield />
        </div>
      </div>
    </div>
  )
}
