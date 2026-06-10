'use client'
// Shared between /settings and /dashboard/settings so the profile form exists
// exactly once. Mount these with key={user.id}: the form state is seeded from
// the loaded user via useState initializers, so it can never start empty and
// silently wipe the profile on save (the bug the previous inline forms had).
import { useState } from 'react'
import { updateUserProfile } from '@/lib/firebase/firestore'
import { Switch } from '@/components/ui/Switch'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import type { AppUser } from '@/lib/types/user'

const inputCls = 'w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all'

const DEFAULT_NOTIFICATIONS = {
  email: true, whatsapp: false, push: true,
  newReviews: true, newMessages: true, promotions: false,
}

const PROFILE_FIELDS = [
  { label: 'Nombre completo', key: 'displayName', placeholder: 'Tu nombre' },
  { label: 'Teléfono', key: 'phone', placeholder: '70000000' },
  { label: 'Ubicación', key: 'location', placeholder: 'Santa Cruz de la Sierra' },
] as const

export function ProfileForm({ user }: { user: AppUser }) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    displayName: user.displayName ?? '',
    phone: user.phone ?? '',
    bio: user.bio ?? '',
    location: user.location ?? 'Santa Cruz de la Sierra',
  })

  const save = async () => {
    setSaving(true)
    try {
      await updateUserProfile(user.id, form)
      toast.success('Cambios guardados')
    } catch { toast.error('Error al guardar') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
        <h2 className="font-semibold">Información personal</h2>
        {PROFILE_FIELDS.map(({ label, key, placeholder }) => (
          <div key={key}>
            <label htmlFor={`profile-${key}`} className="block text-sm font-medium mb-1.5">{label}</label>
            <input id={`profile-${key}`} value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder} className={inputCls} />
          </div>
        ))}
        <div>
          <label htmlFor="profile-bio" className="block text-sm font-medium mb-1.5">Bio</label>
          <textarea id="profile-bio" value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            rows={3} placeholder="Cuéntanos sobre ti…" className={`${inputCls} resize-none`} />
        </div>
      </div>

      <button onClick={save} disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </div>
  )
}

const NOTIFICATION_OPTIONS = [
  { key: 'email', label: 'Email', desc: 'Resúmenes y actualizaciones' },
  { key: 'push', label: 'Notificaciones push', desc: 'Alertas en el navegador' },
  { key: 'newReviews', label: 'Nuevas reseñas', desc: 'Cuando alguien califica tu negocio' },
  { key: 'newMessages', label: 'Mensajes', desc: 'Consultas de clientes' },
  { key: 'promotions', label: 'Promociones', desc: 'Ofertas y novedades de KRUZO' },
] as const

export function NotificationSettings({ user }: { user: AppUser }) {
  const [saving, setSaving] = useState(false)
  const [prefs, setPrefs] = useState({ ...DEFAULT_NOTIFICATIONS, ...(user.notifications ?? {}) })

  const save = async () => {
    setSaving(true)
    try {
      await updateUserProfile(user.id, { notifications: prefs })
      toast.success('Preferencias guardadas')
    } catch { toast.error('Error al guardar') }
    finally { setSaving(false) }
  }

  return (
    <div className="p-5 bg-card border border-border rounded-2xl space-y-3">
      <h2 className="font-semibold">Notificaciones</h2>
      {NOTIFICATION_OPTIONS.map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between gap-3 p-3 bg-muted rounded-xl">
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
          <Switch
            checked={prefs[key]}
            onChange={(v) => setPrefs(p => ({ ...p, [key]: v }))}
            label={label}
          />
        </div>
      ))}
      <button onClick={save} disabled={saving}
        className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Guardar preferencias
      </button>
    </div>
  )
}
