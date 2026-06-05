import Link from 'next/link'
import { Search, Store, FileText } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  icon?: 'search' | 'store' | 'post'
  action?: { label: string; href: string }
}

const ICONS = { search: Search, store: Store, post: FileText }

export function EmptyState({ title, description, icon = 'search', action }: EmptyStateProps) {
  const Icon = ICONS[icon]
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-5">
        <Icon size={32} className="text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs mb-6">{description}</p>
      {action && (
        <Link href={action.href} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
          {action.label}
        </Link>
      )}
    </div>
  )
}
