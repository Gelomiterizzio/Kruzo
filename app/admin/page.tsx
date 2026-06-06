'use client'
import { useEffect, useState } from 'react'
import {
  collection, getCountFromServer, getAggregateFromServer,
  sum, average, query, where, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { BUSINESS_CATEGORIES } from '@/lib/utils/constants'
import { Users, Store, FileText, Flag, TrendingUp, CheckCircle, ShieldAlert, Star, MessageSquare, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  users: number; businesses: number; activeBiz: number; pendingBiz: number; posts: number; reports: number
  reviews: number; avgRating: number; recentBiz: number
  categories: { key: string; emoji: string; label: string; count: number }[]
}

const EMPTY: Stats = { users: 0, businesses: 0, activeBiz: 0, pendingBiz: 0, posts: 0, reports: 0, reviews: 0, avgRating: 0, recentBiz: 0, categories: [] }

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const weekAgo = Timestamp.fromMillis(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const [[u, b, ab, pb, p, r, recent], catCounts] = await Promise.all([
          Promise.all([
            getCountFromServer(collection(db, 'users')),
            getCountFromServer(collection(db, 'businesses')),
            getCountFromServer(query(collection(db, 'businesses'), where('status', '==', 'active'))),
            getCountFromServer(query(collection(db, 'businesses'), where('status', '==', 'pending'))),
            getCountFromServer(collection(db, 'posts')),
            getCountFromServer(collection(db, 'reports')),
            getCountFromServer(query(collection(db, 'businesses'), where('createdAt', '>=', weekAgo))),
          ]),
          // Real category distribution (one count() per category, in parallel).
          Promise.all(
            BUSINESS_CATEGORIES.map((c) =>
              getCountFromServer(query(collection(db, 'businesses'), where('category', 'array-contains', c.key))),
            ),
          ),
        ])

        // Real global review stats — aggregation over the business docs whose
        // reviewCount/rating are kept accurate by the Cloud Function (no N+1).
        // Needs the (reviewCount, rating) composite index; best-effort so the rest
        // of the dashboard still renders before that index is deployed.
        let reviews = 0
        let avgRating = 0
        try {
          const agg = await getAggregateFromServer(
            query(collection(db, 'businesses'), where('reviewCount', '>', 0)),
            { totalReviews: sum('reviewCount'), avgRating: average('rating') },
          )
          reviews = agg.data().totalReviews ?? 0
          avgRating = agg.data().avgRating ?? 0
        } catch { /* index not yet deployed */ }

        setStats({
          users: u.data().count,
          businesses: b.data().count,
          activeBiz: ab.data().count,
          pendingBiz: pb.data().count,
          posts: p.data().count,
          reports: r.data().count,
          reviews,
          avgRating,
          recentBiz: recent.data().count,
          categories: BUSINESS_CATEGORIES.map((c, i) => ({ key: c.key, emoji: c.emoji, label: c.label, count: catCounts[i].data().count })),
        })
      } catch (e) { console.error('Admin stats error:', e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const METRICS = [
    { icon: Users,        label: 'Usuarios',          value: stats.users,                                   color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950',     href: '/admin/users' },
    { icon: Store,        label: 'Total negocios',     value: stats.businesses,                              color: 'text-primary',    bg: 'bg-primary/5',                    href: '/admin/businesses' },
    { icon: CheckCircle,  label: 'Negocios activos',   value: stats.activeBiz,                               color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-950',   href: '/admin/businesses' },
    { icon: ShieldAlert,  label: 'Pendientes aprob.',  value: stats.pendingBiz,                              color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-950',   href: '/admin/businesses' },
    { icon: MessageSquare, label: 'Reseñas',           value: stats.reviews,                                 color: 'text-pink-500',   bg: 'bg-pink-50 dark:bg-pink-950',     href: '/admin/businesses' },
    { icon: Star,         label: 'Rating global',      value: stats.reviews > 0 ? stats.avgRating.toFixed(1) : '—', color: 'text-gold-500', bg: 'bg-gold-50 dark:bg-yellow-950', href: '/admin/businesses' },
    { icon: FileText,     label: 'Publicaciones',      value: stats.posts,                                   color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950', href: '/admin/posts' },
    { icon: Sparkles,     label: 'Nuevos (7 días)',    value: stats.recentBiz,                               color: 'text-cyan-500',   bg: 'bg-cyan-50 dark:bg-cyan-950',     href: '/admin/businesses' },
    { icon: Flag,         label: 'Reportes',           value: stats.reports,                                 color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-950',       href: '/admin/reports' },
  ]

  const maxCat = Math.max(1, ...stats.categories.map((c) => c.count))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Panel de administración</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Vista general de la plataforma KRUZO</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6,7,8,9].map(i => <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {METRICS.map(({ icon: Icon, label, value, color, bg, href }) => (
            <Link key={label} href={href} className="p-4 bg-card border border-border rounded-2xl hover:shadow-md hover:border-primary/20 transition-all group">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}><Icon size={18} className={color} /></div>
              <div className="text-2xl font-bold font-display">{typeof value === 'number' ? value.toLocaleString() : value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </Link>
          ))}
        </div>
      )}

      {/* Distribución real por categorías */}
      {!loading && (
        <div className="p-5 bg-card border border-border rounded-2xl">
          <h2 className="font-semibold mb-4">Distribución por categorías</h2>
          <div className="space-y-2.5">
            {stats.categories.map((c) => (
              <div key={c.key} className="flex items-center gap-3">
                <div className="w-32 shrink-0 text-sm flex items-center gap-1.5"><span>{c.emoji}</span> {c.label}</div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(c.count / maxCat) * 100}%` }} />
                </div>
                <div className="w-10 text-right text-sm font-medium tabular-nums">{c.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { href: '/admin/businesses', label: 'Gestionar negocios', desc: 'Aprobar, verificar, destacar', icon: Store },
          { href: '/admin/users', label: 'Gestionar usuarios', desc: 'Roles, bans, verificaciones', icon: Users },
          { href: '/admin/categories', label: 'Categorías', desc: 'Agregar y editar categorías', icon: TrendingUp },
          { href: '/admin/reports', label: 'Reportes pendientes', desc: 'Contenido reportado', icon: Flag },
        ].map(({ href, label, desc, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:shadow-sm hover:border-primary/20 transition-all">
            <Icon size={18} className="text-muted-foreground shrink-0" />
            <div><p className="font-medium text-sm">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
          </Link>
        ))}
      </div>
    </div>
  )
}
