import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, style, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-10 w-full appearance-none items-center justify-between rounded-md border px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          style={{
            borderColor: "var(--border-default)",
            backgroundColor: "var(--bg-surface)",
            color: "var(--text-primary)",
            ...style
          }}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none"
          style={{ color: "var(--text-secondary)" }}
        />
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
