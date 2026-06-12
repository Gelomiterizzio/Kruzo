'use client'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Star, Store, Info } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/hooks/useAuth'
import { getNotifications, markAllNotificationsRead } from '@/lib/firebase/firestore'
import { formatRelativeTime } from '@/lib/utils/formatters'
import { toast } from 'sonner'
import type { NotificationType } from '@/lib/types/notification'

const TYPE_ICON: Record<NotificationType, typeof Star> = {
  review: Star,
  business_approved: Store,
  system: Info,
}

export default function NotificationsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    enabled: !!user,
    queryFn: () => getNotifications(user!.id),
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = async () => {
    if (!user || !unreadCount) return
    try {
      await markAllNotificationsRead(user.id, notifications)
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
    } catch { toast.error('No se pudieron marcar como leídas') }
  }

  return (
    <>
      <Navbar />
      <div className="container max-w-xl pt-20 pb-16 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Bell size={22} /> Notificaciones</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <CheckCheck size={16} /> Marcar todas leídas
            </button>
          )}
        </div>

        {!isAuthenticated && !authLoading ? (
          <div className="text-center py-16">
            <Bell size={40} className="mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium mb-2">Inicia sesión para ver tus notificaciones</p>
            <Link href="/login?redirect=/notifications" className="text-sm text-primary font-semibold hover:underline">Iniciar sesión</Link>
          </div>
        ) : isLoading || authLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />)}
          </div>
        ) : !notifications.length ? (
          <div className="text-center py-16">
            <Bell size={40} className="mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium">No tienes notificaciones</p>
            <p className="text-sm text-muted-foreground mt-1">Te avisaremos cuando haya novedades sobre tu cuenta o negocio.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n, i) => {
              const Icon = TYPE_ICON[n.type] ?? Info
              const inner = (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.05 }}
                  className={`p-4 rounded-2xl border transition-colors ${!n.read ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'} ${n.businessId ? 'hover:border-primary/40' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Icon size={17} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{n.title}</p>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(n.createdAt)}</p>
                    </div>
                  </div>
                </motion.div>
              )
              return n.type === 'review' && user?.businessIds?.length
                ? <Link key={n.id} href="/dashboard/reviews">{inner}</Link>
                : <div key={n.id}>{inner}</div>
            })}
          </div>
        )}
      </div>
    </>
  )
}
