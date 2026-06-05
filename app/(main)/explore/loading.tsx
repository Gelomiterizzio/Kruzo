import { GridSkeleton } from '@/components/shared/SkeletonCard'
export default function Loading() {
  return <div className="container pt-24 pb-16"><GridSkeleton count={8} /></div>
}
