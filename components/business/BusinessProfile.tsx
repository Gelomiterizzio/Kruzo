'use client'
import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Phone, Globe, Instagram, Facebook, MapPin, Clock, BadgeCheck,
  Heart, Share2, Star, Eye, MessageCircle, ChevronRight, Truck, CreditCard
} from 'lucide-react'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'
import { AdBannerInline } from '@/components/ads/AdBannerInline'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { StarRating, RatingBar } from '@/components/review/StarRating'
import { ReviewCard } from '@/components/review/ReviewCard'
import { ReviewForm } from '@/components/review/ReviewForm'
import { BusinessMap } from '@/components/map/BusinessMap'
import { PostCard } from '@/components/post/PostCard'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { useReviews } from '@/lib/hooks/useReviews'
import { usePosts } from '@/lib/hooks/usePosts'
import { formatNumber, formatRelativeTime, isOpenNow } from '@/lib/utils/formatters'
import type { Business } from '@/lib/types/business'
import { cn } from '@/lib/utils/cn'

const DAYS: Record<string, string> = {
  mon: 'Lun', tue: 'Mar', wed: 'Mié', thu: 'Jue', fri: 'Vie', sat: 'Sáb', sun: 'Dom',
}

const TABS = ['Publicaciones', 'Reseñas', 'Información', 'Mapa']

