import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Flag, AlertTriangle } from 'lucide-react'

export default async function AdminReportsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Flag size={22} /> Reportes</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Contenido reportado por usuarios</p>
      </div>

      <div className="p-10 text-center bg-card border border-border rounded-2xl">
        <AlertTriangle size={32} className="mx-auto mb-3 text-muted-foreground" />
        <p className="font-medium">No hay reportes pendientes</p>
        <p className="text-sm text-muted-foreground mt-1">Los reportes de usuarios aparecerán aquí</p>
      </div>
    </div>
  )
}
