'use client'
import { motion } from 'framer-motion'
import { MapPin, LayoutGrid, Users, Store } from 'lucide-react'
import { SearchBar } from '@/components/search/SearchBar'
import { BUSINESS_CATEGORIES, SCZ_ZONES } from '@/lib/utils/constants'
import { formatNumber } from '@/lib/utils/formatters'
import type { PublicStats } from '@/lib/firebase/admin'

interface HeroProps {
  /** Real platform counts (null when unavailable — those stats are hidden). */
  stats: PublicStats | null
}

export function HeroSection({ stats }: HeroProps) {
  // Only real numbers: live counts when available + truly static facts.
  const STATS = [
    ...(stats && stats.activeBusinesses > 0
      ? [{ icon: Store, value: formatNumber(stats.activeBusinesses), label: stats.activeBusinesses === 1 ? 'Negocio' : 'Negocios' }]
      : []),
    ...(stats && stats.users > 0
      ? [{ icon: Users, value: formatNumber(stats.users), label: stats.users === 1 ? 'Usuario' : 'Usuarios' }]
      : []),
    { icon: LayoutGrid, value: String(BUSINESS_CATEGORIES.length), label: 'Categorías' },
    { icon: MapPin, value: String(SCZ_ZONES.length), label: 'Zonas de SCZ' },
  ]
  return (
    <section className="relative overflow-hidden pt-24 pb-20 md:pt-36 md:pb-28">

      {/* ── Animated background ── */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {/* Dot grid */}
        <div className="absolute inset-0 hero-dot-grid opacity-40" />

        {/* Animated blobs */}
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.18, 0.32, 0.18] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -left-24 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[90px]"
        />
        <motion.div
          animate={{ scale: [1, 1.22, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full bg-amber-400/15 blur-[110px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.16, 0.08] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-orange-300/15 blur-[70px]"
        />
      </div>

      <div className="container">
        <div className="text-center max-w-3xl mx-auto">

          {/* ── Badge ── */}
          <div
            className="animate-rise inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-semibold text-primary mb-7"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <MapPin size={13} />
            Santa Cruz de la Sierra, Bolivia
          </div>

          {/* ── Headline (LCP element: minimal delay, CSS-driven) ── */}
          <h1 className="animate-rise text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black leading-[0.88] tracking-tight" style={{ animationDelay: '60ms' }}>
            Tu Ciudad.<br />
            <span className="text-gradient">Tu Mercado.</span>
          </h1>

          {/* ── Subtitle ── */}
          <p
            className="animate-rise mt-6 text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed text-pretty"
            style={{ animationDelay: '140ms' }}
          >
            Descubre negocios, emprendimientos y servicios locales.
            Conecta directamente por{' '}
            <span className="text-green-600 dark:text-green-400 font-semibold">WhatsApp</span>.
          </p>

          {/* ── Search ── */}
          <div className="animate-rise mt-9 max-w-2xl mx-auto" style={{ animationDelay: '220ms' }}>
            <SearchBar size="lg" />
          </div>

          {/* ── Stats ── */}
          <div className="mt-12 pt-9 border-t border-border/40 flex justify-center gap-8 md:gap-14">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="animate-rise text-center group cursor-default"
                style={{ animationDelay: `${300 + i * 70}ms` }}
              >
                <s.icon
                  size={15}
                  className="mx-auto mb-2 text-primary/50 group-hover:text-primary transition-colors duration-300"
                />
                <div className="text-2xl md:text-3xl font-display font-black text-gradient">
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-0.5 tracking-wide uppercase">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
