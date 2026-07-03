import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { BusinessSchedule } from '@/lib/types/business'

// Structural Timestamp: matches both the Web SDK and the Admin SDK Timestamp,
// so server components using firebase-admin can share these formatters.
export interface TimestampLike { toDate: () => Date }

export function formatPrice(price: number): string {
  if (price === 0) return 'Gratis'
  return `Bs. ${price.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function formatRelativeTime(timestamp: TimestampLike | null | undefined): string {
  if (!timestamp) return ''
  const date = timestamp.toDate?.() ?? new Date(timestamp as unknown as number)
  return formatDistanceToNow(date, { addSuffix: true, locale: es })
}

export function formatDate(timestamp: TimestampLike | null | undefined, fmt = 'dd MMM yyyy'): string {
  if (!timestamp) return ''
  const date = timestamp.toDate?.() ?? new Date(timestamp as unknown as number)
  return format(date, fmt, { locale: es })
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

/** Lowercases and strips accents — for tolerant text matching in search. */
export function normalizeText(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Slug with a short random suffix for uniqueness (e.g. business slugs). */
export function uniqueSlug(text: string): string {
  return slugify(text) + '-' + Math.random().toString(36).slice(2, 6)
}

/**
 * HTML-escapes a value before it is interpolated into a raw HTML string.
 * Used for Leaflet popups/markers, which are built as HTML strings (not React),
 * so user-provided text must be escaped to prevent stored XSS.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen).trim() + '…'
}

export function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
}

export function isOpenNow(hours: BusinessSchedule): boolean {
  const now = new Date()
  const day = (['sun','mon','tue','wed','thu','fri','sat'] as const)[now.getDay()]
  const h = hours?.[day]
  if (!h?.open || !h?.close) return false
  const cur = now.getHours() * 60 + now.getMinutes()
  const [oh, om] = h.open.split(':').map(Number)
  const [ch, cm] = h.close.split(':').map(Number)
  const opens = oh * 60 + om
  const closes = ch * 60 + cm
  // Overnight schedules (e.g. 18:00–02:00) wrap past midnight.
  if (closes < opens) return cur >= opens || cur <= closes
  return cur >= opens && cur <= closes
}
