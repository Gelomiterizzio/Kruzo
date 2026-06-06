'use client'
import { useRef, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { BusinessCard } from './BusinessCard'
import { GridSkeleton } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { AdBannerInFeed } from '@/components/ads/AdBannerInFeed'
import { ADS_ENABLED } from '@/lib/ads/config'
import { useBusinesses } from '@/lib/hooks/useBusinesses'
import { Loader2 } from 'lucide-react'

interface Props { category?: string; featured?: boolean; zone?: string; pageSize?: number; inFeedAd?: boolean }

// Insert an in-feed ad cell AFTER these 0-based card indices. Spread out and
// capped to keep ad density well within Better Ads Standards on long scrolls.
const AD_AFTER = [5, 17, 35]

export function BusinessGrid({ category, featured, zone, pageSize, inFeedAd }: Props) {
  const { businesses, loading, loadingMore, hasMore, error, loadMore } = useBusinesses({ category, featured, zone, pageSize })

  const { ref } = useInView({
    threshold: 0.1,
    onChange: inView => { if (inView && hasMore && !loadingMore) loadMore() },
  })

  if (loading) return <GridSkeleton count={8} variant="business" />
  if (error) return <EmptyState title="Error al cargar" description={error} icon="search" />
  if (!businesses.length) return (
    <EmptyState title="No hay negocios aquí" description="Sé el primero en registrar tu negocio en esta categoría."
      icon="store" action={{ label: 'Registrar mi negocio', href: '/dashboard/business' }} />
  )

  const showAds = inFeedAd && ADS_ENABLED

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {businesses.flatMap((b, i) => {
          const card = <BusinessCard key={b.id} business={b} index={i} />
          return showAds && AD_AFTER.includes(i)
            ? [card, <AdBannerInFeed key={`ad-${i}`} />]
            : card
        })}
      </div>
      {hasMore && (
        <div ref={ref} className="flex justify-center py-4">
          {loadingMore && <Loader2 size={24} className="animate-spin text-muted-foreground" />}
        </div>
      )}
    </div>
  )
}
