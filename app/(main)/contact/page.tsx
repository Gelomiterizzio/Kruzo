import type { Metadata } from 'next'
import { Mail, MessageCircle, Instagram, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contacto | KRUZO',
  description: 'Contáctanos para soporte, alianzas o información sobre KRUZO.',
}

export default function ContactPage() {
  return (
    <div className="container max-w-2xl pt-24 pb-16 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-black mb-2">Contacto</h1>
        <p className="text-muted-foreground">¿Tienes preguntas o quieres aliarte con nosotros? Escríbenos.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { icon: MessageCircle, label: 'WhatsApp', value: '+591 70000000', href: 'https://wa.me/59170000000?text=Hola KRUZO!' },
          { icon: Mail, label: 'Email', value: 'hola@kruzo.bo', href: 'mailto:hola@kruzo.bo' },
          { icon: Instagram, label: 'Instagram', value: '@kruzo_scz', href: 'https://instagram.com/kruzo_scz' },
          { icon: MapPin, label: 'Ubicación', value: 'Santa Cruz de la Sierra, Bolivia', href: '' },
        ].map(({ icon: Icon, label, value, href }) => (
          <div key={label} className="p-4 bg-card border border-border rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              {href ? <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-sm hover:text-primary">{value}</a>
                : <p className="font-medium text-sm">{value}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
        <h2 className="font-semibold">Envíanos un mensaje</h2>
        <input placeholder="Tu nombre" className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <input type="email" placeholder="tu@email.com" className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <textarea rows={4} placeholder="Tu mensaje…" className="w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        <button className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
          Enviar mensaje
        </button>
      </div>
    </div>
  )
}
