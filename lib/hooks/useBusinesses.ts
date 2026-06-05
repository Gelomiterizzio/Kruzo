'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { type DocumentSnapshot } from 'firebase/firestore'
import { getBusinesses } from '@/lib/firebase/firestore'
import type { Business } from '@/lib/types/business'

interface Options {
  category?: string
  featured?: boolean
  zone?: string
  pageSize?: number
}

export function useBusinesses({ category, featured, zone, pageSize = 12 }: Options = {}) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastDocRef = useRef<DocumentSnapshot | null>(null)
  const abortRef = useRef(false)

  const fetchBusinesses = useCallback(async (reset = false) => {
    reset ? setLoading(true) : setLoadingMore(true)
    setError(null)
    abortRef.current = false
    try {
      const cursor = reset ? undefined : (lastDocRef.current ?? undefined)
      const { businesses: data, lastDoc } = await getBusinesses({ category, featured, zone, pageSize, cursor })
      if (abortRef.current) return
      lastDocRef.current = lastDoc
      setBusinesses((prev) => reset ? data : [...prev, ...data])
      setHasMore(data.length === pageSize)
    } catch (e) {
      if (!abortRef.current) setError(e instanceof Error ? e.message : 'Error al cargar negocios')
    } finally {
      if (!abortRef.current) { setLoading(false); setLoadingMore(false) }
    }
  }, [category, featured, zone, pageSize])

  useEffect(() => {
    abortRef.current = false
    lastDocRef.current = null
    fetchBusinesses(true)
    return () => { abortRef.current = true }
  }, [category, featured, zone])

  return {
    businesses, loading, loadingMore, hasMore, error,
    loadMore: () => fetchBusinesses(false),
    refetch: () => { lastDocRef.current = null; fetchBusinesses(true) },
  }
}
