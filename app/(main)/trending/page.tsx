import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TrendingUp } from 'lucide-react'
import { BusinessGrid } from '@/components/business/BusinessGrid'
import { PostGrid } from '@/components/post/PostGrid'
import { GridSkeleton } from '@/components/shared/SkeletonCard'
import { AdBannerInline } from '@/components/ads/AdBannerInline'
import { AdBannerFooter } from '@/components/ads/AdBannerFooter'

export const metadata: Metadata = {
  title: 'Tendencias | KRUZO',
  description: 'Los negocios y productos más populares de Santa Cruz esta semana.',
}

export default function TrendingPage() {
  return (
    <div className="container pt-24 pb-16 space-y-10">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold-400/10 rounded-full text-gold-600 dark:text-gold-400 text-sm font-medium mb-3">
          <TrendingUp size={14} /> Esta semana en KRUZO
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-black">Tendencias</h1>
        <p className="text-muted-foreground mt-2">Lo más visto y contactado de Santa Cruz</p>
      </div>

      <div>
        <h2 className="text-xl font-display font-bold mb-5">⭐ Negocios destacados</h2>
        <Suspense fallback={<GridSkeleton count={4} />}>
          <BusinessGrid featured={true} pageSize={8} />
        </Suspense>
      </div>

      <AdBannerInline />

      <div>
        <h2 className="text-xl font-display font-bold mb-5">🔥 Productos populares</h2>
        <Suspense fallback={<GridSkeleton count={8} variant="post" />}>
          <PostGrid pageSize={12} />
        </Suspense>
      </div>

      <AdBannerFooter />
    </div>
  )
}
