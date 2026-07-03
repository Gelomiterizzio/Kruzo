import type { Metadata } from 'next'
import { Suspense } from 'react'
import { BusinessGrid } from '@/components/business/BusinessGrid'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { SearchBar } from '@/components/search/SearchBar'
import { GridSkeleton } from '@/components/shared/SkeletonCard'
import { AdBannerTop } from '@/components/ads/AdBannerTop'
import { getCategoryInfo } from '@/components/shared/CategoryBadge'

export const metadata: Metadata = {
  title: 'Explorar negocios',
  description: 'Descubre todos los negocios y emprendimientos de Santa Cruz de la Sierra.',
  alternates: { canonical: '/explore' },
}

// Next.js 16: searchParams is now a Promise.
interface Props { searchParams: Promise<{ filter?: string; cat?: string }> }

export default async function ExplorePage({ searchParams }: Props) {
  const { filter, cat } = await searchParams

  return (
    <div className="container pt-24 pb-16 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-display font-black">Explorar</h1>
        <p className="text-muted-foreground">Descubre negocios y emprendimientos de Santa Cruz</p>
        <SearchBar className="max-w-xl mx-auto" />
      </div>

      <AdBannerTop />

      <CategoryGrid />

      <div>
        <h2 className="text-xl font-display font-bold mb-5">
          {filter === 'featured' ? '⭐ Negocios destacados' : cat ? `Resultados en ${getCategoryInfo(cat).label}` : 'Todos los negocios'}
        </h2>
        <Suspense fallback={<GridSkeleton count={8} />}>
          <BusinessGrid
            featured={filter === 'featured' ? true : undefined}
            category={cat}
            pageSize={12}
            inFeedAd
          />
        </Suspense>
      </div>
    </div>
  )
}
