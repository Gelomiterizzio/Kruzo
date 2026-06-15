'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Compass, TrendingUp, Heart, Plus, CornerDownLeft, ArrowUp, ArrowDown, type LucideIcon,
} from 'lucide-react'
import { BUSINESS_CATEGORIES } from '@/lib/utils/constants'
import { cn } from '@/lib/utils/cn'

interface Props {
  open: boolean
  onClose: () => void
}

interface Item {
  id: string
  label: string
  hint?: string
  emoji?: string
  icon?: LucideIcon
  run: () => void
}

const QUICK: { label: string; hint: string; icon: LucideIcon; href: string }[] = [
  { label: 'Explorar negocios', hint: 'Página', icon: Compass, href: '/explore' },
  { label: 'Tendencias', hint: 'Página', icon: TrendingUp, href: '/trending' },
  { label: 'Favoritos', hint: 'Página', icon: Heart, href: '/favorites' },
  { label: 'Publicar negocio', hint: 'Acción', icon: Plus, href: '/dashboard/business' },
]

export function CommandPalette({ open, onClose }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const go = (href: string) => { onClose(); router.push(href) }

  // Build a single flat list so arrow-key navigation is trivial.
  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase()
    const list: Item[] = []

    if (q) {
      list.push({
        id: 'search',
        label: `Buscar “${query.trim()}”`,
        hint: 'Búsqueda',
        icon: Search,
        run: () => go(`/search?q=${encodeURIComponent(query.trim())}`),
      })
    }

    QUICK.filter((a) => !q || a.label.toLowerCase().includes(q)).forEach((a) =>
      list.push({ id: `q-${a.href}`, label: a.label, hint: a.hint, icon: a.icon, run: () => go(a.href) }),
    )

    BUSINESS_CATEGORIES.filter((c) => !q || c.label.toLowerCase().includes(q)).forEach((c) =>
      list.push({ id: `c-${c.key}`, label: c.label, hint: 'Categoría', emoji: c.emoji, run: () => go(`/search?cat=${c.key}`) }),
    )

    return list
  }, [query]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset state whenever the palette opens; focus the field.
  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      const t = setTimeout(() => inputRef.current?.focus(), 40)
      return () => clearTimeout(t)
    }
  }, [open])

  // Keep the active index in range as the list shrinks.
  useEffect(() => { setActive((i) => Math.min(i, Math.max(0, items.length - 1))) }, [items.length])

  // Lock background scroll while open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % Math.max(1, items.length)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i - 1 + items.length) % Math.max(1, items.length)) }
    else if (e.key === 'Enter') { e.preventDefault(); items[active]?.run() }
    else if (e.key === 'Escape') { e.preventDefault(); onClose() }
  }

  // Scroll the active row into view.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
          onMouseDown={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Búsqueda rápida"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
            className="relative w-full max-w-xl bg-popover border border-border/70 rounded-2xl shadow-warm-lg overflow-hidden"
          >
            {/* Search field */}
            <div className="flex items-center gap-3 px-4 border-b border-border/60">
              <Search size={18} className="text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar negocios, categorías, páginas…"
                aria-label="Buscar"
                className="flex-1 h-14 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
              />
              <kbd className="hidden sm:inline-flex text-[10px] font-medium text-muted-foreground border border-border rounded-md px-1.5 py-0.5">esc</kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-2">
              {items.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">Sin resultados para “{query}”.</p>
              ) : (
                items.map((it, i) => {
                  const Icon = it.icon
                  return (
                    <button
                      key={it.id}
                      data-idx={i}
                      onMouseMove={() => setActive(i)}
                      onClick={() => it.run()}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                        i === active ? 'bg-accent' : 'hover:bg-accent/60',
                      )}
                    >
                      <span className="w-7 h-7 shrink-0 grid place-items-center rounded-lg bg-muted text-base">
                        {it.emoji ? it.emoji : Icon ? <Icon size={15} className="text-muted-foreground" /> : null}
                      </span>
                      <span className="flex-1 text-sm font-medium truncate">{it.label}</span>
                      {it.hint && <span className="text-[11px] text-muted-foreground shrink-0">{it.hint}</span>}
                      {i === active && <CornerDownLeft size={13} className="text-muted-foreground shrink-0" />}
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer hints */}
            <div className="hidden sm:flex items-center gap-4 px-4 py-2.5 border-t border-border/60 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><ArrowUp size={11} /><ArrowDown size={11} /> navegar</span>
              <span className="flex items-center gap-1"><CornerDownLeft size={11} /> seleccionar</span>
              <span className="ml-auto font-medium text-gradient">KRUZO</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
