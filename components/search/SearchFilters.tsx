'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { SCZ_ZONES } from '@/lib/utils/constants'

const SORTS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'rating', label: 'Mejor calificados' },
  { value: 'popular', label: 'Más populares' },
  { value: 'featured', label: 'Destacados' },
]
const TYPES = [
  { value: 'businesses', label: 'Negocios' },
  { value: 'posts', label: 'Productos' },
]

// Hoisted: defining these inside the component would give them a new identity
// on every render and remount their subtrees.
const FilterGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{title}</p>
    <div className="space-y-0.5">{children}</div>
  </div>
)

const FilterBtn = ({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void }) => (
  <button onClick={onClick}
    className={cn('w-full text-left px-3 py-2 text-sm rounded-xl transition-colors',
      selected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent text-muted-foreground')}>
    {label}
  </button>
)

export function SearchFilters() {
  const router = useRouter()
  const params = useSearchParams()

  const update = (key: string, value: string) => {
    const p = new URLSearchParams(params.toString())
    value ? p.set(key, value) : p.delete(key)
    router.push(`/search?${p.toString()}`)
  }

  const isSelected = (key: string, value: string) => params.get(key) === value
  const toggle = (key: string, value: string) => update(key, isSelected(key, value) ? '' : value)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={15} className="text-muted-foreground" />
        <span className="text-sm font-semibold">Filtros</span>
      </div>

      <FilterGroup title="Ordenar por">
        {SORTS.map(s => (
          <FilterBtn key={s.value} selected={isSelected('sort', s.value)} label={s.label} onClick={() => toggle('sort', s.value)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Tipo">
        {TYPES.map(t => (
          <FilterBtn key={t.value} selected={isSelected('type', t.value)} label={t.label} onClick={() => toggle('type', t.value)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Zona">
        {SCZ_ZONES.map(z => (
          <FilterBtn key={z} selected={isSelected('zone', z)} label={z} onClick={() => toggle('zone', z)} />
        ))}
      </FilterGroup>

      {(params.toString()) && (
        <button onClick={() => router.push('/search')}
          className="w-full py-2 text-xs text-muted-foreground hover:text-destructive border border-border rounded-xl transition-colors">
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
