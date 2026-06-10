'use client'
import { useAuth } from '@/lib/hooks/useAuth'
import { ProfileForm, NotificationSettings } from '@/components/settings/ProfileSettings'
import { Settings } from 'lucide-react'

export default function DashboardSettingsPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Settings size={22} /> Configuración</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Administra tu cuenta y preferencias</p>
      </div>

      {!user ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        // key: re-seed the forms if the signed-in user changes
        <div key={user.id} className="space-y-6">
          <ProfileForm user={user} />
          <NotificationSettings user={user} />
        </div>
      )}
    </div>
  )
}
