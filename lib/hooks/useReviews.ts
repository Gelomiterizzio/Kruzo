'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { type DocumentSnapshot } from 'firebase/firestore'
import { getReviews } from '@/lib/firebase/firestore'
import type { Review } from '@/lib/types/review'

export function useReviews(businessId: string) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastDocRef = useRef<DocumentSnapshot | null>(null)

  const fetchReviews = useCallback(async (reset = false) => {
    if (!businessId) { setLoading(false); return }
    reset ? setLoading(true) : setLoadingMore(true)
    setError(null)
    try {
      const cursor = reset ? undefined : (lastDocRef.current ?? undefined)
      const { reviews: data, lastDoc } = await getReviews(businessId, 5, cursor)
      lastDocRef.current = lastDoc
      setReviews((prev) => reset ? data : [...prev, ...data])
      setHasMore(data.length === 5)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar reseñas')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [businessId])

  useEffect(() => {
    lastDocRef.current = null
    fetchReviews(true)
  }, [businessId])

  return {
    reviews,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore: () => fetchReviews(false),
    refetch: () => { lastDocRef.current = null; fetchReviews(true) },
  }
}
