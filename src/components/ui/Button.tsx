"use client"
import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'glass'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  glow?: boolean
}

export function Button({ variant = 'primary', size = 'md', glow = false, className = '', children, ...props }: Props) {
  const base = `
    inline-flex items-center justify-center gap-2 font-medium 
    rounded-xl transition-all duration-fast ease-smooth
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2
  `
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'h-10 w-10 p-0'
  }
  
  const variants = {
    primary: `
      bg-gradient-to-r from-[var(--primary)] via-[var(--primary-hover)] to-[var(--investment)]
      text-white shadow-glass
      hover:shadow-elevated hover:-translate-y-0.5 hover:scale-[1.02]
      active:translate-y-0 active:scale-[0.98]
    `,
    secondary: `
      bg-[var(--surface-glass)] backdrop-blur-md
      text-[var(--text-primary)] 
      border border-[var(--border-glass)]
      shadow-[var(--edge-highlight)]
      hover:bg-[var(--surface-elevated)] hover:border-[var(--primary-subtle)] 
      hover:text-[var(--primary)] hover:shadow-glass hover:-translate-y-0.5
    `,
    ghost: `
      bg-transparent text-[var(--text-secondary)]
      hover:bg-[var(--primary-glass)] hover:text-[var(--primary)]
    `,
    danger: `
      bg-gradient-to-r from-[var(--danger)] to-red-600 
      text-white shadow-glass
      hover:shadow-elevated hover:-translate-y-0.5
      active:translate-y-0
    `,
    outline: `
      border border-[var(--border)] bg-transparent 
      text-[var(--text-primary)]
      hover:bg-[var(--surface-glass)] hover:border-[var(--border-hover)]
    `,
    glass: `
      bg-[var(--surface-glass)] backdrop-blur-lg
      text-[var(--text-on-glass)]
      border border-[var(--border-glass)]
      shadow-glass
      hover:bg-[var(--surface-elevated)] hover:border-[var(--border-glass-strong)]
      hover:shadow-elevated hover:-translate-y-0.5
    `
  }

  const glowClass = glow ? 'shadow-glow hover:shadow-[var(--shadow-elevated),0_0_30px_var(--primary-glow)]' : ''
  
  return (
    <button 
      className={`${base} ${sizes[size]} ${variants[variant]} ${glowClass} ${className}`.replace(/\s+/g, ' ').trim()} 
      {...props}
    >
      {children}
    </button>
  )
}

export default Button

