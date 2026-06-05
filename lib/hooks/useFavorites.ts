'use client'
import { useCallback } from 'react'
import { toggleFavorite } from '@/lib/firebase/firestore'
import { useStore } from '@/lib/store/useStore'
import { useAuth } from './useAuth'
import { toast } from 'sonner'

export function useFavorites() {
  const { user } = useAuth()
  const { localFavorites, addFavorite, removeFavorite } = useStore()

  const isFavorite = useCallback((id: string) => localFavorites.includes(id), [localFavorites])

  const toggle = useCallback(async (businessId: string, name?: string) => {
    if (!user) { toast.error('Inicia sesión para guardar favoritos'); return }
    const isFav = isFavorite(businessId)
    isFav ? removeFavorite(businessId) : addFavorite(businessId)
    try {
      await toggleFavorite(user.id, businessId, isFav)
      toast.success(isFav ? 'Eliminado de favoritos' : `${name ?? 'Negocio'} guardado en favoritos`)
    } catch {
      isFav ? addFavorite(businessId) : removeFavorite(businessId)
      toast.error('Error al actualizar favoritos')
    }
  }, [user, isFavorite, addFavorite, removeFavorite])

  return { isFavorite, toggleFavorite: toggle, favorites: localFavorites }
}
