'use client'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { postSchema, type PostFormValues } from '@/lib/utils/validators'
import { ImageUpload } from '@/components/shared/ImageUpload'
import { uploadPostImages } from '@/lib/firebase/storage'
import { createPost, updatePost } from '@/lib/firebase/firestore'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Post, PostFormData } from '@/lib/types/post'
import type { Business } from '@/lib/types/business'
import { BUSINESS_CATEGORIES } from '@/lib/utils/constants'

// Posts share the canonical category keys with businesses so category search
// and links work across both content types.
const CATEGORIES = [
  ...BUSINESS_CATEGORIES.map(c => ({ key: c.key, label: `${c.emoji} ${c.label}` })),
  { key: 'otros', label: '📦 Otro' },
]

interface Props { business: Business; existing?: Post }

// Hoisted out of the component: an inline definition gets a new identity every
// render, remounting the subtree and making inputs drop focus while typing.
const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div><label className="block text-sm font-medium mb-1.5">{label}</label>{children}{error && <p className="text-xs text-destructive mt-1">{error}</p>}</div>
)

const inputCls = 'w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'

export function PostForm({ business, existing }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [progress, setProgress] = useState(0)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: existing ? {
      title: existing.title, description: existing.description,
      price: existing.price, priceType: existing.priceType,
      originalPrice: existing.originalPrice,
      category: existing.category, subcategory: existing.subcategory,
      tags: existing.tags?.join(', ') ?? '',
      inStock: existing.inStock, stockCount: existing.stockCount ?? undefined,
      hasDelivery: existing.hasDelivery,
      deliveryZones: existing.deliveryZones?.join(', ') ?? '',
      deliveryPrice: existing.deliveryPrice,
      whatsappMessage: existing.whatsappMessage,
    } : { priceType: 'fixed', inStock: true, hasDelivery: false, deliveryPrice: 0 },
  })

  const priceType = watch('priceType')
  const hasDelivery = watch('hasDelivery')

  const onSubmit = async (raw: PostFormValues) => {
    if (!user) return
    setLoading(true)
    // Build an explicit, undefined-free payload (Firestore rejects `undefined`
    // values). Free/consult posts have no numeric price — stored as 0.
    const data: PostFormData = {
      title: raw.title,
      description: raw.description,
      price: raw.priceType === 'free' || raw.priceType === 'consult' ? 0 : raw.price ?? 0,
      priceType: raw.priceType,
      ...(raw.priceType === 'fixed' && raw.originalPrice ? { originalPrice: raw.originalPrice } : {}),
      category: raw.category,
      subcategory: raw.subcategory ?? '',
      tags: raw.tags ?? '',
      inStock: raw.inStock,
      ...(raw.stockCount !== undefined ? { stockCount: raw.stockCount } : {}),
      hasDelivery: raw.hasDelivery,
      deliveryZones: raw.deliveryZones ?? '',
      deliveryPrice: raw.deliveryPrice ?? 0,
      whatsappMessage: raw.whatsappMessage ?? '',
    }
    try {
      let postId = existing?.id
      if (!postId) {
        postId = await createPost(user.id, business.id, business.name, business.slug, business.logo, business.whatsapp, data)
        toast.success('¡Publicación creada!')
      } else {
        await updatePost(postId, {
          ...data,
          tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
          deliveryZones: data.deliveryZones.split(',').map(t => t.trim()).filter(Boolean),
        } as Partial<Post>)
        toast.success('Publicación actualizada')
      }
      if (imageFiles.length && postId) {
        const urls = await uploadPostImages(postId, imageFiles, p => setProgress(p))
        await updatePost(postId, { images: urls })
      }
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      router.push('/dashboard/posts')
    } catch { toast.error('Error al guardar publicación') }
    finally { setLoading(false); setProgress(0) }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
        <h2 className="font-semibold">Información del producto/servicio</h2>
        <Field label="Título *" error={errors.title?.message}>
          <input {...register('title')} placeholder="Ej: Torta de chocolate personalizada" className={inputCls} />
        </Field>
        <Field label="Descripción *" error={errors.description?.message}>
          <textarea {...register('description')} rows={3} placeholder="Describe el producto, detalles, materiales…" className={`${inputCls} resize-none`} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoría *" error={errors.category?.message}>
            <select {...register('category')} className={inputCls}>
              <option value="">Seleccionar…</option>
              {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Etiquetas">
            <input {...register('tags')} placeholder="cumpleaños, encargo, decorado" className={inputCls} />
          </Field>
        </div>
      </div>

      <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
        <h2 className="font-semibold">Precio</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tipo de precio" error={errors.priceType?.message}>
            <select {...register('priceType')} className={inputCls}>
              <option value="fixed">Precio fijo</option>
              <option value="negotiable">Negociable</option>
              <option value="free">Gratis</option>
              <option value="consult">Consultar</option>
            </select>
          </Field>
          {priceType !== 'free' && priceType !== 'consult' && (
            <Field label="Precio (Bs.) *" error={errors.price?.message}>
              <input {...register('price', { valueAsNumber: true })} type="number" min="0" placeholder="0.00" className={inputCls} />
            </Field>
          )}
        </div>
        {priceType === 'fixed' && (
          <Field label="Precio original (opcional, para mostrar descuento)">
            <input {...register('originalPrice', { valueAsNumber: true })} type="number" min="0" placeholder="0.00" className={inputCls} />
          </Field>
        )}

        <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
          <div>
            <p className="text-sm font-medium">¿Tiene delivery?</p>
            <p className="text-xs text-muted-foreground">Entregas a domicilio</p>
          </div>
          <input {...register('hasDelivery')} type="checkbox" className="w-5 h-5 rounded accent-primary" />
        </div>
        {hasDelivery && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Costo de delivery (Bs.)">
              <input {...register('deliveryPrice', { valueAsNumber: true })} type="number" min="0" className={inputCls} />
            </Field>
            <Field label="Zonas de delivery">
              <input {...register('deliveryZones')} placeholder="Norte, Sur, Plan 3000" className={inputCls} />
            </Field>
          </div>
        )}
      </div>

      <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
        <h2 className="font-semibold">Imágenes *</h2>
        <ImageUpload value={imageFiles} onChange={setImageFiles} maxFiles={5} label="Hasta 5 imágenes del producto"
          preview={existing?.images ?? []} />
        <Field label="Mensaje de WhatsApp personalizado (opcional)">
          <input {...register('whatsappMessage')} placeholder="Hola, me interesa este producto…" className={inputCls} />
        </Field>
      </div>

      {progress > 0 && (
        <div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-primary/90 disabled:opacity-60">
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        {loading ? 'Guardando…' : existing ? 'Actualizar publicación' : 'Crear publicación'}
      </button>
    </form>
  )
}
