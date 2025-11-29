"use client"
import React from 'react'
import { Check } from 'lucide-react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export default function Button({ variant = 'primary', className = '', children, ...props }: Props) {
  const base = 'inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium'
  const variants = {
    primary: 'bg-primary text-primary-foreground',
    ghost: 'bg-transparent border border-gray-200'
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {variant === 'primary' && <Check size={16} />}
      {children}
    </button>
  )
}
