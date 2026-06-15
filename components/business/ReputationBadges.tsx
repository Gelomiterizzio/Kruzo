import { BadgeCheck, Award, Flame, Sparkles, type LucideIcon } from 'lucide-react'
import { getBusinessBadges, type BadgeKey, type BusinessBadge } from '@/lib/utils/badges'
import type { Business } from '@/lib/types/business'
import { cn } from '@/lib/utils/cn'

const ICONS: Record<BusinessBadge['icon'], LucideIcon> = { BadgeCheck, Award, Flame, Sparkles }

const TONES: Record<BusinessBadge['tone'], string> = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  primary: 'bg-primary/10 text-primary',
  green: 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400',
}

interface Props {
  business: Business
  /** Max badges to render (priority order). Default 3. */
  max?: number
  /** Hide these badge keys (e.g. 'verified' when a checkmark already shows). */
  exclude?: BadgeKey[]
  size?: 'xs' | 'sm'
  className?: string
}

export function ReputationBadges({ business, max = 3, exclude, size = 'sm', className }: Props) {
  let badges = getBusinessBadges(business)
  if (exclude?.length) badges = badges.filter((b) => !exclude.includes(b.key))
  badges = badges.slice(0, max)
  if (badges.length === 0) return null

  const pad = size === 'xs' ? 'px-1.5 py-0.5 text-[10px] gap-0.5' : 'px-2 py-0.5 text-xs gap-1'
  const icon = size === 'xs' ? 11 : 12

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {badges.map((b) => {
        const Icon = ICONS[b.icon]
        return (
          <span
            key={b.key}
            className={cn('inline-flex items-center rounded-full font-semibold leading-none', pad, TONES[b.tone])}
          >
            <Icon size={icon} />
            {b.label}
          </span>
        )
      })}
    </div>
  )
}
