
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import tailwindcssTypography from "@tailwindcss/typography";

export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        'sans': [
          '"Inter-Unicode"',
          'Inter',
          '"Noto Sans"',
          'ui-sans-serif', 
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"'
        ],
        'mono': [
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace'
        ]
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        // Enhanced background system
        'background-primary': 'hsl(var(--background-primary))',
        'background-secondary': 'hsl(var(--background-secondary))',
        'background-tertiary': 'hsl(var(--background-tertiary))',
        'background-accent': 'hsl(var(--background-accent))',
        'background-container': 'hsl(var(--background-container))',
        // Crimson color palette
        crimson: {
          50: 'hsl(var(--color-crimson-50))',
          100: 'hsl(var(--color-crimson-100))',
          200: 'hsl(var(--color-crimson-200))',
          300: 'hsl(var(--color-crimson-300))',
          400: 'hsl(var(--color-crimson-400))',
          500: 'hsl(var(--color-crimson-500))',
          600: 'hsl(var(--color-crimson-600))',
          700: 'hsl(var(--color-crimson-700))',
          800: 'hsl(var(--color-crimson-800))',
          900: 'hsl(var(--color-crimson-900))',
          950: 'hsl(var(--color-crimson-950))',
        },
        // Wedgewood color palette
        wedgewood: {
          50: 'hsl(var(--color-wedgewood-50))',
          100: 'hsl(var(--color-wedgewood-100))',
          200: 'hsl(var(--color-wedgewood-200))',
          300: 'hsl(var(--color-wedgewood-300))',
          400: 'hsl(var(--color-wedgewood-400))',
          500: 'hsl(var(--color-wedgewood-500))',
          600: 'hsl(var(--color-wedgewood-600))',
          700: 'hsl(var(--color-wedgewood-700))',
          800: 'hsl(var(--color-wedgewood-800))',
          900: 'hsl(var(--color-wedgewood-900))',
          950: 'hsl(var(--color-wedgewood-950))',
        },
        // Eucalyptus color palette
        eucalyptus: {
          50: 'hsl(var(--color-eucalyptus-50))',
          100: 'hsl(var(--color-eucalyptus-100))',
          200: 'hsl(var(--color-eucalyptus-200))',
          300: 'hsl(var(--color-eucalyptus-300))',
          400: 'hsl(var(--color-eucalyptus-400))',
          500: 'hsl(var(--color-eucalyptus-500))',
          600: 'hsl(var(--color-eucalyptus-600))',
          700: 'hsl(var(--color-eucalyptus-700))',
          800: 'hsl(var(--color-eucalyptus-800))',
          900: 'hsl(var(--color-eucalyptus-900))',
          950: 'hsl(var(--color-eucalyptus-950))',
        },
        // Retro color palette
        retro: {
          50: 'hsl(var(--color-retro-50))',
          100: 'hsl(var(--color-retro-100))',
          200: 'hsl(var(--color-retro-200))',
          300: 'hsl(var(--color-retro-300))',
          400: 'hsl(var(--color-retro-400))',
          500: 'hsl(var(--color-retro-500))',
          600: 'hsl(var(--color-retro-600))',
          700: 'hsl(var(--color-retro-700))',
          800: 'hsl(var(--color-retro-800))',
          900: 'hsl(var(--color-retro-900))',
          950: 'hsl(var(--color-retro-950))',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'medium': 'var(--shadow-medium)',
        'strong': 'var(--shadow-strong)',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'background-gradient': 'var(--background-gradient)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'theme-transition': {
          from: { opacity: '0.8' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'theme-transition': 'theme-transition 0.5s ease-out',
      },
    }
  },
  plugins: [
    tailwindcssAnimate,
    tailwindcssTypography,
  ],
} satisfies Config;
