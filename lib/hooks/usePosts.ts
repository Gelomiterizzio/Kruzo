'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { type DocumentSnapshot } from 'firebase/firestore'
import { getPosts, getPostsByBusiness } from '@/lib/firebase/firestore'
import type { Post } from '@/lib/types/post'

interface Options { category?: string; businessId?: string; pageSize?: number }

export function usePosts({ category, businessId, pageSize = 12 }: Options = {}) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastDocRef = useRef<DocumentSnapshot | null>(null)

  const fetchPosts = useCallback(async (reset = false) => {
    reset ? setLoading(true) : setLoadingMore(true)
    setError(null)
    try {
      let result: { posts: Post[]; lastDoc: DocumentSnapshot | null }
      const cursor = reset ? undefined : (lastDocRef.current ?? undefined)

      if (businessId) {
        result = await getPostsByBusiness(businessId, pageSize, cursor)
      } else {
        result = await getPosts({ category, pageSize, cursor })
      }

      lastDocRef.current = result.lastDoc
      setPosts(prev => reset ? result.posts : [...prev, ...result.posts])
      setHasMore(result.posts.length === pageSize)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar publicaciones')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [category, businessId, pageSize])

  useEffect(() => {
    lastDocRef.current = null
    fetchPosts(true)
  }, [category, businessId])

  return {
    posts, loading, loadingMore, hasMore, error,
    loadMore: () => fetchPosts(false),
    refetch: () => { lastDocRef.current = null; fetchPosts(true) },
  }
}
