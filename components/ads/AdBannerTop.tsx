'use client'
// Leaderboard placed near the top of listing pages (below the page header).
// Reserved: 100px (mobile banner) → 90px (leaderboard) so it never shifts.
import { AdUnit } from './AdUnit'
import { cn } from '@/lib/utils/cn'

export function AdBannerTop({ className }: { className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-3xl', className)}>
      <AdUnit placement="top" className="h-[100px] md:h-[90px]" />
    </div>
  )
}
