'use client'
import { useState, useCallback } from 'react'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { useDebouncedCallback } from 'use-debounce'
import type { Business } from '@/lib/types/business'
import type { Post } from '@/lib/types/post'

export interface SearchResults {
  businesses: Business[]
  posts: Post[]
  total: number
}

export function useSearch() {
  const [results, setResults] = useState<SearchResults>({ businesses: [], posts: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (q: string, category?: string, zone?: string) => {
    if (!q.trim() && !category) { setResults({ businesses: [], posts: [], total: 0 }); return }
    setLoading(true)
    setError(null)
    try {
      // Basic Firestore search (for full-text use Algolia)
      const bizConstraints = [where('status', '==', 'active'), orderBy('rating', 'desc'), limit(20)]
      if (category) bizConstraints.splice(1, 0, where('category', 'array-contains', category))
      if (zone) bizConstraints.splice(1, 0, where('zone', '==', zone))

      const postConstraints = [where('status', '==', 'active'), orderBy('createdAt', 'desc'), limit(20)]
      if (category) postConstraints.splice(1, 0, where('category', '==', category))

      const [bizSnap, postSnap] = await Promise.all([
        getDocs(query(collection(db, 'businesses'), ...bizConstraints)),
        getDocs(query(collection(db, 'posts'), ...postConstraints)),
      ])

      const businesses = bizSnap.docs.map(d => ({ id: d.id, ...d.data() } as Business))
        .filter(b => !q.trim() || b.name.toLowerCase().includes(q.toLowerCase()) ||
          b.description?.toLowerCase().includes(q.toLowerCase()) ||
          b.tags?.some(t => t.toLowerCase().includes(q.toLowerCase())))

      const posts = postSnap.docs.map(d => ({ id: d.id, ...d.data() } as Post))
        .filter(p => !q.trim() || p.title.toLowerCase().includes(q.toLowerCase()) ||
          p.description?.toLowerCase().includes(q.toLowerCase()) ||
          p.tags?.some(t => t.toLowerCase().includes(q.toLowerCase())))

      setResults({ businesses, posts, total: businesses.length + posts.length })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error en búsqueda')
    } finally {
      setLoading(false)
    }
  }, [])

  const debouncedSearch = useDebouncedCallback(search, 350)

  return { results, loading, error, search, debouncedSearch }
}
