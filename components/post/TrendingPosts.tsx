'use client'
import { useQuery } from '@tanstack/react-query'
import { PostCard } from './PostCard'
import { GridSkeleton } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { searchPosts } from '@/lib/firebase/firestore'

/** Active posts genuinely ordered by real view count (most viewed first). */
export function TrendingPosts({ count = 12 }: { count?: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['trending-posts', count],
    queryFn: async () => (await searchPosts({ sort: 'popular' })).slice(0, count),
  })

  if (isLoading) return <GridSkeleton count={8} variant="post" />
  if (!data?.length) return (
    <EmptyState title="No hay publicaciones" description="Sé el primero en publicar tus productos o servicios."
      icon="post" action={{ label: 'Crear publicación', href: '/dashboard/posts/new' }} />
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {data.map((p, i) => <PostCard key={p.id} post={p} index={i} />)}
    </div>
  )
}
