import type { Metadata } from 'next'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchFilters } from '@/components/search/SearchFilters'
import { SearchResults } from '@/components/search/SearchResults'
import { AdBannerSidebar } from '@/components/ads/AdBannerSidebar'
import { getCategoryInfo } from '@/components/shared/CategoryBadge'
import type { SearchSort } from '@/lib/firebase/firestore'

export const metadata: Metadata = {
  title: 'Buscar',
  description: 'Busca negocios, servicios y productos en Santa Cruz de la Sierra.',
}

// ── Next.js 16: searchParams is now a Promise ─────────────────────────────────
interface Props {
  searchParams: Promise<{
    q?: string
    cat?: string
    zone?: string
    sort?: string
    type?: string
  }>
}

const VALID_SORTS: SearchSort[] = ['recent', 'rating', 'popular', 'featured']

export default async function SearchPage({ searchParams }: Props) {
  const { q, cat, zone, sort, type } = await searchParams
  const hasQuery = !!(q || cat || zone)
  const safeSort = VALID_SORTS.includes(sort as SearchSort) ? (sort as SearchSort) : undefined

  return (
    <div className="container pt-24 pb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold mb-4">
          {q ? `Resultados para "${q}"` : cat ? `Categoría: ${getCategoryInfo(cat).label}` : 'Buscar en KRUZO'}
        </h1>
        <SearchBar placeholder="Refinar búsqueda…" size="sm" />
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <aside className="hidden md:block w-52 shrink-0">
          <div className="sticky top-24 space-y-4">
            <div className="p-4 bg-card border border-border rounded-2xl">
              <SearchFilters />
            </div>
            {hasQuery && <AdBannerSidebar sticky={false} />}
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {!hasQuery ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium">Escribe algo para buscar</p>
              <p className="text-sm mt-1">Negocios, servicios, productos…</p>
            </div>
          ) : (
            <SearchResults q={q} category={cat} zone={zone} sort={safeSort} type={type} />
          )}
        </div>
      </div>
    </div>
  )
}
