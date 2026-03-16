import * as React from "react"
import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
}

const getVariantStyles = (variant: BadgeVariant = "default") => {
  switch (variant) {
    case "default":
      return {
        borderColor: "transparent",
        backgroundColor: "var(--brand-primary)",
        color: "#ffffff",
      }
    case "secondary":
      return {
        borderColor: "transparent",
        backgroundColor: "var(--bg-elevated)",
        color: "var(--text-primary)",
      }
    case "destructive":
      return {
        borderColor: "transparent",
        backgroundColor: "var(--status-error)",
        color: "#ffffff",
      }
    case "outline":
      return {
        borderColor: "var(--border-default)",
        backgroundColor: "transparent",
        color: "var(--text-primary)",
      }
  }
}

function Badge({ className, variant = "default", style, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
        className
      )}
      style={{
        ...getVariantStyles(variant),
        ...style
      }}
      {...props}
    />
  )
}

export { Badge }
