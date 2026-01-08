import * as React from "react"
import { cn } from "@/lib/utils"

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const spacingMap = {
  none: '',
  sm: 'py-4 sm:py-6',
  md: 'py-6 sm:py-8',
  lg: 'py-8 sm:py-12',
  xl: 'py-12 sm:py-16',
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing = 'md', ...props }, ref) => {
    return (
      <section
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

Section.displayName = "Section"

