import * as React from "react"
import { cn } from "@/lib/utils"

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  filled?: boolean
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700
}

const sizeMap = {
  xs: 'text-base',      // 16px
  sm: 'text-lg',        // 18px
  md: 'text-xl',        // 20px
  lg: 'text-2xl',       // 24px
  xl: 'text-3xl',       // 30px
}

export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ name, size = 'md', filled = true, weight = 400, className, ...props }, ref) => {
    const sizeClass = typeof size === 'number' 
      ? { fontSize: `${size}px` } 
      : sizeMap[size];
    
    const style = typeof size === 'number' 
      ? { fontSize: `${size}px`, ...props.style }
      : props.style;

    return (
      <span
        ref={ref}
        className={cn(
          "material-symbols-outlined inline-block leading-none",
          typeof size === 'string' && sizeClass,
          className
        )}
        style={{
          fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
          ...style,
        }}
        {...props}
      >
        {name}
      </span>
    )
  }
)

Icon.displayName = "Icon"

