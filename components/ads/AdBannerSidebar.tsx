'use client'
// Sticky vertical unit for desktop sidebars only (the caller's <aside> is hidden
// on mobile). Reserved 600px (half-page / skyscraper). Fills the aside width.
import { AdUnit } from './AdUnit'
import { cn } from '@/lib/utils/cn'

export function AdBannerSidebar({
  className,
  sticky = true,
}: {
  className?: string
  sticky?: boolean
}) {
  return (
    <div className={cn(sticky && 'sticky top-24', 'w-full', className)}>
      <AdUnit placement="sidebar" className="h-[600px]" />
    </div>
  )
}
