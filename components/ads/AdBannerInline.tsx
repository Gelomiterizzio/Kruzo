'use client'
// In-content unit placed at natural breaks between sections / after article text.
// `inArticle` switches to AdSense's native fluid in-article format for prose
// pages (e.g. post detail). Reserved height keeps CLS at zero either way.
import { AdUnit } from './AdUnit'
import { cn } from '@/lib/utils/cn'

export function AdBannerInline({
  className,
  inArticle = false,
}: {
  className?: string
  inArticle?: boolean
}) {
  return (
    <div className={cn('mx-auto w-full max-w-3xl py-2', className)}>
      <AdUnit
        placement="inline"
        className="h-[280px]"
        format={inArticle ? 'fluid' : 'auto'}
        layout={inArticle ? 'in-article' : undefined}
      />
    </div>
  )
}
