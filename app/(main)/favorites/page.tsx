'use client'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'
import { BusinessCard } from '@/components/business/BusinessCard'
import { BusinessCardSkeleton } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAuth } from '@/lib/hooks/useAuth'
import { useStore } from '@/lib/store/useStore'
import { getBusinessById } from '@/lib/firebase/firestore'
import type { Business } from '@/lib/types/business'

export default function FavoritesPage() {
  const { isAuthenticated } = useAuth()
  const { localFavorites } = useStore()

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['favorites', [...localFavorites].sort()],
    enabled: isAuthenticated && localFavorites.length > 0,
    queryFn: async () => {
      const results = await Promise.allSettled(localFavorites.map(id => getBusinessById(id)))
      return results
        .filter((r): r is PromiseFulfilledResult<Business> => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value)
        // Suspended/pending favorites would 404 on click — only show live ones.
        .filter(b => b.status === 'active')
    },
  })

  if (!isAuthenticated) return (
    <div className="container pt-20 pb-16">
      <EmptyState
        icon="favorite"
        title="Tus favoritos"
        description="Inicia sesión para guardar tus negocios favoritos y encontrarlos en cualquier dispositivo."
        action={{ label: 'Iniciar sesión', href: '/login' }}
        secondaryAction={{ label: 'Explorar negocios', href: '/explore' }}
      />
    </div>
  )

  const loading = localFavorites.length > 0 && isLoading

  return (
    <div className="container pt-24 pb-16 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Heart size={22} className="fill-red-500 text-red-500" /> Favoritos
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {loading ? 'Cargando…' : `${businesses.length} ${businesses.length === 1 ? 'negocio guardado' : 'negocios guardados'}`}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <BusinessCardSkeleton key={i} />)}
        </div>
      ) : !businesses.length ? (
        <EmptyState
          icon="favorite"
          title="No tienes favoritos aún"
          description="Guarda negocios tocando el corazón en su tarjeta y aparecerán aquí."
          action={{ label: 'Explorar negocios', href: '/explore' }}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {businesses
              .filter(b => localFavorites.includes(b.id))
              .map((b, i) => (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2, delay: 0 } }}
                  transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <BusinessCard business={b} index={i} entrance={false} />
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
