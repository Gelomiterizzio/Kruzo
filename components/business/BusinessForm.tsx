'use client'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, MapPin } from 'lucide-react'
import { businessSchema, type BusinessFormValues } from '@/lib/utils/validators'
import { ImageUpload } from '@/components/shared/ImageUpload'
import { uploadBusinessImages } from '@/lib/firebase/storage'
import { createBusiness, updateBusiness } from '@/lib/firebase/firestore'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Business } from '@/lib/types/business'
import { BUSINESS_CATEGORIES, SCZ_ZONES } from '@/lib/utils/constants'

interface Props { existing?: Business }

export function BusinessForm({ existing }: Props) {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [logoFiles, setLogoFiles] = useState<File[]>([])
  const [coverFiles, setCoverFiles] = useState<File[]>([])
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: existing ? {
      name: existing.name, tagline: existing.tagline, description: existing.description,
      category: existing.category, subcategory: existing.subcategory, tags: existing.tags?.join(', ') ?? '',
      whatsapp: existing.whatsapp, phone: existing.phone, email: existing.email,
      instagram: existing.instagram, facebook: existing.facebook, tiktok: existing.tiktok, website: existing.website,
      address: existing.address, zone: existing.zone,
      hasDelivery: existing.hasDelivery, hasOnlinePayment: existing.hasOnlinePayment, acceptsQR: existing.acceptsQR,
    } : { category: [], hasDelivery: false, hasOnlinePayment: false, acceptsQR: false },
  })

  const selectedCats = watch('category') ?? []

  const toggleCategory = (key: string) => {
    const curr = selectedCats
    if (curr.includes(key)) setValue('category', curr.filter(c => c !== key), { shouldValidate: true })
    else if (curr.length < 3) setValue('category', [...curr, key], { shouldValidate: true })
  }

  const onSubmit = async (data: BusinessFormValues) => {
    if (!user) return
    setLoading(true)
    try {
      let businessId = existing?.id
      if (!businessId) {
        businessId = await createBusiness(user.id, user.displayName, data)
        toast.success('Negocio creado. Pendiente de aprobación.')
      } else {
        await updateBusiness(businessId, {
          ...data,
          tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
        } as any)
        toast.success('Negocio actualizado correctamente')
      }

      if (logoFiles.length && businessId) {
        setUploadProgress(10)
        const [logoUrl] = await uploadBusinessImages(businessId, user.id, logoFiles, 'logo', p => setUploadProgress(10 + p * 0.3))
        await updateBusiness(businessId, { logo: logoUrl } as any)
      }
      if (coverFiles.length && businessId) {
        setUploadProgress(40)
        const [coverUrl] = await uploadBusinessImages(businessId, user.id, coverFiles, 'cover', p => setUploadProgress(40 + p * 0.3))
        await updateBusiness(businessId, { coverImage: coverUrl } as any)
      }
      if (galleryFiles.length && businessId) {
        setUploadProgress(70)
        const urls = await uploadBusinessImages(businessId, user.id, galleryFiles, 'gallery', p => setUploadProgress(70 + p * 0.3))
        await updateBusiness(businessId, { images: urls } as any)
      }

      router.push('/dashboard/business')
    } catch (e) {
      toast.error('Error al guardar negocio. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )

  const inputCls = 'w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      {/* Información básica */}
      <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
        <h2 className="font-semibold">Información básica</h2>
        <Field label="Nombre del negocio *" error={errors.name?.message}>
          <input {...register('name')} placeholder="Ej: Pastelería Mamá Lucía" className={inputCls} />
        </Field>
        <Field label="Descripción corta / Slogan" error={errors.tagline?.message}>
          <input {...register('tagline')} placeholder="Ej: Los mejores pasteles de la ciudad" className={inputCls} />
        </Field>
        <Field label="Descripción completa *" error={errors.description?.message}>
          <textarea {...register('description')} rows={4} placeholder="Describe tu negocio, qué ofreces, tu historia…" className={`${inputCls} resize-none`} />
        </Field>
      </div>

      {/* Categorías */}
      <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
        <h2 className="font-semibold">Categorías <span className="text-muted-foreground text-sm font-normal">(máx. 3)</span></h2>
        {errors.category && <p className="text-xs text-destructive">{errors.category.message as string}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BUSINESS_CATEGORIES.map(cat => (
            <button type="button" key={cat.key} onClick={() => toggleCategory(cat.key)}
              className={`px-3 py-2 rounded-xl text-sm border transition-all text-left ${selectedCats.includes(cat.key) ? 'bg-primary/10 border-primary text-primary font-medium' : 'border-border hover:bg-accent'}`}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
        <Field label="Etiquetas (separadas por coma)" error={errors.tags?.message}>
          <input {...register('tags')} placeholder="Ej: delivery, tortas personalizadas, pedido anticipado" className={inputCls} />
        </Field>
      </div>

      {/* Contacto */}
      <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
        <h2 className="font-semibold">Contacto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="WhatsApp * (número boliviano)" error={errors.whatsapp?.message}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+591</span>
              <input {...register('whatsapp')} placeholder="70000000" className={`${inputCls} pl-12`} />
            </div>
          </Field>
          <Field label="Teléfono" error={errors.phone?.message}>
            <input {...register('phone')} placeholder="33000000" className={inputCls} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input {...register('email')} type="email" placeholder="negocio@email.com" className={inputCls} />
          </Field>
          <Field label="Instagram (@usuario)" error={errors.instagram?.message}>
            <input {...register('instagram')} placeholder="mi_negocio" className={inputCls} />
          </Field>
          <Field label="Facebook" error={errors.facebook?.message}>
            <input {...register('facebook')} placeholder="Nombre en Facebook" className={inputCls} />
          </Field>
          <Field label="Sitio web" error={errors.website?.message}>
            <input {...register('website')} placeholder="https://minegocio.com" className={inputCls} />
          </Field>
        </div>
      </div>

      {/* Ubicación */}
      <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><MapPin size={16} /> Ubicación</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Zona *" error={errors.zone?.message}>
            <select {...register('zone')} className={inputCls}>
              <option value="">Seleccionar zona…</option>
              {SCZ_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </Field>
          <Field label="Dirección *" error={errors.address?.message}>
            <input {...register('address')} placeholder="Av. Roca y Coronado #123" className={inputCls} />
          </Field>
        </div>
      </div>

      {/* Opciones */}
      <div className="p-5 bg-card border border-border rounded-2xl space-y-3">
        <h2 className="font-semibold">Opciones del negocio</h2>
        {[
          { field: 'hasDelivery' as const, label: '🚚 Ofrece Delivery', desc: 'Entregas a domicilio' },
          { field: 'hasOnlinePayment' as const, label: '💳 Pagos en línea', desc: 'Transferencias, tarjetas' },
          { field: 'acceptsQR' as const, label: '📱 Acepta QR', desc: 'Tigo Money, Simple' },
        ].map(({ field, label, desc }) => (
          <label key={field} className="flex items-center justify-between p-3 bg-muted rounded-xl cursor-pointer hover:bg-accent transition-colors">
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <Controller name={field} control={control} render={({ field: f }) => (
              <div onClick={() => f.onChange(!f.value)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${f.value ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${f.value ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            )} />
          </label>
        ))}
      </div>

      {/* Imágenes */}
      <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
        <h2 className="font-semibold">Imágenes</h2>
        <ImageUpload value={logoFiles} onChange={setLogoFiles} maxFiles={1} label="Logo del negocio (1 imagen)" preview={existing?.logo ? [existing.logo] : []} />
        <ImageUpload value={coverFiles} onChange={setCoverFiles} maxFiles={1} label="Imagen de portada (1 imagen)" preview={existing?.coverImage ? [existing.coverImage] : []} />
        <ImageUpload value={galleryFiles} onChange={setGalleryFiles} maxFiles={5} label="Galería de imágenes (hasta 5)" preview={existing?.images ?? []} />
      </div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div>
          <div className="flex justify-between text-xs mb-1"><span>Subiendo imágenes…</span><span>{uploadProgress}%</span></div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all rounded-full" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all">
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        {loading ? 'Guardando…' : existing ? 'Actualizar negocio' : 'Crear negocio'}
      </button>
    </form>
  )
}
