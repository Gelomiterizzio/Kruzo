import type { Metadata } from 'next'
import { MapPin, Target, Zap, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Nosotros',
  description: 'Conoce la historia y misión de KRUZO, la plataforma comercial local de Santa Cruz de la Sierra.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <div className="container max-w-3xl pt-24 pb-16 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-display font-black mb-4">Sobre <span className="text-gradient">KRUZO</span></h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          La plataforma comercial local nacida en Santa Cruz de la Sierra, Bolivia, para conectar emprendedores con su comunidad.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[
          { icon: Target, title: 'Nuestra misión', desc: 'Democratizar el acceso al mercado digital para todo emprendedor cruceño, sin importar su tamaño o experiencia tecnológica.' },
          { icon: Heart, title: 'Nuestra visión', desc: 'Ser el directorio comercial más grande de Bolivia, conectando cada barrio, zona y municipio con sus negocios locales.' },
          { icon: MapPin, title: 'Dónde operamos', desc: 'Iniciamos en Santa Cruz de la Sierra y expandimos progresivamente a Warnes, La Guardia, Cotoca y todo el departamento.' },
          { icon: Zap, title: 'Nuestro diferencial', desc: 'Contacto directo por WhatsApp, sin intermediarios, con SEO local que pone tu negocio en Google desde el primer día.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="p-5 bg-card border border-border rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Icon size={20} className="text-primary" />
            </div>
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="p-6 bg-gradient-to-r from-brand-500/10 to-gold-400/10 rounded-2xl border border-primary/20 text-center">
        <p className="text-lg font-semibold mb-2">¿Tienes un negocio en Santa Cruz?</p>
        <p className="text-muted-foreground text-sm mb-4">Regístralo gratis en KRUZO y llega a miles de personas.</p>
        <a href="/register" className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors inline-block">
          Registrar mi negocio
        </a>
      </div>
    </div>
  )
}
