import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { getBusinessBySlug } from '@/lib/firebase/firestore'
import { incrementBusinessView } from '@/lib/firebase/admin'
import { BusinessProfile } from '@/components/business/BusinessProfile'

// ── Next.js 16: params is now a Promise ──────────────────────────────────────
interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)
  if (!business) return { title: 'Negocio no encontrado' }
  return {
    title: business.name,
    description:
      business.description ||
      `${business.name} en Santa Cruz de la Sierra. Contacta directamente por WhatsApp.`,
    openGraph: {
      title: business.name,
      description: business.description,
      images: business.coverImage ? [business.coverImage] : [],
    },
  }
}

export default async function BusinessPage({ params }: Props) {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)
  if (!business || business.status !== 'active') notFound()

  // Count the view (fire and forget) — but not for link prefetches, which
  // would inflate the owner's real stats on every hover.
  const h = await headers()
  if (h.get('next-router-prefetch') === null) {
    incrementBusinessView(business.id).catch(() => {})
  }

  return (
    <div className="container pt-20 pb-16">
      <BusinessProfile business={business} />
    </div>
  )
}
