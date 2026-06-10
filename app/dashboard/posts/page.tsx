'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Pencil, Eye, Trash2, FileText } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { usePosts } from '@/lib/hooks/usePosts'
import { getBusinessById, updatePost } from '@/lib/firebase/firestore'
import { formatPrice, formatRelativeTime } from '@/lib/utils/formatters'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import Image from 'next/image'
import { toast } from 'sonner'
import type { Post } from '@/lib/types/post'

export default function DashboardPostsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const businessId = user?.businessIds?.[0]
  const [toDelete, setToDelete] = useState<Post | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { data: business } = useQuery({
    queryKey: ['business', businessId],
    queryFn: () => getBusinessById(businessId!),
    enabled: !!businessId,
  })

  // Only fetch once the business is known — otherwise the hook would list the
  // whole platform's posts for a moment.
  const { posts, loading } = usePosts({ businessId: business?.id, pageSize: 20, enabled: !!business })

  const deletePost = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await updatePost(toDelete.id, { status: 'deleted' })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Publicación eliminada')
    } catch { toast.error('Error al eliminar') }
    finally { setDeleting(false); setToDelete(null) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Publicaciones</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {loading ? 'Cargando…' : `${posts.length} ${posts.length === 1 ? 'publicación' : 'publicaciones'}`}
          </p>
        </div>
        <Link href="/dashboard/posts/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={16} /> Nueva
        </Link>
      </div>

      {loading || (businessId && !business) ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />)}</div>
      ) : !businessId ? (
        <EmptyState title="Primero crea tu negocio" description="Necesitas registrar tu negocio antes de publicar productos o servicios."
          icon="store" action={{ label: 'Crear negocio', href: '/dashboard/business' }} />
      ) : !posts.length ? (
        <EmptyState title="Sin publicaciones" description="Crea tu primera publicación para mostrar tus productos o servicios."
          icon="post" action={{ label: 'Crear publicación', href: '/dashboard/posts/new' }} />
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-3 bg-card border border-border rounded-2xl hover:shadow-sm transition-all">
              {post.images[0] ? (
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                  <Image src={post.images[0]} alt="" fill sizes="56px" className="object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center shrink-0"><FileText size={20} className="text-muted-foreground" /></div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{post.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-semibold text-primary">
                    {post.priceType === 'consult' ? 'Consultar' : post.priceType === 'free' ? 'Gratis' : formatPrice(post.price)}
                  </span>
                  <span className="text-xs text-muted-foreground">· {formatRelativeTime(post.createdAt)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${post.status === 'active' ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                    {post.status === 'active' ? 'Activo' : post.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link href={`/post/${post.id}`} aria-label="Ver publicación" className="p-2 rounded-lg hover:bg-accent transition-colors"><Eye size={15} /></Link>
                <Link href={`/dashboard/posts/${post.id}/edit`} aria-label="Editar publicación" className="p-2 rounded-lg hover:bg-accent transition-colors"><Pencil size={15} /></Link>
                <button onClick={() => setToDelete(post)} aria-label="Eliminar publicación"
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="¿Eliminar publicación?"
        description={toDelete ? `"${toDelete.title}" dejará de ser visible en KRUZO.` : ''}
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleting}
        onConfirm={deletePost}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
