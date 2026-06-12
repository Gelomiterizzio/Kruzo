import Link from 'next/link'
import type { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = { title: 'Acceso' }

const VALUE_PROPS = [
  'Registro y publicación gratis',
  'Contacto directo por WhatsApp, sin intermediarios',
  'Tu negocio visible en Google con SEO local',
]

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
          <ul className="space-y-2.5 pt-4">
            {VALUE_PROPS.map((v) => (
              <li key={v} className="flex items-center gap-2.5 text-sm text-white/80">
                <CheckCircle2 size={16} className="text-white/60 shrink-0" /> {v}
              </li>
            ))}
          </ul>
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
