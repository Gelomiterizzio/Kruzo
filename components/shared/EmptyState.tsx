import Link from 'next/link'
import { Search, Store, FileText, Heart, Inbox, type LucideIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button-variants'

interface Action { label: string; href: string }

interface EmptyStateProps {
  title: string
  description: string
  icon?: 'search' | 'store' | 'post' | 'favorite' | 'inbox'
  action?: Action
  /** Optional lower-emphasis secondary action (e.g. "Volver al inicio"). */
  secondaryAction?: Action
}

const ICONS: Record<NonNullable<EmptyStateProps['icon']>, LucideIcon> = {
  search: Search,
  store: Store,
  post: FileText,
  favorite: Heart,
  inbox: Inbox,
}

export function EmptyState({ title, description, icon = 'search', action, secondaryAction }: EmptyStateProps) {
  const Icon = ICONS[icon]
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4 animate-fade-in">
      {/* Icon with soft brand halo */}
      <div className="relative mb-6">
        <div className="absolute inset-0 -z-10 rounded-3xl bg-primary/15 blur-2xl" aria-hidden />
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-card to-muted border border-border/70 flex items-center justify-center shadow-warm-sm">
          <Icon size={30} className="text-primary/80" strokeWidth={1.75} />
        </div>
      </div>

      <h3 className="text-xl font-display font-bold tracking-tight mb-1.5">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm leading-relaxed mb-7">{description}</p>

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          {action && (
            <Link href={action.href} className={buttonVariants({ variant: 'primary' })}>
              {action.label}
            </Link>
          )}
          {secondaryAction && (
            <Link href={secondaryAction.href} className={buttonVariants({ variant: 'ghost' })}>
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