export function BusinessProfile({ business }: { business: Business }) {
  const [tab, setTab] = useState(0)
  const [imgIdx, setImgIdx] = useState(0)
  const { isFavorite, toggleFavorite } = useFavorites()
  const { reviews, loading: revLoading, hasMore: revHasMore, loadMore: loadMoreRev } = useReviews(business.id)
  const { posts, loading: postsLoading } = usePosts({ businessId: business.id })
  const fav = isFavorite(business.id)
  const open = isOpenNow(business.hours as any)
  const allImages = [business.coverImage, ...business.images].filter(Boolean)

  const handleShare = async () => {
    try {
      await navigator.share({ title: business.name, url: window.location.href })
    } catch {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Cover gallery */}
      <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden bg-muted">
        {allImages[imgIdx] ? (
          <Image src={allImages[imgIdx]} alt={business.name} fill className="object-cover" priority sizes="(max-width:768px) 100vw, 768px" />
        ) : (
          <div className="h-full flex items-center justify-center text-6xl">🏪</div>
        )}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {allImages.map((_, i) => (
              <button key={i} onClick={() => setImgIdx(i)}
                className={cn('w-2 h-2 rounded-full transition-all', i === imgIdx ? 'bg-white w-4' : 'bg-white/50')} />
            ))}
          </div>
        )}
      </div>

      {/* Header */}
      <div className="px-1">
        <div className="flex items-start gap-3 -mt-8 mb-3 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-card border-2 border-background ring-1 ring-border overflow-hidden shrink-0 shadow-lg">
            {business.logo
              ? <Image src={business.logo} alt="" width={64} height={64} className="object-cover w-full h-full" />
              : <div className="w-full h-full flex items-center justify-center text-2xl bg-primary/10">🏪</div>
            }
          </div>
          <div className="pt-8 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold font-display truncate">{business.name}</h1>
              {business.isVerified && <BadgeCheck size={18} className="text-blue-500 shrink-0" />}
              {business.isFeatured && <span className="px-2 py-0.5 bg-gold-400 text-amber-900 text-xs font-bold rounded-full">⭐ Destacado</span>}
            </div>
            {business.tagline && <p className="text-sm text-muted-foreground mt-0.5">{business.tagline}</p>}
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {business.category.map(c => <CategoryBadge key={c} category={c} asLink size="sm" />)}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-gold-400 text-gold-400" />
            <span className="font-semibold text-foreground">{business.rating.toFixed(1)}</span>
            <span>({formatNumber(business.reviewCount)} reseñas)</span>
          </div>
          <div className="flex items-center gap-1"><Eye size={14} /> {formatNumber(business.viewCount)}</div>
          <div className={cn('flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', open ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' : 'bg-muted text-muted-foreground')}>
            <Clock size={11} /> {open ? 'Abierto ahora' : 'Cerrado'}
          </div>
        </div>

        {/* CTA buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <WhatsAppButton phone={business.whatsapp} businessName={business.name} size="md" className="col-span-2 sm:col-span-2" label="WhatsApp" />
          {business.phone && (
            <a href={`tel:${business.phone}`} className="flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-xl text-sm font-medium hover:bg-accent transition-colors">
              <Phone size={15} /> Llamar
            </a>
          )}
          <button onClick={() => toggleFavorite(business.id, business.name)}
            className="flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-xl text-sm font-medium hover:bg-accent transition-colors">
            <Heart size={15} className={fav ? 'fill-red-500 text-red-500' : ''} />
            {fav ? 'Guardado' : 'Guardar'}
          </button>
          <button onClick={handleShare}
            className="flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-xl text-sm font-medium hover:bg-accent transition-colors">
            <Share2 size={15} /> Compartir
          </button>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap gap-2 mb-2">
          {business.hasDelivery && <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full"><Truck size={12} /> Delivery</span>}
          {business.acceptsQR && <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-full"><CreditCard size={12} /> Acepta QR</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex gap-1 overflow-x-auto no-scrollbar px-1">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={cn('px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
              tab === i ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-1 pb-8">
        {tab === 0 && (
          <div>
            {postsLoading ? (
              <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <div key={i} className="h-56 bg-muted rounded-2xl animate-pulse" />)}</div>
            ) : posts.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Este negocio aún no tiene publicaciones</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {posts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)}
              </div>
            )}
          </div>
        )}

        {tab === 1 && (
          <div className="space-y-4">
            {/* Rating summary */}
            <div className="p-4 bg-card border border-border rounded-2xl">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold font-display">{business.rating.toFixed(1)}</div>
                  <StarRating value={Math.round(business.rating)} size={16} readonly />
                  <div className="text-xs text-muted-foreground mt-1">{formatNumber(business.reviewCount)} reseñas</div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5,4,3,2,1].map(r => <RatingBar key={r} rating={r} count={business.ratingDistribution?.[r] ?? 0} total={business.reviewCount} />)}
                </div>
              </div>
            </div>
            <ReviewForm businessId={business.id} />
            <div className="space-y-3">
              {reviews.map((r, i) => <ReviewCard key={r.id} review={r} index={i} />)}
              {revHasMore && (
                <button onClick={loadMoreRev} className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-accent transition-colors">
                  Cargar más reseñas
                </button>
              )}
            </div>
          </div>
        )}

        {tab === 2 && (
          <div className="space-y-4">
            <div className="p-4 bg-card border border-border rounded-2xl space-y-3">
              <h3 className="font-semibold">Información</h3>
              {business.description && <p className="text-sm text-muted-foreground leading-relaxed">{business.description}</p>}
              <div className="space-y-2 text-sm">
                {business.address && <div className="flex items-start gap-2"><MapPin size={15} className="text-muted-foreground mt-0.5 shrink-0" /><span>{business.address}, {business.zone}</span></div>}
                {business.phone && <div className="flex items-center gap-2"><Phone size={15} className="text-muted-foreground shrink-0" /><a href={`tel:${business.phone}`} className="hover:text-primary">{business.phone}</a></div>}
                {business.website && <div className="flex items-center gap-2"><Globe size={15} className="text-muted-foreground shrink-0" /><a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate">{business.website.replace(/^https?:\/\//, '')}</a></div>}
                {business.instagram && <div className="flex items-center gap-2"><Instagram size={15} className="text-muted-foreground shrink-0" /><a href={`https://instagram.com/${business.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">@{business.instagram}</a></div>}
                {business.facebook && <div className="flex items-center gap-2"><Facebook size={15} className="text-muted-foreground shrink-0" /><span className="text-muted-foreground">{business.facebook}</span></div>}
              </div>
            </div>

            {/* Hours */}
            <div className="p-4 bg-card border border-border rounded-2xl">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Clock size={15} /> Horario</h3>
              <div className="space-y-1.5">
                {Object.entries(DAYS).map(([key, label]) => {
                  const h = business.hours[key as keyof typeof business.hours]
                  return (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground w-10">{label}</span>
                      {h ? <span className="font-medium">{h.open} – {h.close}</span> : <span className="text-muted-foreground">Cerrado</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {tab === 3 && (
          <div className="space-y-3">
            {business.address && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-xl">
                <MapPin size={14} />
                <span>{business.address}, {business.zone}, Santa Cruz de la Sierra</span>
              </div>
            )}
            <BusinessMap single={business} height="350px" />
          </div>
        )}
      </div>

      <AdBannerInline />
    </div>
  )
}
