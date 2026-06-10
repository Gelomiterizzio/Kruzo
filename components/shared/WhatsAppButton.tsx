'use client'
import { MessageCircle } from 'lucide-react'
import { buildWhatsAppContactURL, buildWhatsAppPostURL } from '@/lib/utils/whatsapp'
import { cn } from '@/lib/utils/cn'

interface WAButtonProps {
  phone: string
  businessName: string
  postTitle?: string
  price?: number
  variant?: 'default' | 'outline' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

export function WhatsAppButton({ phone, businessName, postTitle, price, variant = 'default', size = 'md', className, label }: WAButtonProps) {
  const url = postTitle
    ? buildWhatsAppPostURL(phone, businessName, postTitle, price)
    : buildWhatsAppContactURL(phone, businessName)

  const sizeClasses = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' }
  const iconSize = { sm: 14, md: 16, lg: 18 }

  if (variant === 'icon') return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className={cn('p-2 rounded-xl bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white transition-all', className)}
      aria-label="Contactar por WhatsApp">
      <MessageCircle size={iconSize[size]} />
    </a>
  )

  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className={cn(
        'flex items-center justify-center gap-2 rounded-xl font-medium transition-all',
        sizeClasses[size],
        variant === 'default' ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm hover:shadow-green-200 dark:hover:shadow-green-900' :
          'border border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950',
        className
      )}>
      <MessageCircle size={iconSize[size]} />
      {label ?? 'WhatsApp'}
    </a>
  )
}
