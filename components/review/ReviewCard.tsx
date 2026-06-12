'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flag, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import { StarRating } from './StarRating'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { reportReview } from '@/lib/firebase/firestore'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatRelativeTime, getInitials, truncate } from '@/lib/utils/formatters'
import { toast } from 'sonner'
import type { Review } from '@/lib/types/review'

export function ReviewCard({ review, index = 0 }: { review: Review; index?: number }) {
  const { user } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [confirmReport, setConfirmReport] = useState(false)
  const [reporting, setReporting] = useState(false)
  const isLong = review.comment.length > 200

  const handleReportClick = () => {
    if (!user) { toast.error('Inicia sesión para reportar contenido'); return }
    setConfirmReport(true)
  }

  const submitReport = async () => {
    if (!user) return
    setReporting(true)
    try {
      await reportReview(review.businessId, review.id, user.id)
      toast.success('Reseña reportada. Nuestro equipo la revisará.')
    } catch {
      // The fixed doc id makes a second report a denied update.
      toast.error('Ya reportaste esta reseña')
    } finally {
      setReporting(false)
      setConfirmReport(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      className="p-4 bg-card border border-border rounded-2xl space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {review.userPhoto ? (
            <img src={review.userPhoto} alt="" className="w-9 h-9 rounded-xl object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
              {getInitials(review.userName)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium">{review.userName}</p>
              {review.isVerified && <CheckCircle size={13} className="text-blue-500" />}
            </div>
            <p className="text-xs text-muted-foreground">{formatRelativeTime(review.createdAt)}</p>
          </div>
        </div>
        <StarRating value={review.rating} size={14} readonly />
      </div>

      <div>
        <p className="text-sm leading-relaxed text-foreground/90">
          {isLong && !expanded ? truncate(review.comment, 200) : review.comment}
        </p>
        {isLong && (
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-primary mt-1 hover:underline">
            {expanded ? <><ChevronUp size={12} /> Ver menos</> : <><ChevronDown size={12} /> Ver más</>}
          </button>
        )}
      </div>

      {review.ownerReply && (
        <div className="bg-muted rounded-xl p-3 border-l-2 border-primary">
          <p className="text-xs font-semibold mb-1 text-primary">Respuesta del propietario</p>
          <p className="text-xs text-muted-foreground">{review.ownerReply}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={handleReportClick}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
          <Flag size={12} /> Reportar
        </button>
      </div>

      <ConfirmDialog
        open={confirmReport}
        title="¿Reportar esta reseña?"
        description="Nuestro equipo de moderación la revisará y decidirá si corresponde ocultarla."
        confirmLabel="Reportar"
        variant="danger"
        loading={reporting}
        onConfirm={submitReport}
        onCancel={() => setConfirmReport(false)}
      />
    </motion.div>
  )
}
