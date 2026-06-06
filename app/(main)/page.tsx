import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { FeaturedSection } from '@/components/home/FeaturedSection'
import { AdBannerInline } from '@/components/ads/AdBannerInline'
import { AdBannerFooter } from '@/components/ads/AdBannerFooter'

export const metadata: Metadata = {
  title: 'KRUZO — Tu Ciudad. Tu Mercado.',
  description: 'Descubre negocios, emprendimientos y servicios de Santa Cruz de la Sierra, Bolivia. Conecta directamente por WhatsApp.',
}

export default function HomePage() {
  return (
    <div className="space-y-2">
      <HeroSection />
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
