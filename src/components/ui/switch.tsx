import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label className={cn("relative inline-flex items-center cursor-pointer", className)}>
        <input 
          type="checkbox" 
          className="sr-only peer" 
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <div className="
          w-11 h-6 rounded-full 
          bg-[var(--surface-glass)] backdrop-blur-sm
          border border-[var(--border-glass)]
          peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary)]/30
          peer-checked:bg-[var(--primary)] peer-checked:border-[var(--primary)]
          after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
          after:bg-white after:border-[var(--border-glass)] after:border 
          after:rounded-full after:h-5 after:w-5 
          after:transition-all after:duration-300 after:ease-smooth
          after:shadow-sm
          peer-checked:after:translate-x-full peer-checked:after:border-white
          transition-all duration-300 ease-smooth
        "></div>
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }

