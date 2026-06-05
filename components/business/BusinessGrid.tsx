'use client'
import { useRef, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { BusinessCard } from './BusinessCard'
import { GridSkeleton } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { useBusinesses } from '@/lib/hooks/useBusinesses'
import { Loader2 } from 'lucide-react'

interface Props { category?: string; featured?: boolean; zone?: string; pageSize?: number }

export function BusinessGrid({ category, featured, zone, pageSize }: Props) {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {businesses.map((b, i) => <BusinessCard key={b.id} business={b} index={i} />)}
      </div>
      {hasMore && (
        <div ref={ref} className="flex justify-center py-4">
          {loadingMore && <Loader2 size={24} className="animate-spin text-muted-foreground" />}
        </div>
      )}
    </div>
  )
}
