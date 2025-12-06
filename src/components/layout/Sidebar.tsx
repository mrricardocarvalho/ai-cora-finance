"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart3, Wallet, Target, Briefcase, Settings, MessageCircle, GraduationCap } from 'lucide-react'
import PrivacyShield from '../shared/PrivacyShield'
import { useTranslations } from '../../lib/i18n'

export default function Sidebar() {
  const t = useTranslations()
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: t.nav.home, icon: Home },
    { href: '/chat', label: t.nav.chat, icon: MessageCircle },
    { href: '/dashboard', label: t.nav.dashboard, icon: BarChart3 },
    { href: '/data', label: t.nav.data, icon: Wallet },
    { href: '/portfolio', label: t.nav.portfolio, icon: Briefcase },
    { href: '/planning', label: t.nav.planning, icon: Target },
    { href: '/intelligence/forecast', label: 'Forecast', icon: BarChart3 },
    { href: '/intelligence/recommendations', label: 'Recommendations', icon: MessageCircle },
    { href: '/learn', label: t.nav.learn, icon: GraduationCap },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }
  
  return (
    <aside className="
      w-64 h-screen p-4 flex flex-col justify-between
      bg-[var(--surface-glass)] backdrop-blur-xl
      border-r border-[var(--border-glass)]
      shadow-[var(--shadow-glass),inset_1px_0_0_var(--border-glass-strong)]
    ">
      <nav>
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="group">
            <div className="flex items-center gap-3">
              <div className="
                w-11 h-11 rounded-2xl 
                bg-gradient-to-br from-[var(--primary)] via-[var(--primary-hover)] to-[var(--accent)]
                flex items-center justify-center 
                shadow-elevated
                transition-all duration-normal ease-glass
                group-hover:shadow-[var(--shadow-float),0_0_20px_var(--primary-glow)]
                group-hover:scale-105
              ">
                <span className="text-white text-lg font-bold">C</span>
              </div>
              <span className="
                text-xl font-bold 
                bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] 
                bg-clip-text text-transparent
              ">
                Cora
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <li key={item.href}>
                <Link 
                  href={item.href} 
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-fast ease-smooth
                    ${active 
                      ? `
                        bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)]
                        text-white shadow-glass
                        hover:shadow-elevated
                      `
                      : `
                        text-[var(--text-on-glass)]
                        hover:bg-[var(--primary-glass)] hover:text-[var(--primary)]
                      `
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
          
          {/* Settings - separated */}
          <li className="pt-4 mt-4 border-t border-[var(--border-glass)]">
            <Link 
              href="/settings" 
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-fast ease-smooth
                ${pathname.startsWith('/settings')
                  ? `
                    bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)]
                    text-white shadow-glass
                  `
                  : `
                    text-[var(--text-on-glass)]
                    hover:bg-[var(--primary-glass)] hover:text-[var(--primary)]
                  `
                }
              `}
            >
              <Settings size={20} />
              <span className="font-medium">{t.nav.settings}</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Privacy Shield */}
      <div className="pt-6">
        <div className="
          p-4 rounded-xl 
          bg-[var(--surface-glass)] backdrop-blur-sm
          border border-[var(--border-glass)]
          shadow-[var(--edge-highlight)]
        ">
          <div className="text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wider font-medium">
            {t.common.privacy}
          </div>
          <PrivacyShield />
        </div>
      </div>
    </aside>
  )
}
