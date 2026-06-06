'use client'
// Final unit at the bottom of long pages, just above the site footer. Visually
// separated with a top divider. Reserved 100px → 90px so it never shifts.
import { AdUnit } from './AdUnit'
import { cn } from '@/lib/utils/cn'

export function AdBannerFooter({ className }: { className?: string }) {
  return (
    <div className={cn('mx-auto mt-8 w-full max-w-3xl border-t border-border pt-6', className)}>
      <AdUnit placement="footer" className="h-[100px] md:h-[90px]" />
    </div>
  )
}
