'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Star, MapPin, BadgeCheck } from 'lucide-react'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { ReputationBadges } from '@/components/business/ReputationBadges'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { formatNumber } from '@/lib/utils/formatters'
import { formatDistance } from '@/lib/utils/geo'
import type { Business } from '@/lib/types/business'

interface Props {
  business: Business
  index?: number
  /** Set false when a parent already animates the card in (avoids double entrance). */
  entrance?: boolean
  /** When provided (nearby mode), shows the distance from the user. */
  distanceKm?: number
}

export function BusinessCard({ business, index = 0, entrance = true, distanceKm }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const fav = isFavorite(business.id)

  return (
    <motion.article
      initial={entrance ? { opacity: 0, y: 20 } : false}
      animate={entrance ? { opacity: 1, y: 0 } : undefined}
      transition={{
        delay: index * 0.055,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative bg-card border border-border/60 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-lg hover:border-border"
    >

      {/* ── Featured badge ── */}
      {business.isFeatured && (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2.5 py-1 bg-amber-400/95 backdrop-blur-sm text-amber-900 text-xs font-bold rounded-full shadow-sm">
          ⭐ Destacado
        </div>
      )}

      {/* ── Favorite button ── */}
      <button
        onClick={() => toggleFavorite(business.id, business.name)}
        className="absolute top-2.5 right-2.5 z-10 p-1.5 bg-background/75 backdrop-blur-sm rounded-full shadow-sm transition-all hover:scale-110 active:scale-95"
        aria-label={fav ? 'Quitar favorito' : 'Guardar'}
      >
        <Heart
          size={15}
          className={fav ? 'fill-red-500 text-red-500' : 'text-foreground/50'}
        />
      </button>

      {/* ── Cover image ── */}
      <Link href={`/business/${business.slug}`} tabIndex={-1}>
        <div className="relative h-36 bg-muted overflow-hidden">
          {business.coverImage ? (
            <Image
              src={business.coverImage}
              alt={business.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width:640px) 50vw, 33vw"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-5xl bg-gradient-to-br from-muted to-muted/30">
              🏪
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>

      {/* ── Content ── */}
      <div className="p-3.5 space-y-3">

        {/* Logo + Name row */}
        <div className="flex items-start gap-2.5">
          <div className="shrink-0 -mt-7 relative z-10">
            {business.logo ? (
              <Image
                src={business.logo}
                alt=""
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-background shadow-warm-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ring-2 ring-background shadow-warm-sm">
                <span className="text-base">🏪</span>
              </div>
            )}
          </div>

          <div className="min-w-0 pt-1">
            <Link href={`/business/${business.slug}`}>
              <h3 className="text-sm font-bold truncate hover:text-primary transition-colors flex items-center gap-1">
                {business.name}
                {business.isVerified && (
                  <BadgeCheck size={13} className="text-blue-500 shrink-0" />
                )}
              </h3>
            </Link>
            <p className="text-xs text-muted-foreground flex items-center gap-0.5 mt-0.5">
              <MapPin size={10} className="text-primary/50" />
              {business.zone}
              {distanceKm !== undefined && (
                <span className="text-primary font-medium">· a {formatDistance(distanceKm)}</span>
              )}
            </p>
          </div>
        </div>

        {/* ── Rating + Categories ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
              {business.rating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({formatNumber(business.reviewCount)})
            </span>
          </div>
          <ReputationBadges business={business} max={1} size="xs" exclude={['verified']} />
          <div className="flex gap-1 flex-wrap ml-auto">
            {business.category.slice(0, 1).map((c) => (
              <CategoryBadge key={c} category={c} size="xs" />
            ))}
          </div>
        </div>

        {/* ── WhatsApp CTA ── */}
        <WhatsAppButton
          phone={business.whatsapp}
          businessName={business.name}
          size="sm"
          className="w-full"
        />
      </div>
    </motion.article>
  )
}
