import { cn } from '@/lib/utils/cn'

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden bg-muted rounded-lg', className)}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.07] dark:via-white/[0.05] to-transparent" />
    </div>
  )
}

export function BusinessCardSkeleton() {
  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
      {/* Cover */}
      <Skeleton className="h-36 rounded-none" />
      <div className="p-3.5 space-y-3">
        {/* Logo + name */}
        <div className="flex items-start gap-2.5">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0 -mt-7 ring-2 ring-background" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-3.5 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-1/2 rounded-md" />
          </div>
        </div>
        {/* Rating */}
        <Skeleton className="h-3 w-28 rounded-md" />
        {/* CTA button */}
        <Skeleton className="h-8 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function PostCardSkeleton() {
  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
      <Skeleton className="h-48 rounded-none" />
      <div className="p-3.5 space-y-2.5">
        <Skeleton className="h-3.5 w-3/4 rounded-md" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
        <Skeleton className="h-5 w-1/3 rounded-full" />
        <Skeleton className="h-8 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function BusinessProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-56 w-full rounded-2xl" />
      <div className="flex gap-4">
        <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-1/2 rounded-md" />
          <Skeleton className="h-4 w-1/3 rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export function GridSkeleton({
  count = 8,
  variant = 'business',
}: {
  count?: number
  variant?: 'business' | 'post'
}) {
  const Card = variant === 'business' ? BusinessCardSkeleton : PostCardSkeleton
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} />
      ))}
    </div>
  )
}
