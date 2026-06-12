'use client'
import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Post } from '@/lib/types/post'
import { formatPrice, formatRelativeTime } from '@/lib/utils/formatters'
import { FileText, Eye, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [toDelete, setToDelete] = useState<Post | null>(null)

  useEffect(() => {
    getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(100)))
      .then(snap => setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post))))
      .catch(() => toast.error('Error al cargar publicaciones'))
      .finally(() => setLoading(false))
  }, [])

  const toggleStatus = async (id: string, status: string) => {
    const next = status === 'active' ? 'paused' : 'active'
    try {
      await updateDoc(doc(db, 'posts', id), { status: next })
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status: next as Post['status'] } : p))
      toast.success(`Publicación ${next === 'active' ? 'activada' : 'pausada'}`)
    } catch { toast.error('Error') }
  }

  const deletePost = async (id: string) => {
    try {
      await updateDoc(doc(db, 'posts', id), { status: 'deleted' })
      setPosts(prev => prev.filter(p => p.id !== id))
      toast.success('Publicación eliminada')
    } catch { toast.error('Error al eliminar') }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><FileText size={22} /> Publicaciones</h1>
        <p className="text-muted-foreground text-sm">{posts.length} publicaciones</p>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-muted rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {posts.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-2xl hover:shadow-sm transition-all">
              {p.images[0]
                ? <img src={p.images[0]} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                : <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0"><FileText size={16} className="text-muted-foreground" /></div>
              }
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground truncate">{p.businessName} · {p.priceType === 'consult' ? 'Consultar' : formatPrice(p.price)} · {formatRelativeTime(p.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>{p.status}</span>
                <button onClick={() => toggleStatus(p.id, p.status)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Cambiar estado">
                  {p.status === 'active' ? <ToggleRight size={16} className="text-green-500" /> : <ToggleLeft size={16} className="text-muted-foreground" />}
                </button>
                <Link href={`/post/${p.id}`} target="_blank" className="p-1.5 rounded-lg hover:bg-accent transition-colors"><Eye size={14} /></Link>
                <button onClick={() => setToDelete(p)} aria-label="Eliminar publicación" className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-950 text-muted-foreground hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="¿Eliminar esta publicación?"
        description={toDelete ? `"${toDelete.title}" de ${toDelete.businessName} dejará de ser visible permanentemente.` : ''}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => { if (toDelete) deletePost(toDelete.id); setToDelete(null) }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
