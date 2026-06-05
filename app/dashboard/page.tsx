'use client'
import { useAuth } from '@/lib/hooks/useAuth'
import { useBusinesses } from '@/lib/hooks/useBusinesses'
import { usePosts } from '@/lib/hooks/usePosts'
import { formatNumber } from '@/lib/utils/formatters'
import { Store, FileText, Star, Eye, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">
          Buenos días, {user?.displayName?.split(' ')[0]} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Aquí está el resumen de tu actividad</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Eye,      label: 'Visitas hoy',   value: '—',  color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950' },
          { icon: Star,     label: 'Rating',        value: '—',  color: 'text-gold-500',   bg: 'bg-gold-50 dark:bg-yellow-950' },
          { icon: FileText, label: 'Publicaciones', value: '—',  color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-950' },
          { icon: TrendingUp, label: 'Contactos',   value: '—',  color: 'text-primary',    bg: 'bg-primary/5' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="p-4 bg-card border border-border rounded-2xl">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <div className="text-2xl font-bold font-display">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { href: '/dashboard/business', icon: Store, label: 'Gestionar mi negocio', desc: 'Editar información y fotos', color: 'text-primary' },
          { href: '/dashboard/posts/new', icon: Plus, label: 'Nueva publicación', desc: 'Agregar producto o servicio', color: 'text-green-600' },
          { href: '/dashboard/analytics', icon: TrendingUp, label: 'Ver estadísticas', desc: 'Visitas y contactos', color: 'text-blue-600' },
        ].map(({ href, icon: Icon, label, desc, color }) => (
          <Link key={href} href={href}
            className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:shadow-md hover:border-primary/30 transition-all group">
            <Icon size={20} className={color} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-muted-foreground truncate">{desc}</p>
            </div>
            <ArrowRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
        ))}
      </div>

      {/* Setup guide */}
      {!user?.businessIds?.length && (
        <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl">
          <h3 className="font-semibold mb-1">Empieza registrando tu negocio</h3>
          <p className="text-sm text-muted-foreground mb-4">Crea tu perfil de negocio para empezar a aparecer en KRUZO</p>
          <Link href="/dashboard/business" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90">
            <Store size={16} /> Crear negocio
          </Link>
        </div>
      )}
    </div>
  )
}
