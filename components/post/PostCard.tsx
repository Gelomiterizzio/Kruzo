'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, Truck } from 'lucide-react'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'
import { formatPrice, formatNumber } from '@/lib/utils/formatters'
import type { Post } from '@/lib/types/post'

interface Props { post: Post; index?: number }

export function PostCard({ post, index = 0 }: Props) {
  const hasDiscount = post.originalPrice && post.originalPrice > post.price
  const discountPct = hasDiscount ? Math.round((1 - post.price / post.originalPrice!) * 100) : 0

  return (
    <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="group bg-card border border-border rounded-2xl overflow-hidden card-hover flex flex-col">
      {/* Image */}
      <Link href={`/post/${post.id}`} className="relative h-44 bg-muted overflow-hidden shrink-0">
        {post.images[0] ? (
          <Image src={post.images[0]} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 50vw, 33vw" />
        ) : (
          <div className="h-full flex items-center justify-center text-4xl">📦</div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-md">-{discountPct}%</span>}
          {!post.inStock && <span className="px-1.5 py-0.5 bg-black/70 text-white text-xs rounded-md">Agotado</span>}
        </div>
        {post.hasDelivery && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-background/80 backdrop-blur-sm rounded-md text-xs flex items-center gap-1">
            <Truck size={10} /> Delivery
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 space-y-2">
        <div>
          <Link href={`/post/${post.id}`}><h3 className="text-sm font-semibold line-clamp-2 hover:text-primary transition-colors">{post.title}</h3></Link>
          <Link href={`/business/${post.businessSlug}`} className="text-xs text-muted-foreground hover:text-foreground mt-0.5 block truncate">📍 {post.businessName}</Link>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className={`font-bold text-base ${post.price === 0 ? 'text-green-600' : 'text-foreground'}`}>
            {post.priceType === 'consult' ? 'Consultar' : post.priceType === 'free' ? 'Gratis' : formatPrice(post.price)}
          </span>
          {hasDiscount && <span className="text-xs text-muted-foreground line-through">{formatPrice(post.originalPrice!)}</span>}
          {post.priceType === 'negotiable' && <span className="text-xs text-muted-foreground italic">Negociable</span>}
        </div>

        {/* Stats — views are the only counter the platform actually tracks */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
          <span className="flex items-center gap-1"><Eye size={11} /> {formatNumber(post.viewCount)}</span>
        </div>

        <WhatsAppButton phone={post.whatsapp} businessName={post.businessName} postTitle={post.title} price={post.price} size="sm" className="w-full" />
      </div>
    </motion.article>
  )
}
