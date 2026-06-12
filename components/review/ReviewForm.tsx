'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { StarRating } from './StarRating'
import { reviewSchema, type ReviewFormValues } from '@/lib/utils/validators'
import { createReview } from '@/lib/firebase/firestore'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'

interface Props {
  businessId: string
  onSuccess?: () => void
}

export function ReviewForm({ businessId, onSuccess }: Props) {
  const { user, isAuthenticated } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  })
  const rating = watch('rating')

  if (!isAuthenticated) return (
    <div className="p-4 bg-muted rounded-2xl text-center text-sm text-muted-foreground">
      <a href="/login" className="text-primary font-medium">Inicia sesión</a> para dejar una reseña
    </div>
  )

  const onSubmit = async (data: ReviewFormValues) => {
    if (!user) return
    setSubmitting(true)
    try {
      await createReview(businessId, user.id, user.displayName, user.photoURL, data)
      toast.success('¡Reseña publicada! Gracias por tu opinión.')
      reset()
      onSuccess?.()
    } catch (e) {
      const err = e as { code?: string; message?: string }
      const isDuplicate = err?.code === 'permission-denied' || err?.message === 'already-reviewed'
      toast.error(isDuplicate ? 'Ya dejaste una reseña en este negocio' : 'Error al publicar reseña')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 bg-card border border-border rounded-2xl space-y-4">
      <h3 className="font-semibold">Dejar una reseña</h3>
      <div>
        <StarRating value={rating} onChange={v => setValue('rating', v, { shouldValidate: true })} size={28} showLabel />
        {errors.rating && <p className="text-xs text-destructive mt-1">{errors.rating.message}</p>}
      </div>
      <div>
        <textarea
          {...register('comment')}
          rows={3}
          placeholder="Comparte tu experiencia con este negocio…"
          className="w-full px-3 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all"
        />
        {errors.comment && <p className="text-xs text-destructive mt-1">{errors.comment.message}</p>}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting ? 'Publicando…' : 'Publicar reseña'}
      </button>
    </form>
  )
}
