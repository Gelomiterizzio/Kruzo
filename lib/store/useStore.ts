import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppUser } from '@/lib/types/user'

interface KruzoState {
  user: AppUser | null
  setUser: (user: AppUser | null) => void

  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void

  localFavorites: string[]
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
  setFavorites: (ids: string[]) => void
}

export const useStore = create<KruzoState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),

      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
      selectedCategory: '',
      setSelectedCategory: (cat) => set({ selectedCategory: cat }),
      isMobileMenuOpen: false,
      setIsMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

      localFavorites: [],
      addFavorite: (id) => set((s) => ({ localFavorites: [...s.localFavorites, id] })),
      removeFavorite: (id) => set((s) => ({ localFavorites: s.localFavorites.filter((f) => f !== id) })),
      setFavorites: (ids) => set({ localFavorites: ids }),
    }),
    {
      name: 'kruzo-store',
      partialize: (s) => ({ localFavorites: s.localFavorites }),
      skipHydration: true,
    }
  )
)
