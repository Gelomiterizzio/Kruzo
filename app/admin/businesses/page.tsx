'use client'
import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Business } from '@/lib/types/business'
import { BadgeCheck, Star, Eye, CheckCircle, Ban, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatRelativeTime } from '@/lib/utils/formatters'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

const STATUS_CFG = {
  active:    { label: 'Activo',     cls: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400' },
  pending:   { label: 'Pendiente',  cls: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400' },
  suspended: { label: 'Suspendido', cls: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400' },
  rejected:  { label: 'Rechazado',  cls: 'bg-muted text-muted-foreground' },
}

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [toSuspend, setToSuspend] = useState<Business | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const snap = await getDocs(query(collection(db, 'businesses'), orderBy('createdAt', 'desc'), limit(100)))
        setBusinesses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Business)))
      } catch { toast.error('Error al cargar negocios') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const STATUS_VERB: Record<string, string> = { active: 'aprobado', suspended: 'suspendido', rejected: 'rechazado' }
  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'businesses', id), { status })
      setBusinesses(prev => prev.map(b => b.id === id ? { ...b, status: status as Business['status'] } : b))
      toast.success(`Negocio ${STATUS_VERB[status] ?? 'actualizado'}`)
    } catch { toast.error('Error al actualizar') }
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'businesses', id), { isFeatured: !current })
      setBusinesses(prev => prev.map(b => b.id === id ? { ...b, isFeatured: !current } : b))
      toast.success(!current ? 'Negocio destacado ⭐' : 'Quitado de destacados')
    } catch { toast.error('Error al actualizar') }
  }

  const toggleVerified = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'businesses', id), { isVerified: !current })
      setBusinesses(prev => prev.map(b => b.id === id ? { ...b, isVerified: !current } : b))
      toast.success(!current ? 'Negocio verificado ✓' : 'Verificación removida')
    } catch { toast.error('Error al actualizar') }
  }

  const filtered = filter === 'all' ? businesses : businesses.filter(b => b.status === filter)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Gestión de negocios</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} de {businesses.length} negocios</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all','pending','active','suspended'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-xl border transition-colors ${filter === f ? 'bg-primary text-white border-primary' : 'border-border hover:bg-accent'}`}>
              {f === 'all' ? 'Todos' : STATUS_CFG[f as keyof typeof STATUS_CFG]?.label ?? f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-muted rounded-2xl animate-pulse" />)}</div>
      ) : !filtered.length ? (
        <p className="text-center text-muted-foreground py-10">No hay negocios con este filtro</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(b => {
            const cfg = STATUS_CFG[b.status] ?? STATUS_CFG.pending
            return (
              <div key={b.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-2xl hover:shadow-sm transition-all">
                {b.logo ? <img src={b.logo} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  : <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 text-xl">🏪</div>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">{b.name}</p>
                    {b.isVerified && <BadgeCheck size={13} className="text-blue-500 shrink-0" />}
                    {b.isFeatured && <span className="text-xs text-gold-500">⭐</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{b.zone} · ⭐ {b.rating.toFixed(1)} · {b.reviewCount} reseñas · {formatRelativeTime(b.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                  {b.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(b.id, 'active')} className="p-1.5 rounded-lg bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 hover:bg-green-200 transition-colors" title="Aprobar">
                        <CheckCircle size={14} />
                      </button>
                      <button onClick={() => updateStatus(b.id, 'rejected')} className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 hover:bg-red-200 transition-colors" title="Rechazar">
                        <XCircle size={14} />
                      </button>
                    </>
                  )}
                  {b.status === 'active' && (
                    <button onClick={() => setToSuspend(b)} className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 hover:bg-red-200 transition-colors" title="Suspender">
                      <Ban size={14} />
                    </button>
                  )}
                  <button onClick={() => toggleFeatured(b.id, b.isFeatured)} className={`p-1.5 rounded-lg transition-colors ${b.isFeatured ? 'bg-gold-100 dark:bg-yellow-950 text-gold-600' : 'hover:bg-accent'}`} title="Destacar">
                    <Star size={14} />
                  </button>
                  <button onClick={() => toggleVerified(b.id, b.isVerified)} className={`p-1.5 rounded-lg transition-colors ${b.isVerified ? 'bg-blue-100 dark:bg-blue-950 text-blue-600' : 'hover:bg-accent'}`} title="Verificar">
                    <BadgeCheck size={14} />
                  </button>
                  <a href={`/business/${b.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Ver">
                    <Eye size={14} />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!toSuspend}
        title="¿Suspender este negocio?"
        description={toSuspend ? `"${toSuspend.name}" dejará de ser visible para los usuarios hasta que vuelva a aprobarse.` : ''}
        confirmLabel="Suspender"
        variant="danger"
        onConfirm={() => { if (toSuspend) updateStatus(toSuspend.id, 'suspended'); setToSuspend(null) }}
        onCancel={() => setToSuspend(null)}
      />
    </div>
  )
}
