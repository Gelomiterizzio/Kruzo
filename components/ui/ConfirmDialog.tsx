'use client'
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  /** 'danger' renders the confirm button in destructive red. */
  variant?: 'default' | 'danger'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Lightweight confirmation modal — used before destructive/irreversible actions. */
export function ConfirmDialog({
  open, title, description,
  confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
  variant = 'default', loading = false,
  onConfirm, onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !loading) onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, loading, onCancel])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => !loading && onCancel()}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          {/* Panel */}
          <motion.div
            role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl p-5"
          >
            <div className="flex items-start gap-3 mb-4">
              {variant === 'danger' && (
                <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-destructive" />
                </div>
              )}
              <div className="min-w-0">
                <h2 id="confirm-title" className="font-semibold">{title}</h2>
                <p id="confirm-desc" className="text-sm text-muted-foreground mt-1">{description}</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button ref={cancelRef} type="button" onClick={onCancel} disabled={loading}
                className="px-4 py-2 text-sm font-medium border border-border rounded-xl hover:bg-accent transition-colors disabled:opacity-60">
                {cancelLabel}
              </button>
              <button type="button" onClick={onConfirm} disabled={loading}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-60',
                  variant === 'danger' ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90',
                )}>
                {loading && <Loader2 size={14} className="animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
