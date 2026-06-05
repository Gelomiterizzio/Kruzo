import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'

export const metadata: Metadata = { title: 'Administración | KRUZO' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="container pt-20 pb-16">
        <div className="flex gap-8">
          <Sidebar type="admin" />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </>
  )
}
