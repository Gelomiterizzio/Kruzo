'use client'
import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface StarRatingProps {
  value: number
  onChange?: (v: number) => void
  size?: number
  readonly?: boolean
  showLabel?: boolean
}

const LABELS = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente']

export function StarRating({ value, onChange, size = 20, readonly = false, showLabel = false }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <button key={star} type="button"
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            disabled={readonly}
            className={cn('transition-all', !readonly && 'hover:scale-110 cursor-pointer', readonly && 'cursor-default')}>
            <Star size={size} className={cn(
              'transition-colors',
              star <= active ? 'fill-gold-400 text-gold-400' : 'fill-none text-muted-foreground/40'
            )} />
          </button>
        ))}
      </div>
      {showLabel && active > 0 && (
        <span className="text-sm font-medium text-gold-600 dark:text-gold-400">{LABELS[active]}</span>
      )}
    </div>
  )
}

export function RatingBar({ rating, count, total }: { rating: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-6 text-right text-muted-foreground">{rating}</span>
      <Star size={11} className="fill-gold-400 text-gold-400 shrink-0" />
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-gold-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-muted-foreground">{count}</span>
    </div>
  )
}
