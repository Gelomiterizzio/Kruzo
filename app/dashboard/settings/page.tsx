'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { updateUserProfile } from '@/lib/firebase/firestore'
import { Settings, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function DashboardSettingsPage() {
  const { user } = useAuth()
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
    try {
      await updateUserProfile(user.id, form as any)
      toast.success('Configuración guardada')
    } catch { toast.error('Error al guardar') }
    finally { setLoading(false) }
  }

  const inputCls = 'w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30'

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Settings size={22} /> Configuración</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Administra tu cuenta y preferencias</p>
      </div>

      <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
        <h2 className="font-semibold">Información personal</h2>
        {[
          { label: 'Nombre', key: 'displayName', placeholder: 'Tu nombre' },
          { label: 'Teléfono', key: 'phone', placeholder: '70000000' },
          { label: 'Ubicación', key: 'location', placeholder: 'Santa Cruz de la Sierra' },
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

      <div className="p-5 bg-card border border-border rounded-2xl space-y-3">
        <h2 className="font-semibold">Notificaciones</h2>
        {[
          { key: 'email', label: 'Email', desc: 'Resumen por email' },
          { key: 'push', label: 'Push', desc: 'Notificaciones del navegador' },
          { key: 'newReviews', label: 'Nuevas reseñas', desc: 'Cuando alguien califica tu negocio' },
          { key: 'newMessages', label: 'Mensajes', desc: 'Consultas de clientes' },
          { key: 'promotions', label: 'Promociones', desc: 'Ofertas y novedades de KRUZO' },
        ].map(({ key, label, desc }) => (
          <label key={key} className="flex items-center justify-between p-3 bg-muted rounded-xl cursor-pointer hover:bg-accent transition-colors">
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <div onClick={() => setForm(f => ({ ...f, notifications: { ...f.notifications, [key]: !(f.notifications as any)[key] } }))}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${(form.notifications as any)[key] ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(form.notifications as any)[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </label>
        ))}
      </div>

      <button onClick={save} disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-60">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {loading ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </div>
  )
}
