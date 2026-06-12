'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  collection, query, orderBy, limit, getDocs, doc, updateDoc, getDoc, type Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Flag, AlertTriangle, EyeOff, Check, Mail, ExternalLink } from 'lucide-react'
import { formatRelativeTime, truncate } from '@/lib/utils/formatters'
import { toast } from 'sonner'

interface Report {
  id: string
  type: string
  businessId: string
  reviewId: string
  reporterId: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: Timestamp
  reviewComment?: string
  reviewUserName?: string
  businessName?: string
}

interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  status: string
  createdAt: Timestamp
}

export default function AdminReportsPage() {
  const queryClient = useQueryClient()
  const [acting, setActing] = useState<string | null>(null)

  const { data: reports = [], isLoading: loadingReports } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const snap = await getDocs(query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(50)))
      const base = snap.docs.map(d => ({ id: d.id, ...d.data() } as Report))
      // Enrich review reports with the reported content for context.
      return Promise.all(base.map(async (r) => {
        if (r.type !== 'review' || !r.businessId || !r.reviewId) return r
        try {
          const [revSnap, bizSnap] = await Promise.all([
            getDoc(doc(db, 'businesses', r.businessId, 'reviews', r.reviewId)),
            getDoc(doc(db, 'businesses', r.businessId)),
          ])
          return {
            ...r,
            reviewComment: revSnap.exists() ? (revSnap.data().comment as string) : '(reseña eliminada)',
            reviewUserName: revSnap.exists() ? (revSnap.data().userName as string) : '',
            businessName: bizSnap.exists() ? (bizSnap.data().name as string) : '',
          }
        } catch { return r }
      }))
    },
  })

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['admin-contact-messages'],
    queryFn: async () => {
      const snap = await getDocs(query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc'), limit(50)))
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ContactMessage))
    },
  })

  const hideReview = async (r: Report) => {
    setActing(r.id)
    try {
      await updateDoc(doc(db, 'businesses', r.businessId, 'reviews', r.reviewId), { isHidden: true })
      await updateDoc(doc(db, 'reports', r.id), { status: 'resolved' })
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
      toast.success('Reseña ocultada y reporte resuelto')
    } catch { toast.error('Error al ocultar la reseña') }
    finally { setActing(null) }
  }

  const dismissReport = async (r: Report) => {
    setActing(r.id)
    try {
      await updateDoc(doc(db, 'reports', r.id), { status: 'dismissed' })
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
      toast.success('Reporte descartado')
    } catch { toast.error('Error al actualizar el reporte') }
    finally { setActing(null) }
  }

  const pending = reports.filter(r => r.status === 'pending')
  const resolved = reports.filter(r => r.status !== 'pending')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Flag size={22} /> Reportes</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Contenido reportado por usuarios y mensajes de contacto</p>
      </div>

      {/* ── Reports ── */}
      <section className="space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Pendientes {!loadingReports && `(${pending.length})`}
        </h2>
        {loadingReports ? (
          <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}</div>
        ) : !pending.length ? (
          <div className="p-8 text-center bg-card border border-border rounded-2xl">
            <AlertTriangle size={28} className="mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium text-sm">No hay reportes pendientes</p>
            <p className="text-xs text-muted-foreground mt-1">Los reportes de usuarios aparecerán aquí</p>
          </div>
        ) : (
          pending.map(r => (
            <div key={r.id} className="p-4 bg-card border border-border rounded-2xl space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">Reseña reportada</span>
                  {r.businessName && (
                    <span className="text-muted-foreground text-xs">
                      en <strong className="text-foreground">{r.businessName}</strong>
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">· {formatRelativeTime(r.createdAt)}</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => hideReview(r)} disabled={acting === r.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-50">
                    <EyeOff size={13} /> Ocultar reseña
                  </button>
                  <button onClick={() => dismissReport(r)} disabled={acting === r.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50">
                    <Check size={13} /> Descartar
                  </button>
                </div>
              </div>
              {r.reviewComment && (
                <blockquote className="text-sm text-muted-foreground bg-muted rounded-xl p-3 border-l-2 border-border">
                  {r.reviewUserName && <span className="font-medium text-foreground">{r.reviewUserName}: </span>}
                  {truncate(r.reviewComment, 240)}
                </blockquote>
              )}
            </div>
          ))
        )}
        {resolved.length > 0 && (
          <p className="text-xs text-muted-foreground">{resolved.length} reporte(s) ya gestionados</p>
        )}
      </section>

      {/* ── Contact messages ── */}
      <section className="space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <Mail size={13} /> Mensajes de contacto {!loadingMessages && `(${messages.length})`}
        </h2>
        {loadingMessages ? (
          <div className="h-20 bg-muted rounded-2xl animate-pulse" />
        ) : !messages.length ? (
          <p className="text-sm text-muted-foreground p-6 text-center bg-card border border-border rounded-2xl">
            No hay mensajes de contacto
          </p>
        ) : (
          messages.map(m => (
            <div key={m.id} className="p-4 bg-card border border-border rounded-2xl">
              <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                <p className="text-sm font-medium">{m.name} <a href={`mailto:${m.email}`} className="text-primary text-xs font-normal hover:underline inline-flex items-center gap-0.5">{m.email} <ExternalLink size={10} /></a></p>
                <span className="text-xs text-muted-foreground">{formatRelativeTime(m.createdAt)}</span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{m.message}</p>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
