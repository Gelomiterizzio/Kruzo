'use client'
import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getCountFromServer } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { LayoutGrid, Info } from 'lucide-react'
import Link from 'next/link'
import { BUSINESS_CATEGORIES } from '@/lib/utils/constants'

// Read-only view over the canonical category catalogue with REAL business
// counts. Categories live in code (lib/utils/constants.ts) so every surface
// (forms, badges, search, grid) stays consistent — this page makes that
// explicit instead of pretending to be an editor.
export default function AdminCategoriesPage() {
  const { data: counts, isLoading } = useQuery({
    queryKey: ['admin-category-counts'],
    queryFn: async () => {
      const snaps = await Promise.all(
        BUSINESS_CATEGORIES.map(c =>
          getCountFromServer(query(collection(db, 'businesses'), where('category', 'array-contains', c.key))),
        ),
      )
      return Object.fromEntries(BUSINESS_CATEGORIES.map((c, i) => [c.key, snaps[i].data().count]))
    },
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><LayoutGrid size={22} /> Categorías</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{BUSINESS_CATEGORIES.length} categorías activas con su número real de negocios</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BUSINESS_CATEGORIES.map(cat => (
          <Link key={cat.key} href={`/search?cat=${cat.key}`}
            className="p-4 bg-card border border-border rounded-2xl flex items-center gap-3 hover:border-primary/30 hover:shadow-sm transition-all">
            <span className="text-2xl">{cat.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{cat.label}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {isLoading ? '…' : `${counts?.[cat.key] ?? 0} negocios`}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-start gap-2.5 p-4 bg-muted/50 border border-border rounded-2xl">
        <Info size={15} className="text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          El catálogo de categorías se define en el código (<code className="text-foreground">lib/utils/constants.ts</code>)
          para que formularios, búsqueda y badges usen siempre la misma fuente. Agregar o editar una categoría es un cambio de código.
        </p>
      </div>
    </div>
  )
}
