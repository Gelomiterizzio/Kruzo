import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-display font-black text-gradient mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Página no encontrada</h1>
        <p className="text-muted-foreground mb-8">
          La página que buscas no existe o fue movida.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
            <Home size={18} /> Inicio
          </Link>
          <Link href="/search" className="flex items-center gap-2 px-5 py-2.5 border rounded-xl font-medium hover:bg-accent transition-colors">
            <Search size={18} /> Buscar
          </Link>
        </div>
      </div>
    </div>
  )
}
