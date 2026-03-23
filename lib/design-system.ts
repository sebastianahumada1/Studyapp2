/**
 * Design System Helpers
 * 
 * Type-safe utilities and helpers for working with the design system.
 */

import { designTokens, type ColorToken, type SpacingToken, type TypographyToken } from './design-tokens'
import { cn } from './utils'

/**
 * Get a color value from the design tokens
 */
export function getColor(path: string): string {
  const keys = path.split('.')
  let value: any = designTokens.colors
  
  for (const key of keys) {
    value = value?.[key]
    if (value === undefined) {
      console.warn(`Color token "${path}" not found`)
      return ''
    }
  }
  
  return value
}

/**
 * Get a spacing value from the design tokens
 */
export function getSpacing(size: keyof SpacingToken): string {
  return designTokens.spacing[size] || ''
}

/**
 * Variant helper for component variants
 */
export type VariantConfig<T extends string> = {
  [K in T]: string | string[]
}

/**
 * Create variant classes using a configuration object
 */
export function createVariants<T extends string>(
  base: string,
  variants: VariantConfig<T>,
  defaultVariant?: T
): (variant?: T) => string {
  return (variant = defaultVariant as T) => {
    if (!variant || !variants[variant]) {
      return base
    }
    const variantClasses = Array.isArray(variants[variant])
      ? variants[variant]
      : [variants[variant]]
    return cn(base, ...variantClasses)
  }
}

/**
 * Component size variants
 */
export const sizeVariants = {
  xs: 'text-xs px-2 py-1',
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3',
  xl: 'text-xl px-8 py-4',
} as const

/**
 * Get size classes
 */
export function getSizeClasses(size: keyof typeof sizeVariants): string {
  return sizeVariants[size] || sizeVariants.md
}

/**
 * Common component patterns
 */
export const componentPatterns = {
  // Focus ring
  focusRing: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  
  // Transition
  transition: 'transition-all duration-200',
  
  // Disabled state
  disabled: 'disabled:pointer-events-none disabled:opacity-50',
  
  // Interactive states
  interactive: 'hover:opacity-90 active:scale-95',
  
  // Card hover
  cardHover: 'hover:shadow-card-lg transition-shadow duration-200',
} as const

/**
 * Apply component pattern classes
 */
export function applyPatterns(...patterns: (keyof typeof componentPatterns)[]): string {
  return cn(...patterns.map(p => componentPatterns[p]))
}

/**
 * Export all helpers
 */
export const designSystem = {
  tokens: designTokens,
  getColor,
  getSpacing,
  createVariants,
  getSizeClasses,
  applyPatterns,
  patterns: componentPatterns,
}

