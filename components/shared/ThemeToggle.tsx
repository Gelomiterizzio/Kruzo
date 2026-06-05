'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useState, useEffect } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-9 h-9 rounded-xl bg-muted animate-pulse" />

  const next = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'
  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <button onClick={() => setTheme(next)}
      className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-accent transition-colors"
      aria-label="Cambiar tema">
      <Icon size={18} className="text-muted-foreground" />
    </button>
  )
}
