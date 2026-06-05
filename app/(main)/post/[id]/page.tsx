import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Post } from '@/lib/types/post'
import Image from 'next/image'
import Link from 'next/link'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'
import { formatPrice, formatRelativeTime } from '@/lib/utils/formatters'
import { ArrowLeft, Tag, Truck } from 'lucide-react'

// ── Next.js 16: params is now a Promise ──────────────────────────────────────
interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const snap = await getDoc(doc(db, 'posts', id))
  if (!snap.exists()) return { title: 'Publicación no encontrada | KRUZO' }
  const post = snap.data() as Post
  return {
    title: `${post.title} | KRUZO`,
    description: post.description,
    openGraph: { images: post.images[0] ? [post.images[0]] : [] },
  }
}

export default async function PostPage({ params }: Props) {
  const { id } = await params
  const snap = await getDoc(doc(db, 'posts', id))
  if (!snap.exists()) notFound()
  const post = { id: snap.id, ...snap.data() } as Post
  if (post.status === 'deleted') notFound()

  return (
    <div className="container max-w-3xl pt-20 pb-16 space-y-6">
      <Link
        href={`/business/${post.businessSlug}`}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> {post.businessName}
      </Link>

      {/* Images */}
      {post.images.length > 0 && (
        <div className="relative aspect-square md:aspect-video rounded-2xl overflow-hidden bg-muted">
          <Image
            src={post.images[0]}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width:768px) 100vw, 768px"
          />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-display font-bold">{post.title}</h1>
            <div className="text-right shrink-0">
              <div className="text-xl font-bold text-primary">
                {post.priceType === 'consult'
                  ? 'Consultar'
                  : post.priceType === 'free'
                  ? 'Gratis'
                  : formatPrice(post.price)}
              </div>
              {post.originalPrice && post.originalPrice > post.price && (
                <div className="text-sm text-muted-foreground line-through">
                  {formatPrice(post.originalPrice)}
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {formatRelativeTime(post.createdAt)}
          </p>
        </div>

        <p className="text-foreground/80 leading-relaxed">{post.description}</p>

        <div className="flex flex-wrap gap-2">
          {post.tags?.map((t) => (
            <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-muted rounded-full text-xs">
              <Tag size={10} /> {t}
            </span>
          ))}
          {post.hasDelivery && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full text-xs">
              <Truck size={10} /> Delivery{' '}
              {post.deliveryPrice > 0 ? `Bs. ${post.deliveryPrice}` : 'gratis'}
            </span>
          )}
        </div>

        <div className="p-4 bg-card border border-border rounded-2xl flex items-center gap-3">
          {post.businessLogo && (
            <Image
              src={post.businessLogo}
              alt=""
              width={44}
              height={44}
              className="rounded-xl object-cover"
            />
          )}
          <div className="flex-1">
            <Link
              href={`/business/${post.businessSlug}`}
              className="font-semibold hover:text-primary transition-colors"
            >
              {post.businessName}
            </Link>
            <p className="text-xs text-muted-foreground">Ver perfil completo →</p>
          </div>
        </div>

        <WhatsAppButton
          phone={post.whatsapp}
          businessName={post.businessName}
          postTitle={post.title}
          price={post.price}
          size="lg"
          className="w-full"
        />
      </div>
    </div>
  )
}
