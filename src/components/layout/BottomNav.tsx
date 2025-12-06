"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart3, Wallet, Target, MessageCircle, GraduationCap } from 'lucide-react'
import { useTranslations } from '../../lib/i18n'

function NavItem({ href, icon, label, isActive }: { href: string; icon: React.ReactNode; label: string; isActive: boolean }){
  return (
    <Link 
      href={href} 
      className={`
        flex-1 flex flex-col items-center py-3 text-xs
        transition-all duration-fast ease-smooth
        ${isActive 
          ? 'text-[var(--primary)]' 
          : 'text-[var(--text-muted)] hover:text-[var(--primary)]'
        }
      `}
    >
      <div className={`
        p-2.5 rounded-2xl
        transition-all duration-fast ease-smooth
        ${isActive 
          ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-white shadow-glass' 
          : 'hover:bg-[var(--primary-glass)]'
        }
      `}>
        {icon}
      </div>
      <span className={`mt-1.5 ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
    </Link>
  )
}

export default function BottomNav(){
  const t = useTranslations()
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="
      fixed bottom-0 left-0 right-0 z-50
      md:hidden flex
      bg-[var(--surface-glass)] backdrop-blur-2xl
      border-t border-[var(--border-glass)]
      shadow-[0_-4px_30px_rgba(0,0,0,0.1)]
      px-2 pb-safe
    ">
      <NavItem href="/" icon={<Home size={20} />} label={t.nav.home} isActive={isActive('/')} />
      <NavItem href="/chat" icon={<MessageCircle size={20} />} label="Cora" isActive={isActive('/chat')} />
      <NavItem href="/dashboard" icon={<BarChart3 size={20} />} label={t.nav.dashboard} isActive={isActive('/dashboard')} />
      <NavItem href="/data" icon={<Wallet size={20} />} label={t.nav.data} isActive={isActive('/data')} />
      <NavItem href="/learn" icon={<GraduationCap size={20} />} label={t.nav.learn} isActive={isActive('/learn')} />
      <NavItem href="/planning" icon={<Target size={20} />} label={t.nav.goals} isActive={isActive('/planning')} />
    </nav>
  )
}
