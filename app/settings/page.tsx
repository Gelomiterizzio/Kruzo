'use client'
import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/lib/hooks/useAuth'
import { updateUserProfile } from '@/lib/firebase/firestore'
import { Settings, User, Bell, Shield, Loader2, Save, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const TABS = [
  { id: 'profile',  label: 'Perfil',          icon: User },
  { id: 'notifs',   label: 'Notificaciones',   icon: Bell },
  { id: 'security', label: 'Seguridad',        icon: Shield },
]

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    displayName: user?.displayName ?? '',
    phone: user?.phone ?? '',
    bio: user?.bio ?? '',
    location: user?.location ?? 'Santa Cruz de la Sierra',
    notifications: user?.notifications ?? { email: true, push: true, whatsapp: false, newReviews: true, newMessages: true, promotions: false },
  })

  const save = async () => {
    if (!user) return
    setLoading(true)
    try { await updateUserProfile(user.id, form as any); toast.success('Cambios guardados') }
    catch { toast.error('Error al guardar') }
    finally { setLoading(false) }
  }

  const handleLogout = async () => {
    await signOut(); router.push('/')
  }

  const inputCls = 'w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all'

  return (
    <>
      <Navbar />
      <div className="container max-w-2xl pt-20 pb-16 space-y-6">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Settings size={22} /> Configuración</h1>

        <div className="flex gap-1 border-b border-border">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl">
              {user?.photoURL
                ? <img src={user.photoURL} alt="" className="w-16 h-16 rounded-2xl object-cover" />
                : <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">{user?.displayName?.[0] ?? 'U'}</div>
              }
              <div>
                <p className="font-semibold">{user?.displayName}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <p className="text-xs text-primary mt-0.5 capitalize">{user?.role}</p>
              </div>
            </div>

            <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
              {[
                { label: 'Nombre completo', key: 'displayName', placeholder: 'Tu nombre' },
                { label: 'Teléfono', key: 'phone', placeholder: '+591 70000000' },
                { label: 'Ciudad', key: 'location', placeholder: 'Santa Cruz de la Sierra' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1.5">{label}</label>
                  <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} className={inputCls} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1.5">Bio</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  rows={3} placeholder="Cuéntanos sobre ti…" className={`${inputCls} resize-none`} />
              </div>
            </div>

            <button onClick={save} disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        )}

        {tab === 'notifs' && (
          <div className="p-5 bg-card border border-border rounded-2xl space-y-3">
            {[
              { key: 'email',       label: 'Email',             desc: 'Resúmenes y actualizaciones' },
              { key: 'push',        label: 'Notificaciones push', desc: 'Alertas en el navegador' },
              { key: 'newReviews',  label: 'Nuevas reseñas',    desc: 'Cuando alguien califica tu negocio' },
              { key: 'newMessages', label: 'Mensajes',          desc: 'Consultas de clientes' },
              { key: 'promotions',  label: 'Promociones',       desc: 'Ofertas y novedades de KRUZO' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-center justify-between p-3 bg-muted rounded-xl cursor-pointer hover:bg-accent transition-colors">
                <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
                <div onClick={() => setForm(f => ({ ...f, notifications: { ...f.notifications, [key]: !(f.notifications as any)[key] } }))}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${(form.notifications as any)[key] ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(form.notifications as any)[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </label>
            ))}
            <button onClick={save} disabled={loading} className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Guardar preferencias
            </button>
          </div>
        )}

        {tab === 'security' && (
          <div className="space-y-4">
            <div className="p-5 bg-card border border-border rounded-2xl space-y-3">
              <h2 className="font-semibold">Sesión</h2>
              <p className="text-sm text-muted-foreground">Sesión activa como <strong>{user?.email}</strong></p>
              <button onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 border border-destructive text-destructive rounded-xl text-sm font-medium hover:bg-destructive/10 transition-colors">
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>
            <div className="p-5 bg-card border border-border rounded-2xl">
              <h2 className="font-semibold mb-2">Eliminar cuenta</h2>
              <p className="text-sm text-muted-foreground mb-3">Esta acción es permanente e irreversible.</p>
              <button className="px-4 py-2 bg-destructive text-white rounded-xl text-sm font-medium hover:bg-destructive/90 transition-colors">
                Eliminar mi cuenta
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
