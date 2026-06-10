'use client'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/hooks/useAuth'
import { getBusinessById } from '@/lib/firebase/firestore'
import { BusinessForm } from '@/components/business/BusinessForm'
import { BusinessProfileSkeleton } from '@/components/shared/SkeletonCard'
import { Store, Clock } from 'lucide-react'

export default function DashboardBusinessPage() {
  const { user, loading: authLoading } = useAuth()
  const businessId = user?.businessIds?.[0]

  const { data: business, isLoading } = useQuery({
    queryKey: ['business', businessId],
    queryFn: () => getBusinessById(businessId!),
    enabled: !!businessId,
  })

  if (authLoading || (businessId && isLoading)) return <BusinessProfileSkeleton />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Store size={22} /> {business ? 'Mi negocio' : 'Crear negocio'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {business ? 'Edita la información de tu negocio' : 'Registra tu negocio en KRUZO'}
        </p>
      </div>

      {business?.status === 'pending' && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl">
          <Clock size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Tu negocio está <strong>pendiente de aprobación</strong>. Te avisaremos cuando esté visible en KRUZO.
          </p>
        </div>
      )}

      <BusinessForm existing={business ?? undefined} />
    </div>
  )
}
