import type { Business } from '@/lib/types/business'

export type BadgeKey = 'verified' | 'top' | 'popular' | 'new'

export interface BusinessBadge {
  key: BadgeKey
  label: string
  /** lucide-react icon name resolved by the component. */
  icon: 'BadgeCheck' | 'Award' | 'Flame' | 'Sparkles'
  tone: 'blue' | 'amber' | 'primary' | 'green'
}

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

/** Firestore Timestamp | Date | number → epoch ms (0 when unknown). */
function toMillis(v: unknown): number {
  if (!v) return 0
  if (typeof v === 'number') return v
  const t = v as { toMillis?: () => number; seconds?: number }
  if (typeof t.toMillis === 'function') return t.toMillis()
  if (typeof t.seconds === 'number') return t.seconds * 1000
  return 0
}

/**
 * Smart reputation badges derived from real, trustworthy signals — never
 * fabricated. Returned in priority order; callers cap how many they show to
 * keep cards uncluttered.
 */
export function getBusinessBadges(b: Business): BusinessBadge[] {
  const badges: BusinessBadge[] = []

  if (b.isVerified) {
    badges.push({ key: 'verified', label: 'Verificado', icon: 'BadgeCheck', tone: 'blue' })
  }
  if (b.rating >= 4.5 && b.reviewCount >= 5) {
    badges.push({ key: 'top', label: 'Mejor valorado', icon: 'Award', tone: 'amber' })
  }
  if ((b.favoriteCount ?? 0) >= 15 || (b.viewCount ?? 0) >= 200) {
    badges.push({ key: 'popular', label: 'Popular', icon: 'Flame', tone: 'primary' })
  }
  const created = toMillis(b.createdAt)
  if (created && Date.now() - created < THIRTY_DAYS) {
    badges.push({ key: 'new', label: 'Nuevo', icon: 'Sparkles', tone: 'green' })
  }

  return badges
}
