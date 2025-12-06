import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  `relative w-full rounded-2xl border p-4 
   bg-[var(--surface-glass)] backdrop-blur-lg
   border-[var(--border-glass)]
   shadow-[var(--shadow-glass)]
   [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4`,
  {
    variants: {
      variant: {
        default: "text-[var(--text-on-glass)] [&>svg]:text-[var(--text-secondary)]",
        destructive:
          "border-l-4 border-l-[var(--danger)] bg-[var(--danger-glass)] text-[var(--text-on-glass)] [&>svg]:text-[var(--danger)]",
        warning:
          "border-l-4 border-l-[var(--warning)] bg-[var(--warning-glass)] text-[var(--text-on-glass)] [&>svg]:text-[var(--warning)]",
        success:
          "border-l-4 border-l-[var(--success)] bg-[var(--success-glass)] text-[var(--text-on-glass)] [&>svg]:text-[var(--success)]",
        info:
          "border-l-4 border-l-[var(--info)] bg-[var(--info-glass)] text-[var(--text-on-glass)] [&>svg]:text-[var(--info)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
