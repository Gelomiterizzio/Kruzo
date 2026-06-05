import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export const CATEGORY_MAP: Record<string, { emoji: string; label: string; color: string }> = {
  comida:        { emoji: '🍕', label: 'Comida',        color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
  reposteria:    { emoji: '🧁', label: 'Repostería',    color: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300' },
  ropa:          { emoji: '👗', label: 'Ropa',          color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
  tecnologia:    { emoji: '💻', label: 'Tecnología',    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  belleza:       { emoji: '💇', label: 'Belleza',       color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
  fotografia:    { emoji: '📸', label: 'Fotografía',    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
  carpinteria:   { emoji: '🪑', label: 'Carpintería',   color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  electricistas: { emoji: '⚡', label: 'Electricistas', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' },
  automotriz:    { emoji: '🚗', label: 'Automotriz',    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  hogar:         { emoji: '🏠', label: 'Hogar',         color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' },
  educacion:     { emoji: '🎓', label: 'Educación',     color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300' },
  servicios:     { emoji: '🔧', label: 'Servicios',     color: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300' },
}

export function getCategoryInfo(key: string) {
  return CATEGORY_MAP[key] ?? { emoji: '🏪', label: key, color: 'bg-muted text-muted-foreground' }
}

export function getCategoryList() {
  return Object.entries(CATEGORY_MAP).map(([key, val]) => ({ key, ...val }))
}

interface CategoryBadgeProps {
  category: string
  asLink?: boolean
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

export function CategoryBadge({ category, asLink = false, size = 'sm', className }: CategoryBadgeProps) {
  const info = getCategoryInfo(category)
  const cls = cn(
    'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
    info.color,
    size === 'xs' && 'px-2 py-0.5 text-xs',
    size === 'sm' && 'px-2.5 py-1 text-xs',
    size === 'md' && 'px-3 py-1.5 text-sm',
    asLink && 'hover:opacity-80 cursor-pointer',
    className,
  )
  if (asLink) return (
    <Link href={`/search?cat=${category}`} className={cls}>
      <span>{info.emoji}</span> {info.label}
    </Link>
  )
  return <span className={cls}><span>{info.emoji}</span> {info.label}</span>
}
