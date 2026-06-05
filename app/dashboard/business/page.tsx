'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { getBusinessById } from '@/lib/firebase/firestore'
import { BusinessForm } from '@/components/business/BusinessForm'
import { BusinessProfileSkeleton } from '@/components/shared/SkeletonCard'
import type { Business } from '@/lib/types/business'
import { Store } from 'lucide-react'

export default function DashboardBusinessPage() {
  const { user } = useAuth()
  const [business, setBusiness] = useState<Business | null | undefined>(undefined)

  useEffect(() => {
    if (!user?.businessIds?.[0]) { setBusiness(null); return }
    getBusinessById(user.businessIds[0]).then(setBusiness)
  }, [user])

  if (business === undefined) return <BusinessProfileSkeleton />

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
      <BusinessForm existing={business ?? undefined} />
    </div>
  )
}
