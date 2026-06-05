'use client'
import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { getBusinessById } from '@/lib/firebase/firestore'
import { useReviews } from '@/lib/hooks/useReviews'
import { ReviewCard } from '@/components/review/ReviewCard'
import { RatingBar } from '@/components/review/StarRating'
import type { Business } from '@/lib/types/business'

export default function DashboardReviewsPage() {
  const { user } = useAuth()
  const [business, setBusiness] = useState<Business | null>(null)

  useEffect(() => {
    if (user?.businessIds?.[0]) getBusinessById(user.businessIds[0]).then(setBusiness)
  }, [user])

  const { reviews, loading, hasMore, loadMore } = useReviews(business?.id ?? '')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Star size={22} /> Reseñas</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Gestiona las opiniones sobre tu negocio</p>
      </div>

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
              {[5,4,3,2,1].map(r => <RatingBar key={r} rating={r} count={Math.floor(business.reviewCount * ([0.5,0.25,0.15,0.07,0.03][5-r]))} total={business.reviewCount} />)}
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
          {reviews.map((r, i) => <ReviewCard key={r.id} review={r} index={i} />)}
          {hasMore && (
            <button onClick={loadMore} className="w-full py-2.5 text-sm border border-border rounded-xl hover:bg-accent transition-colors">
              Cargar más reseñas
            </button>
          )}
        </div>
      )}
    </div>
  )
}
