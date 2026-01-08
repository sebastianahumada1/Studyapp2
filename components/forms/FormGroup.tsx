import * as React from "react"
import { cn } from "@/lib/utils"

export interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'none' | 'sm' | 'md' | 'lg'
}

const spacingMap = {
  none: 'space-y-0',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
}

export const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
  ({ className, spacing = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          spacingMap[spacing],
          className
        )}
        {...props}
      />
    )
  }
)

FormGroup.displayName = "FormGroup"

