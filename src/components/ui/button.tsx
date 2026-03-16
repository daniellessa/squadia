import * as React from "react"
import { cn } from "@/lib/utils"

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
type ButtonSize = "default" | "sm" | "lg" | "icon"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

const getVariantStyles = (variant: ButtonVariant = "default") => {
  switch (variant) {
    case "default":
      return {
        backgroundColor: "var(--brand-primary)",
        color: "#ffffff",
      }
    case "destructive":
      return {
        backgroundColor: "var(--status-error)",
        color: "#ffffff",
      }
    case "outline":
      return {
        borderColor: "var(--border-default)",
        backgroundColor: "var(--bg-base)",
        color: "var(--text-primary)",
      }
    case "secondary":
      return {
        backgroundColor: "var(--bg-elevated)",
        color: "var(--text-primary)",
      }
    case "ghost":
      return {
        backgroundColor: "transparent",
        color: "var(--text-primary)",
      }
    case "link":
      return {
        backgroundColor: "transparent",
        color: "var(--brand-primary)",
      }
  }
}

const getSizeClass = (size: ButtonSize = "default") => {
  switch (size) {
    case "default":
      return "h-10 px-4 py-2"
    case "sm":
      return "h-9 rounded-md px-3"
    case "lg":
      return "h-11 rounded-md px-8"
    case "icon":
      return "h-10 w-10"
  }
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", style, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          variant === "outline" && "border",
          variant === "link" && "underline-offset-4 hover:underline",
          getSizeClass(size),
          className
        )}
        style={{
          ...getVariantStyles(variant),
          ...style
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
