import type { Metadata } from 'next'
import { Mail, Instagram, MapPin } from 'lucide-react'
import { ContactForm } from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contáctanos para soporte, alianzas o información sobre KRUZO.',
  alternates: { canonical: '/contact' },
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

      <ContactForm />
    </div>
  )
}
