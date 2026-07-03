import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { ChevronRight } from 'lucide-react'
import { getBusinessBySlug } from '@/lib/firebase/firestore'
import { incrementBusinessView } from '@/lib/firebase/admin'
import { BusinessProfile } from '@/components/business/BusinessProfile'
import { JsonLd } from '@/components/seo/JsonLd'
import { localBusinessSchema, breadcrumbSchema } from '@/lib/seo/schema'
import { getCategoryInfo } from '@/components/shared/CategoryBadge'

// ── Next.js 16: params is now a Promise ──────────────────────────────────────
interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const business = await getBusinessBySlug(slug)
  if (!business || business.status !== 'active') return { title: 'Negocio no encontrado' }
  const description =
    business.description ||
    `${business.name} en Santa Cruz de la Sierra. Contacta directamente por WhatsApp.`
  return {
    title: business.name,
    description,
    alternates: { canonical: `/business/${slug}` },
    openGraph: {
      title: business.name,
      description,
      url: `/business/${slug}`,
      type: 'website',
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

  const mainCategory = business.category?.[0]
  const categoryInfo = mainCategory ? getCategoryInfo(mainCategory) : null

  return (
    <div className="container pt-20 pb-16">
      <JsonLd data={localBusinessSchema(business)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', path: '/' },
          { name: 'Explorar', path: '/explore' },
          ...(categoryInfo ? [{ name: categoryInfo.label, path: `/search?cat=${mainCategory}` }] : []),
          { name: business.name },
        ])}
      />

      {/* Visible breadcrumb: orientation + internal linking for crawlers */}
      <nav aria-label="Ruta de navegación" className="max-w-3xl mx-auto mb-3 px-1">
        <ol className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
          <li><Link href="/" className="hover:text-foreground transition-colors">Inicio</Link></li>
          <li aria-hidden="true"><ChevronRight size={12} /></li>
          <li><Link href="/explore" className="hover:text-foreground transition-colors">Explorar</Link></li>
          {categoryInfo && (
            <>
              <li aria-hidden="true"><ChevronRight size={12} /></li>
              <li>
                <Link href={`/search?cat=${mainCategory}`} className="hover:text-foreground transition-colors">
                  {categoryInfo.label}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true"><ChevronRight size={12} /></li>
          <li aria-current="page" className="text-foreground font-medium truncate max-w-[180px] sm:max-w-xs">
            {business.name}
          </li>
        </ol>
      </nav>

      <BusinessProfile business={business} />
    </div>
  )
}
