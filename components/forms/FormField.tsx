import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export interface FormFieldProps {
  label?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, required, children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {label && (
          <Label className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
            {label}
          </Label>
        )}
        {React.isValidElement(children) && error
          ? React.cloneElement(children as React.ReactElement<any>, {
              error: true,
            })
          : children}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    )
  }
)

FormField.displayName = "FormField"

