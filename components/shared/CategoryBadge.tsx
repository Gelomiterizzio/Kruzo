import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { BUSINESS_CATEGORIES } from '@/lib/utils/constants'

export function getCategoryInfo(key: string) {
  const c = BUSINESS_CATEGORIES.find((cat) => cat.key === key)
  return c
    ? { emoji: c.emoji, label: c.label, color: c.color }
    : { emoji: '🏪', label: key, color: 'bg-muted text-muted-foreground' }
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
