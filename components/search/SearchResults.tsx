'use client'
import { useQuery } from '@tanstack/react-query'
import { BusinessCard } from '@/components/business/BusinessCard'
import { PostCard } from '@/components/post/PostCard'
import { GridSkeleton } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { AdBannerInFeed } from '@/components/ads/AdBannerInFeed'
import { ADS_ENABLED } from '@/lib/ads/config'
import { searchBusinesses, searchPosts, type SearchSort } from '@/lib/firebase/firestore'

interface Props {
  q?: string
  category?: string
  zone?: string
  sort?: SearchSort
  type?: string
}

// In-feed ad cells AFTER these 0-based card indices (same density as /explore).
const AD_AFTER = [5, 17]

export function SearchResults({ q, category, zone, sort, type }: Props) {
  const showBusinesses = type === 'businesses' || !type
  const showPosts = type === 'posts' || !type

  const businesses = useQuery({
    queryKey: ['search-businesses', { q, category, zone, sort }],
    queryFn: () => searchBusinesses({ q, category, zone, sort }),
    enabled: showBusinesses,
  })
  const posts = useQuery({
    queryKey: ['search-posts', { q, category, sort }],
    queryFn: () => searchPosts({ q, category, sort }),
    enabled: showPosts,
  })

  return (
    <div className="space-y-8">
      {showBusinesses && (
        <section>
          <h2 className="font-semibold mb-4">
            Negocios
            {businesses.data && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {businesses.data.length} {businesses.data.length === 1 ? 'resultado' : 'resultados'}
              </span>
            )}
          </h2>
          {businesses.isLoading ? (
            <GridSkeleton count={4} />
          ) : businesses.isError ? (
            <EmptyState title="Error al cargar" description="No pudimos completar la búsqueda. Intenta de nuevo." icon="search" />
          ) : !businesses.data?.length ? (
            <EmptyState
              title="Sin resultados"
              description={q ? `No encontramos negocios para "${q}". Prueba con otra palabra.` : 'No hay negocios con estos filtros.'}
              icon="search"
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {businesses.data.flatMap((b, i) => {
                const card = <BusinessCard key={b.id} business={b} index={i} />
                return ADS_ENABLED && AD_AFTER.includes(i)
                  ? [card, <AdBannerInFeed key={`ad-${i}`} />]
                  : card
              })}
            </div>
          )}
        </section>
      )}

      {showPosts && (
        <section>
          <h2 className="font-semibold mb-4">
            Productos y servicios
            {posts.data && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {posts.data.length} {posts.data.length === 1 ? 'resultado' : 'resultados'}
              </span>
            )}
          </h2>
          {posts.isLoading ? (
            <GridSkeleton count={4} variant="post" />
          ) : !posts.data?.length ? (
            <EmptyState
              title="Sin publicaciones"
              description={q ? `No encontramos productos para "${q}".` : 'No hay publicaciones con estos filtros.'}
              icon="post"
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {posts.data.map((p, i) => <PostCard key={p.id} post={p} index={i} />)}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
