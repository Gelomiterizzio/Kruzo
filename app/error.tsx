'use client'
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('App Error:', error) }, [error])
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-destructive" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">Algo salió mal</h1>
        <p className="text-muted-foreground text-sm mb-6">{error.message ?? 'Error inesperado. Intenta recargar.'}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
            <RefreshCw size={16} /> Reintentar
          </button>
          <Link href="/" className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl font-medium hover:bg-accent transition-colors">
            <Home size={16} /> Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
