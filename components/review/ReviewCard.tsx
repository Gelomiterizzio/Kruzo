'use client'
import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Flag, ChevronDown, ChevronUp, CheckCircle, Loader2, MessageCircle } from 'lucide-react'
import { StarRating } from './StarRating'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { reportReview, replyToReview } from '@/lib/firebase/firestore'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatRelativeTime, getInitials, truncate } from '@/lib/utils/formatters'
import { toast } from 'sonner'
import type { Review } from '@/lib/types/review'

interface ReviewCardProps {
  review: Review
  index?: number
  /** Business-owner mode (dashboard): shows the "reply" action when the
      review has no reply yet. Rules only let the owner write the reply fields. */
  canReply?: boolean
  /** Called after a reply is saved so the parent list can refetch. */
  onReplied?: () => void
}

export function ReviewCard({ review, index = 0, canReply = false, onReplied }: ReviewCardProps) {
  const { user } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [confirmReport, setConfirmReport] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [savingReply, setSavingReply] = useState(false)
  const isLong = review.comment.length > 200

  const submitReply = async () => {
    const text = replyText.trim()
    if (text.length < 2) { toast.error('Escribe una respuesta'); return }
    setSavingReply(true)
    try {
      await replyToReview(review.businessId, review.id, text)
      toast.success('Respuesta publicada')
      setReplying(false)
      setReplyText('')
      onReplied?.()
    } catch {
      toast.error('No se pudo publicar la respuesta')
    } finally {
      setSavingReply(false)
    }
  }

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
            <Image src={review.userPhoto} alt="" width={36} height={36} className="w-9 h-9 rounded-xl object-cover" />
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

      {canReply && !review.ownerReply && (
        replying ? (
          <div className="space-y-2">
            <label htmlFor={`reply-${review.id}`} className="sr-only">Tu respuesta</label>
            <textarea
              id={`reply-${review.id}`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={2}
              maxLength={1000}
              placeholder="Responde públicamente a esta reseña…"
              className="w-full px-3 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setReplying(false); setReplyText('') }} disabled={savingReply}
                className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-60">
                Cancelar
              </button>
              <button onClick={submitReply} disabled={savingReply}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60">
                {savingReply && <Loader2 size={12} className="animate-spin" />}
                Publicar respuesta
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setReplying(true)}
            className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
            <MessageCircle size={12} /> Responder
          </button>
        )
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
