import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean disabled:pointer-events-none disabled:opacity-50",
          variant === "default" && "bg-ocean text-white hover:bg-ocean-dark",
          variant === "secondary" && "bg-earth text-white hover:bg-earth-dark",
          variant === "outline" && "border border-border bg-transparent text-earth-dark hover:bg-background-dark",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
