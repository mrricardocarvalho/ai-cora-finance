"use client"
import React from 'react'
import Link from 'next/link'
import { Home, BarChart3, Wallet, Target } from 'lucide-react'

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }){
  return (
    <Link href={href} className="flex-1 flex flex-col items-center py-2 text-xs text-slate-700 hover:bg-slate-50">
      <div>{icon}</div>
      <div>{label}</div>
    </Link>
  )
}

export default function BottomNav(){
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 md:hidden flex">
      <NavItem href="/" icon={<Home />} label="Home" />
      <NavItem href="/dashboard" icon={<BarChart3 />} label="Dashboard" />
      <NavItem href="/data" icon={<Wallet />} label="Data" />
      <NavItem href="/planning" icon={<Target />} label="Goals" />
    </nav>
  )
}
