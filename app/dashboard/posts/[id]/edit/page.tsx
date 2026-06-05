'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { useAuth } from '@/lib/hooks/useAuth'
import { getBusinessById } from '@/lib/firebase/firestore'
import { PostForm } from '@/components/post/PostForm'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { Post } from '@/lib/types/post'
import type { Business } from '@/lib/types/business'

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!id || !user) return
      const [postSnap] = await Promise.all([getDoc(doc(db, 'posts', id))])
      if (postSnap.exists()) {
        const p = { id: postSnap.id, ...postSnap.data() } as Post
        if (p.ownerId !== user.id) { setLoading(false); return }
        setPost(p)
        const biz = await getBusinessById(p.businessId)
        setBusiness(biz)
      }
      setLoading(false)
    }
    load()
  }, [id, user])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-muted-foreground" /></div>
  if (!post || !business) return <div className="text-center py-20 text-muted-foreground">Publicación no encontrada</div>

  return (
    <div className="space-y-5">
      <div>
        <Link href="/dashboard/posts" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft size={14} /> Mis publicaciones
        </Link>
        <h1 className="text-2xl font-display font-bold">Editar publicación</h1>
      </div>
      <PostForm business={business} existing={post} />
    </div>
  )
}
