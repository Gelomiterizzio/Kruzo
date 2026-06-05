import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Acceso | KRUZO' }

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400">
        <Link href="/" className="flex items-center gap-2 font-display font-black text-2xl text-white">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">K</div>
          KRUZO
        </Link>
        <div className="text-white space-y-4">
          <div className="text-4xl font-display font-black leading-tight">
            Tu Ciudad.<br/>Tu Mercado.<br/>Tu Negocio.
          </div>
          <p className="text-white/70 text-lg">La plataforma comercial local de Santa Cruz de la Sierra, Bolivia.</p>
          <div className="flex gap-6 text-sm text-white/60 pt-4">
            <div><div className="text-xl font-bold text-white">500+</div><div>Negocios</div></div>
            <div><div className="text-xl font-bold text-white">10k+</div><div>Usuarios</div></div>
            <div><div className="text-xl font-bold text-white">50+</div><div>Categorías</div></div>
          </div>
        </div>
        <p className="text-white/40 text-sm">© {new Date().getFullYear()} KRUZO</p>
      </div>
      {/* Right panel */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="lg:hidden mb-8">
          <Link href="/" className="flex items-center gap-2 font-display font-black text-xl">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm">K</div>
            <span className="text-gradient">KRUZO</span>
          </Link>
        </div>
        <div className="max-w-sm mx-auto w-full">{children}</div>
      </div>
    </div>
  )
}
