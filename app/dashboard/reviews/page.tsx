'use client'
import { useQuery } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { getBusinessById } from '@/lib/firebase/firestore'
import { useReviews } from '@/lib/hooks/useReviews'
import { ReviewCard } from '@/components/review/ReviewCard'
import { RatingBar } from '@/components/review/StarRating'
import { EmptyState } from '@/components/shared/EmptyState'

export default function DashboardReviewsPage() {
  const { user } = useAuth()
  const businessId = user?.businessIds?.[0]

  const { data: business } = useQuery({
    queryKey: ['business', businessId],
    queryFn: () => getBusinessById(businessId!),
    enabled: !!businessId,
  })

  const { reviews, loading, hasMore, loadMore, refetch } = useReviews(business?.id ?? '')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Star size={22} /> Reseñas</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Las opiniones reales sobre tu negocio</p>
      </div>

      {!businessId ? (
        <EmptyState title="Primero crea tu negocio" description="Cuando tu negocio reciba reseñas, las verás aquí."
          icon="store" action={{ label: 'Crear negocio', href: '/dashboard/business' }} />
      ) : (
        <>
          {business && (
            <div className="p-5 bg-card border border-border rounded-2xl">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-display font-black">{business.rating.toFixed(1)}</div>
                  <div className="flex justify-center mt-1">
                    {[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= Math.round(business.rating) ? 'fill-gold-400 text-gold-400' : 'fill-none text-muted-foreground/30'} />)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{business.reviewCount} reseñas</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {/* Real per-star distribution maintained by the Cloud Function */}
                  {[5,4,3,2,1].map(r => (
                    <RatingBar key={r} rating={r} count={business.ratingDistribution?.[r] ?? 0} total={business.reviewCount} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />)}</div>
          ) : !reviews.length ? (
            <p className="text-center text-muted-foreground py-10">Aún no tienes reseñas</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <ReviewCard key={r.id} review={r} index={i} canReply onReplied={() => refetch()} />
              ))}
              {hasMore && (
                <button onClick={loadMore} className="w-full py-2.5 text-sm border border-border rounded-xl hover:bg-accent transition-colors">
                  Cargar más reseñas
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
