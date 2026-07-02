import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { getSessionUser } from '@/lib/firebase/admin'

export const metadata: Metadata = { title: 'Panel de control' }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Server-side authentication: a verified session is required to render the
  // dashboard. Defense-in-depth on top of the middleware (which only checks
  // cookie presence, not validity) — a stale/expired cookie no longer grants
  // access. Any authenticated user may enter (no role gate); business-specific
  // pages handle the "create your business first" state themselves.
  const session = await getSessionUser()
  if (!session) redirect('/login?redirect=/dashboard')

  return (
    <>
      <Navbar />
      <div className="container pt-20 pb-16">
        <div className="flex gap-8">
          <Sidebar type="dashboard" />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </>
  )
}
