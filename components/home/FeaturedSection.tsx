'use client'
import { Star } from 'lucide-react'
import { BusinessCard } from '@/components/business/BusinessCard'
import { BusinessCardSkeleton } from '@/components/shared/SkeletonCard'
import { useBusinesses } from '@/lib/hooks/useBusinesses'
import Link from 'next/link'

interface FeaturedSectionProps {
  title: string
  subtitle?: string
  featured?: boolean
  category?: string
  viewAllHref?: string
}

export function FeaturedSection({
  title,
  subtitle,
  featured,
  category,
  viewAllHref,
}: FeaturedSectionProps) {
  const { businesses, loading } = useBusinesses({ featured, category, pageSize: 8 })

  return (
    <section className="container py-8">

      {/* ── Section header ── */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-black flex items-center gap-2">
            {featured && (
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950/50">
                <Star size={14} className="fill-amber-400 text-amber-400" />
              </span>
            )}
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm font-semibold text-primary hover:underline underline-offset-4 shrink-0 ml-4"
          >
            Ver todos →
          </Link>
        )}
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <BusinessCardSkeleton key={i} />
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No hay negocios disponibles aún
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {businesses.map((b, i) => (
            // BusinessCard animates its own entrance — no extra wrapper animation.
            <BusinessCard key={b.id} business={b} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}
