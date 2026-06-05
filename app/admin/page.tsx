'use client'
import { useEffect, useState } from 'react'
import { collection, getCountFromServer, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Users, Store, FileText, Flag, TrendingUp, CheckCircle, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

interface Stats { users: number; businesses: number; activeBiz: number; pendingBiz: number; posts: number; reports: number }

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ users: 0, businesses: 0, activeBiz: 0, pendingBiz: 0, posts: 0, reports: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [u, b, ab, pb, p, r] = await Promise.all([
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(collection(db, 'businesses')),
          getCountFromServer(query(collection(db, 'businesses'), where('status', '==', 'active'))),
          getCountFromServer(query(collection(db, 'businesses'), where('status', '==', 'pending'))),
          getCountFromServer(collection(db, 'posts')),
          getCountFromServer(collection(db, 'reports')),
        ])
        setStats({ users: u.data().count, businesses: b.data().count, activeBiz: ab.data().count, pendingBiz: pb.data().count, posts: p.data().count, reports: r.data().count })
      } catch (e) { console.error('Admin stats error:', e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const METRICS = [
    { icon: Users,       label: 'Usuarios',          value: stats.users,       color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950',    href: '/admin/users' },
    { icon: Store,       label: 'Total negocios',     value: stats.businesses,  color: 'text-primary',    bg: 'bg-primary/5',                   href: '/admin/businesses' },
    { icon: CheckCircle, label: 'Negocios activos',   value: stats.activeBiz,   color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-950',  href: '/admin/businesses' },
    { icon: ShieldAlert, label: 'Pendientes aprob.',  value: stats.pendingBiz,  color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-950',  href: '/admin/businesses' },
    { icon: FileText,    label: 'Publicaciones',      value: stats.posts,       color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950', href: '/admin/posts' },
    { icon: Flag,        label: 'Reportes',           value: stats.reports,     color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-950',      href: '/admin/reports' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Panel de administración</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Vista general de la plataforma KRUZO</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {METRICS.map(({ icon: Icon, label, value, color, bg, href }) => (
            <Link key={label} href={href} className="p-4 bg-card border border-border rounded-2xl hover:shadow-md hover:border-primary/20 transition-all group">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}><Icon size={18} className={color} /></div>
              <div className="text-2xl font-bold font-display">{value.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </Link>
          ))}
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
