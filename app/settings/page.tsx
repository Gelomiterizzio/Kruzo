'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/lib/hooks/useAuth'
import { ProfileForm, NotificationSettings } from '@/components/settings/ProfileSettings'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Settings, User, Bell, Shield, LogOut, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const TABS = [
  { id: 'profile',  label: 'Perfil',          icon: User },
  { id: 'notifs',   label: 'Notificaciones',   icon: Bell },
  { id: 'security', label: 'Seguridad',        icon: Shield },
]

export default function SettingsPage() {
  const { user, loading, signOut, refreshUser } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState('profile')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleLogout = async () => {
    await signOut(); router.push('/')
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/account', { method: 'DELETE' })
      if (!res.ok) throw new Error()
      await signOut()
      toast.success('Tu cuenta fue eliminada')
      router.push('/')
    } catch {
      toast.error('No se pudo eliminar la cuenta. Intenta de nuevo.')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="container max-w-2xl pt-20 pb-16 space-y-6">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Settings size={22} /> Configuración</h1>

        <div className="flex gap-1 border-b border-border">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${tab === t.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <t.icon size={15} /> {t.label}
              {tab === t.id && (
                <motion.span layoutId="settings-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-primary"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-64 bg-muted rounded-2xl animate-pulse" />
        ) : !user ? (
          <div className="text-center py-16 px-4">
            <p className="font-semibold mb-1">No pudimos cargar tu perfil</p>
            <p className="text-sm text-muted-foreground mb-5">Revisa tu conexión e inténtalo de nuevo.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => refreshUser()} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">Reintentar</button>
              <button onClick={handleLogout} className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-accent transition-colors">Cerrar sesión</button>
            </div>
          </div>
        ) : (
          <div key={user.id}>
            {tab === 'profile' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl">
                  {user.photoURL
                    ? <Image src={user.photoURL} alt="" width={64} height={64} className="w-16 h-16 rounded-2xl object-cover" />
                    : <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">{user.displayName?.[0] ?? 'U'}</div>
                  }
                  <div>
                    <p className="font-semibold">{user.displayName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-primary mt-0.5 capitalize">{user.role}</p>
                  </div>
                </div>
                <ProfileForm user={user} />
              </div>
            )}

            {tab === 'notifs' && <NotificationSettings user={user} />}

            {tab === 'security' && (
              <div className="space-y-4">
                <div className="p-5 bg-card border border-border rounded-2xl space-y-3">
                  <h2 className="font-semibold">Sesión</h2>
                  <p className="text-sm text-muted-foreground">Sesión activa como <strong>{user.email}</strong></p>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 border border-destructive text-destructive rounded-xl text-sm font-medium hover:bg-destructive/10 transition-colors">
                    <LogOut size={16} /> Cerrar sesión
                  </button>
                </div>
                <div className="p-5 bg-card border border-border rounded-2xl">
                  <h2 className="font-semibold mb-2">Eliminar cuenta</h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    Se eliminan de forma permanente tu perfil, tus negocios con sus publicaciones y las reseñas que escribiste.
                  </p>
                  <button onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-destructive text-white rounded-xl text-sm font-medium hover:bg-destructive/90 transition-colors">
                    <Trash2 size={15} /> Eliminar mi cuenta
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />

      <ConfirmDialog
        open={confirmDelete}
        title="¿Eliminar tu cuenta?"
        description="Esta acción es permanente e irreversible. Se eliminan tu perfil, tus negocios, tus publicaciones y tus reseñas de KRUZO."
        confirmLabel="Eliminar definitivamente"
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  )
}
