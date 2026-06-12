import { PageTransition } from '@/components/shared/PageTransition'

export default function MainTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>
}
