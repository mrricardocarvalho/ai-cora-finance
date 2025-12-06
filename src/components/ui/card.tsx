import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'interactive' | 'glow'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: `
        bg-[var(--surface)] backdrop-blur-md
        border border-[var(--border-glass)]
        shadow-glass
        transition-all duration-normal ease-glass
        hover:bg-[var(--surface-elevated)] hover:border-[var(--border-glass-strong)]
        hover:shadow-elevated hover:-translate-y-0.5
      `,
      glass: `
        bg-[var(--surface-glass)] backdrop-blur-lg
        border border-[var(--border-glass)]
        shadow-glass shadow-[var(--edge-highlight)]
        transition-all duration-normal ease-glass
        hover:bg-[var(--surface)] hover:shadow-elevated
      `,
      elevated: `
        bg-[var(--surface-elevated)] backdrop-blur-xl
        border border-[var(--border-glass-strong)]
        shadow-elevated
        transition-all duration-normal ease-glass
      `,
      interactive: `
        bg-[var(--surface)] backdrop-blur-md
        border border-[var(--border-glass)]
        shadow-glass cursor-pointer
        transition-all duration-normal ease-glass
        hover:bg-[var(--surface-elevated)] hover:border-[var(--border-glass-strong)]
        hover:shadow-float hover:-translate-y-1
        active:translate-y-0 active:shadow-elevated
      `,
      glow: `
        bg-[var(--surface)] backdrop-blur-md
        border border-[var(--border-glass)]
        shadow-glass shadow-glow
        transition-all duration-normal ease-glass
        hover:shadow-[var(--shadow-elevated),0_0_30px_var(--primary-glow)]
        hover:-translate-y-0.5
      `
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-5",
          variants[variant].replace(/\s+/g, ' ').trim(),
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-[var(--text-primary)]",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[var(--text-secondary)]", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
