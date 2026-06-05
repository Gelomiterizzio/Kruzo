import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Props { size?: number; className?: string; label?: string }

export function LoadingSpinner({ size = 24, className, label }: Props) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12', className)}>
      <Loader2 size={size} className="animate-spin text-muted-foreground" />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3 text-white font-display font-black text-xl animate-pulse">K</div>
        <Loader2 size={20} className="animate-spin text-muted-foreground mx-auto" />
      </div>
    </div>
  )
}
