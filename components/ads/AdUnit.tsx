'use client'
// ─────────────────────────────────────────────────────────────────────────────
// AdUnit — the single low-level building block every ad banner is built on.
//
// Design goals (in priority order: UX > performance > revenue):
//   • Zero CLS .... the caller reserves a fixed box via `className` (h-[…]); the
//                   <ins> only ever fills that box, so nothing shifts on load.
//   • No blocking . the unit lazy-mounts via IntersectionObserver (300px before
//                   it enters the viewport), so off-screen ads never compete with
//                   LCP/INP. The loader script itself is `afterInteractive`.
//   • Safe no-op .. with no publisher id / slot it renders nothing in production
//                   (and a labelled dashed placeholder in dev for layout work).
//   • Push once ... guarded against React Strict-Mode double-invoke and re-pushes.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react'
import { ADSENSE_CLIENT, ADS_ENABLED, getSlot, type AdPlacement } from '@/lib/ads/config'
import { cn } from '@/lib/utils/cn'

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[]
  }
}

export interface AdUnitProps {
  placement: AdPlacement
  /** Tailwind classes that reserve the ad box (height per breakpoint). */
  className?: string
  /** 'auto' = responsive display unit, 'fluid' = native (in-article/in-feed). */
  format?: 'auto' | 'fluid'
  /** AdSense layout hint for fluid units (e.g. "in-article"). */
  layout?: string
  /** Show the small "Publicidad" disclosure label above the unit. */
  label?: boolean
}

export function AdUnit({
  placement,
  className,
  format = 'auto',
  layout,
  label = true,
}: AdUnitProps) {
  const slot = getSlot(placement)
  const ready = ADS_ENABLED && slot.length > 0

  const containerRef = useRef<HTMLDivElement>(null)
  const pushed = useRef(false)
  const [active, setActive] = useState(false)

  // Lazy: activate only when the reserved box approaches the viewport.
  useEffect(() => {
    if (!ready) return
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActive(true)
          io.disconnect()
        }
      },
      { rootMargin: '300px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ready])

  // Request the ad exactly once, after the <ins> is in the DOM.
  useEffect(() => {
    if (!active || pushed.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {
      /* adsbygoogle.js not parsed yet — a later mount will retry */
    }
  }, [active])

  // ── Not configured ─────────────────────────────────────────────────────────
  if (!ready) {
    if (process.env.NODE_ENV === 'production') return null
    // Dev-only placeholder so designers can see/position ad zones.
    return (
      <div
        aria-hidden
        className={cn(
          'flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70',
          className,
        )}
      >
        Ad · {placement}
      </div>
    )
  }

  // ── Live ─────────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className={cn('flex w-full flex-col', className)}>
      {label && (
        <span className="mb-1 block text-center text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/50">
          Publicidad
        </span>
      )}
      <div className="min-h-0 flex-1">
        {active && (
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '100%' }}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={slot}
            data-ad-format={format}
            data-ad-layout={layout}
            data-full-width-responsive={format === 'auto' ? 'true' : undefined}
          />
        )}
      </div>
    </div>
  )
}
