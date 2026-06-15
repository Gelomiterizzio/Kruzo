'use client'
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { buttonVariants } from '@/components/ui/button-variants'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('App Error:', error) }, [error])
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-destructive" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">Algo salió mal</h1>
        <p className="text-muted-foreground text-sm mb-6 text-balance">{error.message || 'Error inesperado. Intenta recargar.'}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset}>
            <RefreshCw size={16} /> Reintentar
          </Button>
          <Link href="/" className={buttonVariants({ variant: 'outline' })}>
            <Home size={16} /> Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
