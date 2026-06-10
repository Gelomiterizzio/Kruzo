'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, Eye, Heart, Star, MessageSquare, FileText, TrendingUp } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { getBusinessById, getPostsByBusiness } from '@/lib/firebase/firestore'
import { formatNumber } from '@/lib/utils/formatters'
import { EmptyState } from '@/components/shared/EmptyState'

// Every number on this page is real, read straight from Firestore documents
// that Cloud Functions / server counters keep up to date. No simulated data.
export default function AnalyticsPage() {
  const { user } = useAuth()
  const businessId = user?.businessIds?.[0]

  const { data: business, isLoading: bizLoading } = useQuery({
    queryKey: ['business', businessId],
    queryFn: () => getBusinessById(businessId!),
    enabled: !!businessId,
  })

  const { data: topPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['analytics-posts', businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { posts } = await getPostsByBusiness(businessId!, 50)
      return [...posts].sort((a, b) => b.viewCount - a.viewCount).slice(0, 8)
    },
  })

  if (!businessId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><BarChart3 size={22} /> Estadísticas</h1>
        <EmptyState title="Primero crea tu negocio" description="Cuando tu negocio esté activo verás aquí sus visitas, guardados y reseñas reales."
          icon="store" action={{ label: 'Crear negocio', href: '/dashboard/business' }} />
      </div>
    )
  }

  const cards = [
    { icon: Eye,           label: 'Visitas al perfil', value: business ? formatNumber(business.viewCount) : '—',     color: 'text-blue-500',  bg: 'bg-blue-50 dark:bg-blue-950' },
    { icon: Heart,         label: 'Guardados',         value: business ? formatNumber(business.favoriteCount) : '—', color: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-950' },
    { icon: MessageSquare, label: 'Reseñas',           value: business ? formatNumber(business.reviewCount) : '—',   color: 'text-primary',   bg: 'bg-primary/5' },
    { icon: Star,          label: 'Calificación',      value: business && business.reviewCount > 0 ? business.rating.toFixed(1) : '—', color: 'text-gold-500', bg: 'bg-gold-50 dark:bg-yellow-950' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><BarChart3 size={22} /> Estadísticas</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Datos reales y acumulados de tu negocio</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="p-4 bg-card border border-border rounded-2xl">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <div className="text-2xl font-bold font-display">{bizLoading ? '…' : value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="p-5 bg-card border border-border rounded-2xl">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-muted-foreground" /> Publicaciones más vistas
        </h2>
        {postsLoading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : !topPosts.length ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Aún no tienes publicaciones. <Link href="/dashboard/posts/new" className="text-primary font-medium hover:underline">Crea la primera</Link> para empezar a medir visitas.
          </p>
        ) : (
          <div className="space-y-2">
            {topPosts.map((post, i) => (
              <Link key={post.id} href={`/post/${post.id}`}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/60 transition-colors">
                <span className="w-6 text-center text-sm font-bold text-muted-foreground tabular-nums">{i + 1}</span>
                {post.images[0] ? (
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    <Image src={post.images[0]} alt="" fill sizes="40px" className="object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FileText size={15} className="text-muted-foreground" />
                  </div>
                )}
                <span className="flex-1 min-w-0 text-sm font-medium truncate">{post.title}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums shrink-0">
                  <Eye size={12} /> {formatNumber(post.viewCount)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Las visitas se cuentan cuando alguien abre tu perfil o una publicación. Próximamente: evolución diaria y contactos por WhatsApp.
      </p>
    </div>
  )
}
