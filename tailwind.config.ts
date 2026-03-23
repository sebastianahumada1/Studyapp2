import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base Colors
        background: {
          DEFAULT: "hsl(var(--background))",
          light: "hsl(var(--background-light))",
          dark: "hsl(var(--background-dark))",
        },
        foreground: "hsl(var(--foreground))",
        
        // Card Colors
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          dark: "hsl(var(--card))",
          hover: "hsl(var(--card-hover))",
        },
        
        // Popover Colors
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        
        // Primary Colors
        primary: {
          DEFAULT: "hsl(var(--primary))",
          hover: "hsl(var(--primary-hover))",
          foreground: "hsl(var(--primary-foreground))",
          dim: "rgba(13, 242, 242, 0.1)",
        },
        
        // Secondary Colors
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        
        // Accent Colors
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        
        // Muted Colors
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        
        // Destructive Colors
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        
        // Border & Input Colors
        border: {
          DEFAULT: "hsl(var(--border))",
          dark: "hsl(var(--border))",
        },
        input: {
          DEFAULT: "hsl(var(--input))",
          dark: "hsl(var(--input))",
        },
        ring: "hsl(var(--ring))",
        
        // Surface Colors
        surface: {
          dark: "hsl(var(--surface-dark))",
          highlight: "hsl(var(--surface-highlight))",
          input: "hsl(var(--surface-input))",
        },
        
        // Text Colors
        text: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          muted: "hsl(var(--text-muted))",
        },
        
        // Chart Colors
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["Lexend", "sans-serif"],
        body: ["Noto Sans", "sans-serif"],
      },
      backgroundImage: {
        "gradient-violet": "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)",
        "gradient-border": "linear-gradient(to right, #6366f1, #a855f7)",
        "gradient-error-btn": "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.05) 100%)",
        "gradient-error-card": "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(20, 18, 37, 1) 100%)",
        "gradient-ai": "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)",
        "gradient-primary": "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)",
      },
      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        "2xl": "var(--spacing-2xl)",
        "3xl": "var(--spacing-3xl)",
      },
      boxShadow: {
        "primary-glow": "0 0 10px rgba(13, 242, 242, 0.5)",
        "primary-glow-lg": "0 0 20px rgba(13, 242, 242, 0.5)",
        "card": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "card-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "zoom-in-95": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "zoom-in-95": "zoom-in-95 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;

