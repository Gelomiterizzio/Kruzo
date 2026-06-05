'use client'
import { useInView } from 'react-intersection-observer'
import { PostCard } from './PostCard'
import { PostCardSkeleton } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { usePosts } from '@/lib/hooks/usePosts'
import { Loader2 } from 'lucide-react'

interface Props { category?: string; businessId?: string; pageSize?: number }

export function PostGrid({ category, businessId, pageSize }: Props) {
  const { posts, loading, loadingMore, hasMore, loadMore } = usePosts({ category, businessId, pageSize })
  const { ref } = useInView({ threshold: 0.1, onChange: v => { if (v && hasMore && !loadingMore) loadMore() } })

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {[1,2,3,4,5,6,7,8].map(i => <PostCardSkeleton key={i} />)}
    </div>
  )
  if (!posts.length) return (
    <EmptyState title="No hay publicaciones" description="Sé el primero en publicar en esta categoría."
      icon="post" action={{ label: 'Crear publicación', href: '/dashboard/posts/new' }} />
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {posts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)}
      </div>
      {hasMore && (
        <div ref={ref} className="flex justify-center py-4">
          {loadingMore && <Loader2 size={24} className="animate-spin text-muted-foreground" />}
        </div>
      )}
    </div>
  )
}
