'use client'
import { BarChart3, Eye, MessageCircle, Heart, TrendingUp, Users } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const MOCK_VIEWS = Array.from({ length: 14 }, (_, i) => ({
  day: `${i + 1}`,
  visitas: Math.floor(Math.random() * 80) + 20,
  contactos: Math.floor(Math.random() * 15) + 2,
}))

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><BarChart3 size={22} /> Estadísticas</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Actividad de los últimos 14 días</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Eye,           label: 'Visitas totales',  value: '1,248', change: '+12%', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950' },
          { icon: MessageCircle, label: 'Contactos WhatsApp',value: '89',  change: '+8%',  color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950' },
          { icon: Heart,         label: 'Guardados',        value: '34',   change: '+5%',  color: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-950' },
          { icon: TrendingUp,    label: 'Pos. promedio',   value: '#12',  change: '+3',   color: 'text-primary',   bg: 'bg-primary/5' },
        ].map(({ icon: Icon, label, value, change, color, bg }) => (
          <div key={label} className="p-4 bg-card border border-border rounded-2xl">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}><Icon size={18} className={color} /></div>
            <div className="text-2xl font-bold font-display">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">{change} esta semana</div>
          </div>
        ))}
      </div>

      <div className="p-5 bg-card border border-border rounded-2xl">
        <h2 className="font-semibold mb-4">Visitas y contactos (últimos 14 días)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={MOCK_VIEWS}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
            <Line type="monotone" dataKey="visitas" stroke="#ff4500" strokeWidth={2} dot={false} name="Visitas" />
            <Line type="monotone" dataKey="contactos" stroke="#22c55e" strokeWidth={2} dot={false} name="Contactos" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="p-5 bg-card border border-border rounded-2xl">
        <h2 className="font-semibold mb-4">Visitas por día de semana</h2>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={[
            { day: 'Lun', v: 45 }, { day: 'Mar', v: 62 }, { day: 'Mié', v: 58 },
            { day: 'Jue', v: 71 }, { day: 'Vie', v: 95 }, { day: 'Sáb', v: 110 }, { day: 'Dom', v: 78 },
          ]}>
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
            <Bar dataKey="v" fill="#ff4500" radius={[6, 6, 0, 0]} name="Visitas" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
