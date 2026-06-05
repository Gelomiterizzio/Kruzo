'use client'
import { useState } from 'react'
import { LayoutGrid, Plus, Pencil, Trash2 } from 'lucide-react'

const DEFAULT_CATS = [
  { key: 'comida', emoji: '🍕', label: 'Comida', count: 0 },
  { key: 'reposteria', emoji: '🧁', label: 'Repostería', count: 0 },
  { key: 'tecnologia', emoji: '💻', label: 'Tecnología', count: 0 },
  { key: 'belleza', emoji: '💇', label: 'Belleza', count: 0 },
  { key: 'ropa', emoji: '👗', label: 'Ropa', count: 0 },
  { key: 'servicios', emoji: '🔧', label: 'Servicios', count: 0 },
  { key: 'fotografia', emoji: '📸', label: 'Fotografía', count: 0 },
  { key: 'automotriz', emoji: '🚗', label: 'Automotriz', count: 0 },
  { key: 'hogar', emoji: '🏠', label: 'Hogar', count: 0 },
  { key: 'educacion', emoji: '🎓', label: 'Educación', count: 0 },
  { key: 'electricistas', emoji: '⚡', label: 'Electricistas', count: 0 },
  { key: 'carpinteria', emoji: '🪑', label: 'Carpintería', count: 0 },
]

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState(DEFAULT_CATS)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2"><LayoutGrid size={22} /> Categorías</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{cats.length} categorías activas</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90">
          <Plus size={16} /> Agregar
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cats.map(cat => (
          <div key={cat.key} className="p-4 bg-card border border-border rounded-2xl flex items-center gap-3 group">
            <span className="text-2xl">{cat.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{cat.label}</p>
              <p className="text-xs text-muted-foreground">{cat.count} negocios</p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 rounded-lg hover:bg-accent transition-colors"><Pencil size={13} /></button>
              <button className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
