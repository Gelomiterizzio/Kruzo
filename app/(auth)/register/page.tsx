'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, User } from 'lucide-react'
import { registerSchema, type RegisterFormValues } from '@/lib/utils/validators'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GoogleIcon } from '@/components/ui/GoogleIcon'

export default function RegisterPage() {
  const router = useRouter()
  const { register: authRegister, loginGoogle, error } = useAuth()
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

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Crear cuenta</h1>
        <p className="text-muted-foreground text-sm mt-1">Únete a KRUZO y conecta con Santa Cruz</p>
      </div>

      <Button variant="outline" size="lg" className="w-full" onClick={handleGoogle} loading={googleLoading}>
        {!googleLoading && <GoogleIcon />}
        Registrarse con Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">o con email</span></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20">{error}</div>}
        <Input
          {...register('name')}
          label="Nombre completo"
          leftIcon={User}
          placeholder="Tu nombre completo"
          autoComplete="name"
          error={errors.name?.message}
        />
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
          placeholder="Mín. 6 caracteres"
          autoComplete="new-password"
          error={errors.password?.message}
        />
        <Input
          {...register('confirmPassword')}
          type="password"
          label="Confirmar contraseña"
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
        />
        <p className="text-xs text-muted-foreground">
          Al registrarte aceptas nuestros{' '}
          <Link href="/terms" className="text-primary hover:underline">Términos de uso</Link>
          {' '}y{' '}
          <Link href="/privacy" className="text-primary hover:underline">Política de privacidad</Link>.
        </p>
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">Iniciar sesión</Link>
      </p>
    </motion.div>
  )
}
