'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

export default function ForgotPasswordPage() {
  const { sendReset } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Ingresa tu email'); return }
    setLoading(true)
    const ok = await sendReset(email)
    setLoading(false)
    if (ok) setSent(true)
    else setError('No se encontró una cuenta con ese email')
  }

  if (sent) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto">
        <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
      </div>
      <h2 className="text-xl font-bold">¡Email enviado!</h2>
      <p className="text-muted-foreground text-sm">Revisa tu bandeja de entrada en <strong>{email}</strong> y sigue las instrucciones para restablecer tu contraseña.</p>
      <Link href="/login" className="block w-full py-3 bg-primary text-white rounded-xl text-sm font-medium text-center hover:bg-primary/90">
        Volver al inicio de sesión
      </Link>
    </motion.div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Link href="/login" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Volver
      </Link>
      <div>
        <h1 className="text-2xl font-display font-bold">Recuperar contraseña</h1>
        <p className="text-muted-foreground text-sm mt-1">Te enviaremos un enlace para restablecer tu contraseña</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl">{error}</div>}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"
            className="w-full pl-9 pr-3 py-3 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-60">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Enviando…' : 'Enviar enlace'}
        </button>
      </form>
    </motion.div>
  )
}
