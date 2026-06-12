import Link from 'next/link'
import { MapPin, Instagram, Facebook, Mail } from 'lucide-react'

const LINKS = {
  platform: [
    { href: '/explore',  label: 'Explorar' },
    { href: '/trending', label: 'Tendencias' },
    { href: '/search',   label: 'Buscar' },
    { href: '/about',    label: 'Nosotros' },
  ],
  categories: [
    { href: '/search?cat=comida',      label: 'Comida' },
    { href: '/search?cat=tecnologia',  label: 'Tecnología' },
    { href: '/search?cat=belleza',     label: 'Belleza' },
    { href: '/search?cat=servicios',   label: 'Servicios' },
  ],
  business: [
    { href: '/register',   label: 'Registra tu negocio' },
    { href: '/dashboard',  label: 'Panel de control' },
    { href: '/contact',    label: 'Contacto' },
    { href: '/terms',      label: 'Términos de uso' },
    { href: '/privacy',    label: 'Privacidad' },
  ],
}

const SOCIALS = [
  { href: 'https://instagram.com/kruzo_scz', Icon: Instagram, label: 'Instagram' },
  { href: 'https://facebook.com/kruzo.bo',   Icon: Facebook,  label: 'Facebook'  },
  { href: 'mailto:hola@kruzo.bo',            Icon: Mail,      label: 'Email'     },
]

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/50">
      {/* Main footer body */}
      <div className="bg-card/40">
        <div className="container py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

            {/* ── Brand column ── */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2.5 font-display font-black text-xl mb-4 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white text-sm font-black transition-shadow group-hover:shadow-glow-sm">
                  K
                </div>
                <span className="text-gradient tracking-tight">KRUZO</span>
              </Link>

              <p className="text-sm text-muted-foreground mb-5 leading-relaxed max-w-[240px]">
                La red comercial local de Santa Cruz de la Sierra. Conectamos emprendedores con su comunidad.
              </p>

              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary/80 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/15">
                <MapPin size={11} />
                Santa Cruz de la Sierra, Bolivia
              </div>
            </div>

            {/* ── Link columns ── */}
            {([
              { title: 'Plataforma', links: LINKS.platform   },
              { title: 'Categorías', links: LINKS.categories },
              { title: 'Negocios',   links: LINKS.business   },
            ] as const).map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-bold mb-4 font-display">{col.title}</h3>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-sm text-muted-foreground hover:text-foreground inline-block hover:translate-x-0.5 transition-[color,transform] duration-200"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-border/40 bg-card/20">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} KRUZO · Hecho con ❤️ en Bolivia
          </p>

          <div className="flex items-center gap-2">
            {SOCIALS.map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="p-2 rounded-xl border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
