'use client'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/hooks/useAuth'
import { getBusinessById } from '@/lib/firebase/firestore'
import { PostForm } from '@/components/post/PostForm'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function NewPostPage() {
  const { user, loading: authLoading } = useAuth()
  const businessId = user?.businessIds?.[0]

  const { data: business, isLoading } = useQuery({
    queryKey: ['business', businessId],
    queryFn: () => getBusinessById(businessId!),
    enabled: !!businessId,
  })

  if (authLoading || (businessId && isLoading)) {
    return <div className="h-96 bg-muted rounded-2xl animate-pulse" />
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/dashboard/posts" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft size={14} /> Mis publicaciones
        </Link>
        <h1 className="text-2xl font-display font-bold">Nueva publicación</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Agrega un producto o servicio a tu negocio</p>
      </div>

      {!business ? (
        <div className="p-5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm text-amber-800 dark:text-amber-300">Primero crea tu negocio</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Necesitas registrar tu negocio antes de crear publicaciones</p>
            <Link href="/dashboard/business" className="text-xs font-medium text-amber-800 dark:text-amber-300 underline mt-1 block">
              Crear negocio →
            </Link>
          </div>
        </div>
      ) : (
        <PostForm business={business} />
      )}
    </div>
  )
}
