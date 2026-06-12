import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: ['./pages/**/*.{ts,tsx}','./components/**/*.{ts,tsx}','./app/**/*.{ts,tsx}','./providers/**/*.{ts,tsx}','./lib/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' }, screens: { '2xl': '1400px' } },
    extend: {
      colors: {
        border: 'hsl(var(--border))', input: 'hsl(var(--input))', ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))', foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        brand: { 50:'#fff4f0',100:'#ffe4d6',200:'#ffc5a8',300:'#ff9a70',400:'#ff6b35',500:'#ff4500',600:'#e63a00',700:'#c02f00',800:'#9a2800',900:'#7a2000' },
        gold: { 50:'#fffbeb',100:'#fef3c7',400:'#fbbf24',500:'#f59e0b',600:'#d97706' },
      },
      // Warm-tinted elevation + brand glow. These back the shadow-warm* /
      // shadow-glow-sm classes used across cards, navbar and CTAs.
      boxShadow: {
        'warm-sm': '0 1px 2px 0 rgb(122 32 0 / 0.05), 0 2px 8px -2px rgb(122 32 0 / 0.08)',
        warm: '0 4px 12px -2px rgb(122 32 0 / 0.10), 0 2px 6px -2px rgb(122 32 0 / 0.06)',
        'warm-lg': '0 12px 32px -8px rgb(122 32 0 / 0.16), 0 4px 12px -4px rgb(122 32 0 / 0.08)',
        'glow-sm': '0 0 16px -2px hsl(var(--primary) / 0.4)',
      },
      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
      fontFamily: { sans: ['var(--font-sans)', ...fontFamily.sans], display: ['var(--font-display)', ...fontFamily.sans] },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'fade-in': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config
