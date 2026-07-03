import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { FeaturedSection } from '@/components/home/FeaturedSection'
import { AdBannerInline } from '@/components/ads/AdBannerInline'
import { AdBannerFooter } from '@/components/ads/AdBannerFooter'
import { getPublicStats } from '@/lib/firebase/admin'

export const metadata: Metadata = {
  title: { absolute: 'KRUZO — Tu Ciudad. Tu Mercado.' },
  description: 'Descubre negocios, emprendimientos y servicios de Santa Cruz de la Sierra, Bolivia. Conecta directamente por WhatsApp.',
  alternates: { canonical: '/' },
}

// Refresh the real platform counts hourly without a redeploy.
export const revalidate = 3600

export default async function HomePage() {
  const stats = await getPublicStats()

  return (
    <div className="space-y-2">
      <HeroSection stats={stats} />
      <CategoryGrid />
      <FeaturedSection
        title="Negocios destacados"
        subtitle="Los mejores negocios seleccionados para ti"
        featured={true}
        viewAllHref="/explore?filter=featured"
      />
      <FeaturedSection
        title="Comida & Repostería"
        category="comida"
        viewAllHref="/search?cat=comida"
      />

      <div className="container">
        <AdBannerInline />
      </div>

      <FeaturedSection
        title="Servicios técnicos"
        category="servicios"
        viewAllHref="/search?cat=servicios"
      />
      <FeaturedSection
        title="Tecnología"
        category="tecnologia"
        viewAllHref="/search?cat=tecnologia"
      />

      <div className="container pb-8">
        <AdBannerFooter />
      </div>
    </div>
  )
}
