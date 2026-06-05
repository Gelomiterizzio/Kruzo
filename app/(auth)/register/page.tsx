'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { registerSchema, type RegisterFormValues } from '@/lib/utils/validators'
import { useAuth } from '@/lib/hooks/useAuth'

export default function RegisterPage() {
  const router = useRouter()
  const { register: authRegister, loginGoogle, error } = useAuth()
  const [showPw, setShowPw] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await authRegister(data.email, data.password, data.name)
      router.push('/dashboard')
    } catch { /* handled in hook */ }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      await loginGoogle()
      router.push('/dashboard')
    } catch { /* handled in hook */ }
    finally { setGoogleLoading(false) }
  }

  const inputCls = 'w-full px-3 py-3 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all'

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Crear cuenta</h1>
        <p className="text-muted-foreground text-sm mt-1">Únete a KRUZO y conecta con Santa Cruz</p>
      </div>

      <button onClick={handleGoogle} disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2 py-3 border border-border rounded-xl text-sm font-medium hover:bg-accent transition-all disabled:opacity-60">
        {googleLoading
          ? <Loader2 size={18} className="animate-spin" />
          : <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        }
        Registrarse con Google
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">o con email</span></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20">{error}</div>}
        <div>
          <input {...register('name')} placeholder="Tu nombre completo" autoComplete="name" className={inputCls} />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <input {...register('email')} type="email" placeholder="tu@email.com" autoComplete="email" className={inputCls} />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>
        <div className="relative">
          <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="Contraseña (mín. 6 caracteres)" autoComplete="new-password" className={`${inputCls} pr-10`} />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <input {...register('confirmPassword')} type="password" placeholder="Confirmar contraseña" autoComplete="new-password" className={inputCls} />
          {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
        </div>
        <p className="text-xs text-muted-foreground">
          Al registrarte aceptas nuestros{' '}
          <Link href="/terms" className="text-primary hover:underline">Términos de uso</Link>
          {' '}y{' '}
          <Link href="/privacy" className="text-primary hover:underline">Política de privacidad</Link>.
        </p>
        <button type="submit" disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all">
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">Iniciar sesión</Link>
      </p>
    </motion.div>
  )
}
