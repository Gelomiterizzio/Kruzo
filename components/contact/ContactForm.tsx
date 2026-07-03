'use client'
import { useState } from 'react'
import { Loader2, Send, CheckCircle } from 'lucide-react'
import { sendContactMessage } from '@/lib/firebase/firestore'
import { toast } from 'sonner'

const inputCls = 'w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all'

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  // Honeypot: invisible to humans, filled by naive spam bots. When it has a
  // value we short-circuit to the success state without writing anything.
  const [website, setWebsite] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (website.trim()) { setSent(true); return }
    if (form.name.trim().length < 2) { toast.error('Ingresa tu nombre'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error('Ingresa un email válido'); return }
    if (form.message.trim().length < 10) { toast.error('Cuéntanos un poco más (mínimo 10 caracteres)'); return }

    setSending(true)
    try {
      await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      })
      setSent(true)
    } catch {
      toast.error('No se pudo enviar el mensaje. Intenta de nuevo.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="p-8 bg-card border border-border rounded-2xl text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-3">
          <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
        </div>
        <h2 className="font-semibold mb-1">¡Mensaje enviado!</h2>
        <p className="text-sm text-muted-foreground">Gracias por escribirnos. Te responderemos pronto a {form.email}.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="p-6 bg-card border border-border rounded-2xl space-y-4">
      <h2 className="font-semibold">Envíanos un mensaje</h2>
      {/* Honeypot — hidden from real users (and from assistive tech). */}
      <div aria-hidden="true" className="absolute w-px h-px overflow-hidden opacity-0 pointer-events-none">
        <label htmlFor="contact-website">No completes este campo</label>
        <input id="contact-website" type="text" tabIndex={-1} autoComplete="off"
          value={website} onChange={e => setWebsite(e.target.value)} />
      </div>
      <div>
        <label htmlFor="contact-name" className="sr-only">Nombre</label>
        <input id="contact-name" value={form.name} onChange={set('name')} placeholder="Tu nombre" maxLength={100} className={inputCls} />
      </div>
      <div>
        <label htmlFor="contact-email" className="sr-only">Email</label>
        <input id="contact-email" type="email" value={form.email} onChange={set('email')} placeholder="tu@email.com" maxLength={200} className={inputCls} />
      </div>
      <div>
        <label htmlFor="contact-message" className="sr-only">Mensaje</label>
        <textarea id="contact-message" rows={4} value={form.message} onChange={set('message')} placeholder="Tu mensaje…" maxLength={2000} className={`${inputCls} resize-none`} />
      </div>
      <button type="submit" disabled={sending}
        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors">
        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {sending ? 'Enviando…' : 'Enviar mensaje'}
      </button>
    </form>
  )
}
