import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { getSessionUser } from '@/lib/firebase/admin'

export const metadata: Metadata = {
  title: 'Administración',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side authorization: only authenticated admins may render /admin.
  // Defense-in-depth on top of the middleware (which only checks auth presence).
  const session = await getSessionUser()
  if (!session) redirect('/login?redirect=/admin')
  if (session.role !== 'admin') redirect('/')

  return (
    <>
      <Navbar />
      <div className="container pt-20 pb-16">
        <div className="flex gap-8">
          <Sidebar type="admin" />
          <main id="main-content" className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </>
  )
}
