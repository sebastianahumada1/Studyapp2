/**
 * Design Tokens - TypeScript Constants
 * 
 * Centralized design tokens for the application.
 * These tokens correspond to CSS variables defined in globals.css
 * and can be used in TypeScript/JavaScript code.
 */

// Color Tokens
export const colors = {
  primary: {
    DEFAULT: '#0df2f2',
    hover: '#0db9f2',
  },
  secondary: {
    DEFAULT: '#7c3aed',
  },
  accent: {
    DEFAULT: '#06b6d4',
  },
  background: {
    light: '#f5f8f8',
    dark: '#101e22',
  },
  card: {
    dark: '#16262c',
    hover: '#1c1830',
  },
  surface: {
    dark: '#131c2e',
    highlight: '#1c2a42',
    input: '#1a162e',
  },
  input: {
    dark: '#1c2e36',
  },
  border: {
    dark: '#2a424d',
  },
  text: {
    secondary: '#94a3b8',
    muted: '#a0aec0',
  },
  scrollbar: {
    track: '#101e22',
    thumb: '#2a424d',
    thumbHover: '#0db9f2',
  },
  code: {
    bg: '#0f1623',
  },
} as const;

// Spacing Scale
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

// Border Radius
export const borderRadius = {
  sm: 'calc(var(--radius) - 4px)',
  md: 'calc(var(--radius) - 2px)',
  lg: 'var(--radius)',
  xl: 'calc(var(--radius) + 4px)',
  '2xl': 'calc(var(--radius) + 8px)',
  full: '9999px',
} as const;

// Typography
export const typography = {
  fontFamily: {
    display: ['Lexend', 'sans-serif'],
    body: ['Noto Sans', 'sans-serif'],
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
} as const;

// Breakpoints (for reference, Tailwind uses its own)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Animations
export const animations = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    zoomIn95: {
      '0%': { opacity: '0', transform: 'scale(0.95)' },
      '100%': { opacity: '1', transform: 'scale(1)' },
    },
    spin: {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
  },
} as const;

// Z-Index Scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  max: 9999,
} as const;

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  primaryGlow: '0 0 10px rgba(13, 242, 242, 0.5)',
  primaryGlowLg: '0 0 20px rgba(13, 242, 242, 0.5)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
} as const;

// Export all tokens
export const designTokens = {
  colors,
  spacing,
  borderRadius,
  typography,
  breakpoints,
  animations,
  zIndex,
  shadows,
} as const;

// Type helpers
export type ColorToken = typeof colors;
export type SpacingToken = typeof spacing;
export type TypographyToken = typeof typography;

