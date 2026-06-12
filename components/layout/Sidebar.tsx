'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Store, FileText, BarChart3, Star,
  Settings, Plus, Users, LayoutGrid, Flag
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const DASHBOARD_LINKS = [
  { href: '/dashboard',            label: 'Resumen',        icon: LayoutDashboard, exact: true },
  { href: '/dashboard/business',   label: 'Mi negocio',     icon: Store },
  { href: '/dashboard/posts',      label: 'Publicaciones',  icon: FileText },
  { href: '/dashboard/analytics',  label: 'Estadísticas',   icon: BarChart3 },
  { href: '/dashboard/reviews',    label: 'Reseñas',        icon: Star },
  { href: '/dashboard/settings',   label: 'Configuración',  icon: Settings },
]

const ADMIN_LINKS = [
  { href: '/admin',              label: 'Dashboard',      icon: LayoutDashboard, exact: true },
  { href: '/admin/businesses',   label: 'Negocios',       icon: Store },
  { href: '/admin/posts',        label: 'Publicaciones',  icon: FileText },
  { href: '/admin/users',        label: 'Usuarios',       icon: Users },
  { href: '/admin/categories',   label: 'Categorías',     icon: LayoutGrid },
  { href: '/admin/reports',      label: 'Reportes',       icon: Flag },
]

interface SidebarProps { type?: 'dashboard' | 'admin' }

export function Sidebar({ type = 'dashboard' }: SidebarProps) {
  const pathname = usePathname()
  const links = type === 'admin' ? ADMIN_LINKS : DASHBOARD_LINKS

  return (
    <aside className="w-56 shrink-0 hidden md:block">
      <div className="sticky top-20 space-y-1">
        {type === 'dashboard' && (
          <Link
            href="/dashboard/posts/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors mb-3 w-full"
          >
            <Plus size={16} /> Nueva publicación
          </Link>
        )}

        {links.map((l) => {
          const isActive = l.exact ? pathname === l.href : pathname.startsWith(l.href)
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <l.icon size={18} />
              {l.label}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
