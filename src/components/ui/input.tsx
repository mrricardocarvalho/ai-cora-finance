import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'glass'
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', error, ...props }, ref) => {
    const baseStyles = `
      flex h-11 w-full rounded-xl px-4 py-2.5
      text-sm font-medium
      transition-all duration-fast ease-smooth
      placeholder:text-[var(--text-muted)]
      file:border-0 file:bg-transparent file:text-sm file:font-medium
      focus:outline-none
      disabled:cursor-not-allowed disabled:opacity-50
    `

    const variants = {
      default: `
        bg-[var(--surface-glass)] backdrop-blur-sm
        border border-[var(--border-glass)]
        text-[var(--text-on-glass)]
        shadow-[var(--edge-highlight)]
        hover:border-[var(--border-glass-strong)]
        focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20
        focus:shadow-[0_0_0_4px_var(--primary-glass)]
      `,
      glass: `
        bg-white/5 backdrop-blur-lg
        border border-white/20
        text-white
        shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]
        hover:bg-white/10 hover:border-white/30
        focus:border-white/40 focus:ring-2 focus:ring-white/20
      `
    }

    const errorStyles = error ? `
      border-[var(--danger)] 
      focus:border-[var(--danger)] focus:ring-[var(--danger)]/20
      focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]
    ` : ''

    return (
      <input
        type={type}
        className={cn(baseStyles, variants[variant], errorStyles, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
