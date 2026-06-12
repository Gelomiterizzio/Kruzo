'use client'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { useAuth } from '@/lib/hooks/useAuth'
import { getBusinessById } from '@/lib/firebase/firestore'
import { PostForm } from '@/components/post/PostForm'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { Post } from '@/lib/types/post'

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['edit-post', id, user?.id],
    enabled: !!id && !!user,
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'posts', id))
      if (!snap.exists()) return null
      const post = { id: snap.id, ...snap.data() } as Post
      if (post.ownerId !== user!.id) return null
      const business = await getBusinessById(post.businessId)
      return business ? { post, business } : null
    },
  })

  if (isLoading || !user) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-muted-foreground" /></div>
  }
  if (!data) {
    return <div className="text-center py-20 text-muted-foreground">Publicación no encontrada</div>
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/dashboard/posts" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft size={14} /> Mis publicaciones
        </Link>
        <h1 className="text-2xl font-display font-bold">Editar publicación</h1>
      </div>
      <PostForm business={data.business} existing={data.post} />
    </div>
  )
}
