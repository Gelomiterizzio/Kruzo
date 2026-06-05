'use client'
import { Bell, BellOff, CheckCheck } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { motion } from 'framer-motion'

const MOCK_NOTIFS = [
  { id: '1', type: 'review',   title: 'Nueva reseña',        desc: 'Alguien calificó tu negocio con 5 estrellas', time: 'Hace 5 min',   read: false },
  { id: '2', type: 'contact',  title: 'Contacto por WhatsApp', desc: 'Un cliente vio tu publicación "Torta de chocolate"', time: 'Hace 2h',   read: false },
  { id: '3', type: 'featured', title: 'Negocio destacado',   desc: 'Tu negocio fue seleccionado como destacado esta semana', time: 'Ayer', read: true },
  { id: '4', type: 'system',   title: 'Bienvenido a KRUZO',  desc: 'Completa tu perfil de negocio para aparecer en búsquedas', time: 'Hace 3 días', read: true },
]

const TYPE_ICON: Record<string, string> = { review: '⭐', contact: '💬', featured: '🏆', system: '🔔' }

export default function NotificationsPage() {
  return (
    <>
      <Navbar />
      <div className="container max-w-xl pt-20 pb-16 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Bell size={22} /> Notificaciones</h1>
            <p className="text-muted-foreground text-sm mt-0.5">2 sin leer</p>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <CheckCheck size={16} /> Marcar todas leídas
          </button>
        </div>

        <div className="space-y-2">
          {MOCK_NOTIFS.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-2xl border transition-all ${!n.read ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">{TYPE_ICON[n.type]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{n.title}</p>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  )
}
