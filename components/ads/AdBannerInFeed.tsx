'use client'
// In-feed unit that occupies a single grid cell, styled like a BusinessCard so
// it blends into result grids. Because it IS a grid cell, inserting it never
// shifts the surrounding cards. `h-full` makes it match the row height.
import { AdUnit } from './AdUnit'
import { cn } from '@/lib/utils/cn'

export function AdBannerInFeed({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-2xl border border-border bg-card',
        className,
      )}
    >
      <span className="absolute right-2 top-2 z-10 rounded-full bg-background/70 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70 backdrop-blur">
        Ad
      </span>
      <AdUnit placement="infeed" label={false} className="flex-1 p-1" />
    </div>
  )
}
