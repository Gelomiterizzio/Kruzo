'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const POPULAR = ['Repostería', 'Electricistas', 'Fotografía', 'Comida delivery', 'Carpintería']

interface SearchBarProps { size?: 'sm' | 'lg'; className?: string; placeholder?: string }

export function SearchBar({ size = 'lg', className, placeholder = 'Buscar negocio, servicio, producto…' }: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (q: string) => {
    if (!q.trim()) return
    router.push(`/search?q=${encodeURIComponent(q.trim())}`)
    setFocused(false)
    inputRef.current?.blur()
  }

  return (
    <div
      className={cn('relative', className)}
      // Close the suggestions only when focus truly leaves the widget, so the
      // popular-search buttons stay reachable by keyboard (no blur-timeout hack).
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false) }}
    >
      <div className={cn(
        'flex items-center gap-2 bg-card border border-border rounded-2xl transition-all',
        size === 'lg' ? 'px-4 py-3' : 'px-3 py-2',
        focused && 'border-primary ring-2 ring-primary/20 shadow-lg'
      )}>
        <Search size={size === 'lg' ? 20 : 16} className="text-muted-foreground shrink-0" />
        <input ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
          placeholder={placeholder}
          aria-label="Buscar negocios, servicios o productos"
          className={cn('flex-1 bg-transparent outline-none placeholder:text-muted-foreground', size === 'lg' ? 'text-base' : 'text-sm')}
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Limpiar búsqueda">
            <X size={16} className="text-muted-foreground hover:text-foreground" />
          </button>
        )}
        {size === 'lg' && (
          <button onClick={() => handleSearch(query)}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shrink-0">
            Buscar
          </button>
        )}
      </div>

      <AnimatePresence>
        {focused && !query && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl p-3 z-50">
            <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><TrendingUp size={12} /> Búsquedas populares</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR.map(t => (
                <button key={t} onClick={() => handleSearch(t)}
                  className="px-3 py-1.5 bg-muted hover:bg-accent text-sm rounded-xl transition-colors">
                  {t}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
