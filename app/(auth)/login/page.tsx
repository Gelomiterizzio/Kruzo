'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { loginSchema, type LoginFormValues } from '@/lib/utils/validators'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GoogleIcon } from '@/components/ui/GoogleIcon'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') ?? '/dashboard'
  const { loginEmail, loginGoogle, error } = useAuth()
  const [googleLoading, setGoogleLoading] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await loginEmail(data.email, data.password)
      router.push(redirect)
    } catch { /* error handled in hook */ }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      await loginGoogle()
      router.push(redirect)
    } catch { /* error handled in hook */ }
    finally { setGoogleLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Bienvenido de vuelta</h1>
        <p className="text-muted-foreground text-sm mt-1">Inicia sesión para acceder a tu cuenta</p>
      </div>

      <Button variant="outline" size="lg" className="w-full" onClick={handleGoogle} loading={googleLoading}>
        {!googleLoading && <GoogleIcon />}
        Continuar con Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">o con email</span></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20">
            {error}
          </div>
        )}
        <Input
          {...register('email')}
          type="email"
          label="Email"
          leftIcon={Mail}
          placeholder="tu@email.com"
          autoComplete="email"
          error={errors.email?.message}
        />
        <Input
          {...register('password')}
          type="password"
          label="Contraseña"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
        />
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-primary font-semibold hover:underline">Regístrate gratis</Link>
      </p>
    </motion.div>
  )
}
