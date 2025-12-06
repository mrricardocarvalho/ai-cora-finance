"use client"

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

type ThemeOption = 'light' | 'dark' | 'system'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-24 h-20 rounded-xl bg-white/10 animate-pulse"
          />
        ))}
      </div>
    )
  }

  const options: { value: ThemeOption; label: string; icon: typeof Sun; description: string }[] = [
    {
      value: 'light',
      label: 'Light',
      icon: Sun,
      description: 'Bright and clear'
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: Moon,
      description: 'Easy on the eyes'
    },
    {
      value: 'system',
      label: 'System',
      icon: Monitor,
      description: 'Match device'
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {options.map((option) => {
          const Icon = option.icon
          const isActive = theme === option.value
          
          return (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`
                flex-1 p-4 rounded-2xl text-left
                transition-all duration-300 ease-smooth
                border
                ${isActive
                  ? `
                    bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]
                    border-transparent
                    text-white
                    shadow-glow
                  `
                  : `
                    bg-[var(--surface-glass)]
                    border-[var(--border-glass)]
                    text-[var(--text-on-glass)]
                    hover:bg-[var(--surface-elevated)]
                    hover:border-[var(--border-glass-strong)]
                    hover:shadow-glass
                  `
                }
              `}
              aria-pressed={isActive}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  ${isActive 
                    ? 'bg-white/20' 
                    : 'bg-[var(--primary-glass)]'
                  }
                `}>
                  <Icon size={20} className={isActive ? 'text-white' : 'text-[var(--primary)]'} />
                </div>
                <div>
                  <div className="font-semibold">{option.label}</div>
                  <div className={`text-xs ${isActive ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
                    {option.description}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
      
      {/* Current theme indicator */}
      <div className="text-sm text-[var(--text-muted)] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
        Current: {resolvedTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
      </div>
    </div>
  )
}

export function ThemeToggleCompact() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-10 h-10 rounded-xl bg-white/10 animate-pulse" />
  }

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  return (
    <button
      onClick={cycleTheme}
      className="
        w-10 h-10 rounded-xl
        flex items-center justify-center
        bg-[var(--surface-glass)] backdrop-blur-lg
        border border-[var(--border-glass)]
        text-[var(--text-on-glass)]
        shadow-glass
        transition-all duration-300 ease-smooth
        hover:bg-[var(--surface-elevated)]
        hover:shadow-elevated
        hover:scale-105
        active:scale-95
      "
      aria-label="Toggle theme"
    >
      {theme === 'light' && <Sun size={18} />}
      {theme === 'dark' && <Moon size={18} />}
      {theme === 'system' && <Monitor size={18} />}
    </button>
  )
}
