import Link from 'next/link'
import { Home, Search } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button-variants'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="text-8xl font-display font-black text-gradient mb-4">404</div>
        <h1 className="text-2xl font-display font-bold mb-2">Página no encontrada</h1>
        <p className="text-muted-foreground mb-8 text-balance">
          La página que buscas no existe o fue movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className={buttonVariants({ variant: 'primary' })}>
            <Home size={18} /> Inicio
          </Link>
          <Link href="/search" className={buttonVariants({ variant: 'outline' })}>
            <Search size={18} /> Buscar
          </Link>
        </div>
      </div>
    </div>
  )
}
