'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Upload, ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ImageUploadProps {
  value: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
  maxSizeMB?: number
  preview?: string[]
  className?: string
  label?: string
}

export function ImageUpload({ value, onChange, maxFiles = 5, maxSizeMB = 5, preview = [], className, label }: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>(preview)

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = [...value, ...accepted].slice(0, maxFiles)
    onChange(newFiles)
    const newPreviews = newFiles.map(f => URL.createObjectURL(f))
    setPreviews(newPreviews)
  }, [value, onChange, maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: maxFiles - value.length,
    maxSize: maxSizeMB * 1024 * 1024,
  })

  const removeFile = (idx: number) => {
    const newFiles = value.filter((_, i) => i !== idx)
    onChange(newFiles)
    setPreviews(prev => prev.filter((_, i) => i !== idx))
  }

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
      </div>
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removeFile(i)}
                className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={12} />
              </button>
              {i === 0 && <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">Principal</span>}
            </div>
          ))}
          {previews.length < maxFiles && (
            <div {...getRootProps()} className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <ImagePlus size={24} className="text-muted-foreground" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
