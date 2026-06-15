'use client'
import { useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { BusinessCard } from './BusinessCard'
import { GridSkeleton } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { AdBannerInFeed } from '@/components/ads/AdBannerInFeed'
import { ADS_ENABLED } from '@/lib/ads/config'
import { useBusinesses } from '@/lib/hooks/useBusinesses'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { distanceKm } from '@/lib/utils/geo'
import { Loader2, MapPin, Navigation } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Props { category?: string; featured?: boolean; zone?: string; pageSize?: number; inFeedAd?: boolean }

// Insert an in-feed ad cell AFTER these 0-based card indices. Spread out and
// capped to keep ad density well within Better Ads Standards on long scrolls.
const AD_AFTER = [5, 17, 35]

export function BusinessGrid({ category, featured, zone, pageSize, inFeedAd }: Props) {
  const { businesses, loading, loadingMore, hasMore, error, loadMore } = useBusinesses({ category, featured, zone, pageSize })
  const { position, loading: geoLoading, error: geoError, getCurrentPosition } = useGeolocation()
  const [nearby, setNearby] = useState(false)

  const { ref } = useInView({
    threshold: 0.1,
    onChange: inView => { if (inView && hasMore && !loadingMore) loadMore() },
  })

  // When nearby mode is on and we have the user's location, sort the loaded
  // businesses by real distance (those without coordinates sink to the end).
  const ordered = useMemo(() => {
    if (!nearby || !position) return businesses.map((b) => ({ b, d: undefined as number | undefined }))
    return businesses
      .map((b) => ({ b, d: b.coordinates ? distanceKm(position, b.coordinates) : Infinity }))
      .sort((x, y) => (x.d ?? Infinity) - (y.d ?? Infinity))
      .map(({ b, d }) => ({ b, d: d !== undefined && isFinite(d) ? d : undefined }))
  }, [nearby, position, businesses])

  const toggleNearby = () => {
    if (nearby) { setNearby(false); return }
    setNearby(true)
    if (!position) getCurrentPosition()
  }

  if (loading) return <GridSkeleton count={8} variant="business" />
  if (error) return <EmptyState title="Error al cargar" description={error} icon="search" />
  if (!businesses.length) return (
    <EmptyState title="No hay negocios aquí" description="Sé el primero en registrar tu negocio en esta categoría."
      icon="store" action={{ label: 'Registrar mi negocio', href: '/dashboard/business' }} />
  )

  const showAds = inFeedAd && ADS_ENABLED

  return (
    <div className="space-y-5">
      {/* Nearby discovery control */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleNearby}
          aria-pressed={nearby}
          className={cn(
            'inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-semibold border transition-all active:scale-[0.97]',
            nearby
              ? 'bg-primary/10 border-primary/40 text-primary'
              : 'border-border hover:bg-accent text-foreground',
          )}
        >
          {geoLoading ? <Loader2 size={15} className="animate-spin" /> : nearby ? <Navigation size={15} className="fill-current" /> : <MapPin size={15} />}
          Cerca de mí
        </button>
        {nearby && geoError && (
          <span className="text-xs text-muted-foreground">Activa la ubicación para ordenar por cercanía.</span>
        )}
        {nearby && position && (
          <span className="text-xs text-muted-foreground">Ordenado por distancia</span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {ordered.flatMap(({ b, d }, i) => {
          const card = <BusinessCard key={b.id} business={b} index={i} distanceKm={d} />
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
