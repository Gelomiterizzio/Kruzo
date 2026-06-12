'use client'
import { useEffect, useMemo, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Upload, ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ImageUploadProps {
  value: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
  maxSizeMB?: number
  /** Existing remote image URLs — shown until new files are selected. */
  preview?: string[]
  className?: string
  label?: string
}

export function ImageUpload({ value, onChange, maxFiles = 5, maxSizeMB = 5, preview = [], className, label }: ImageUploadProps) {
  // Previews derive 1:1 from the selected files, so remove-by-index always
  // stays aligned. Object URLs are revoked when files change/unmount.
  const filePreviews = useMemo(() => value.map(f => URL.createObjectURL(f)), [value])
  useEffect(() => () => { filePreviews.forEach(u => URL.revokeObjectURL(u)) }, [filePreviews])

  const showingExisting = value.length === 0 && preview.length > 0
  const shown = showingExisting ? preview : filePreviews

  const onDrop = useCallback((accepted: File[]) => {
    onChange([...value, ...accepted].slice(0, maxFiles))
  }, [value, onChange, maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: maxFiles - value.length,
    maxSize: maxSizeMB * 1024 * 1024,
  })

  const removeFile = (idx: number) => onChange(value.filter((_, i) => i !== idx))

  return (
    <div className={cn('space-y-3', className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      <div {...getRootProps()} className={cn(
        'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
        isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50',
        value.length >= maxFiles && 'opacity-50 pointer-events-none'
      )}>
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-2 text-muted-foreground" size={24} />
        <p className="text-sm font-medium">
          {isDragActive ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic para seleccionar'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          JPG, PNG, WEBP · Máx. {maxSizeMB}MB · Hasta {maxFiles} imágenes
        </p>
        {showingExisting && (
          <p className="text-xs text-muted-foreground mt-1">Selecciona nuevas imágenes para reemplazar las actuales</p>
        )}
      </div>
      {shown.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {shown.map((src, i) => (
            <div key={`${src.slice(-24)}-${i}`} className="relative aspect-square rounded-xl overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element -- blob/object URLs aren't supported by next/image */}
              <img src={src} alt="" className="w-full h-full object-cover" />
              {!showingExisting && (
                <button type="button" onClick={() => removeFile(i)} aria-label="Quitar imagen"
                  className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={12} />
                </button>
              )}
              {i === 0 && <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">Principal</span>}
            </div>
          ))}
          {!showingExisting && value.length < maxFiles && (
            <div {...getRootProps()} className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <ImagePlus size={24} className="text-muted-foreground" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
