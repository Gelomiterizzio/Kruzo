import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { AppUser } from '@/lib/types/user'
import { getInitials, formatDate } from '@/lib/utils/formatters'
import { BadgeCheck, CalendarDays, Store, Star } from 'lucide-react'

// ── Next.js 16: params is now a Promise ──────────────────────────────────────
interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const snap = await getDoc(doc(db, 'users', id))
  if (!snap.exists()) return { title: 'Usuario no encontrado | KRUZO' }
  const u = snap.data() as AppUser
  return {
    title: `${u.displayName} | KRUZO`,
    description: u.bio || `Perfil de ${u.displayName} en KRUZO`,
  }
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params
  let user: AppUser | null = null
  try {
    const snap = await getDoc(doc(db, 'users', id))
    if (snap.exists()) user = { id: snap.id, ...snap.data() } as AppUser
  } catch {}
  if (!user || user.isBanned) notFound()

  return (
    <div className="container max-w-2xl pt-20 pb-16 space-y-6">
      <div className="p-6 bg-card border border-border rounded-2xl">
        <div className="flex items-start gap-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="w-20 h-20 rounded-2xl object-cover shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold shrink-0">
              {getInitials(user.displayName)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-display font-bold">{user.displayName}</h1>
              {user.isVerified && <BadgeCheck size={18} className="text-blue-500" />}
            </div>
            {user.location && (
              <p className="text-sm text-muted-foreground mt-0.5">📍 {user.location}</p>
            )}
            {user.bio && (
              <p className="text-sm mt-2 leading-relaxed">{user.bio}</p>
            )}
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <CalendarDays size={12} /> Desde {formatDate(user.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Store size={12} /> {user.businessIds?.length ?? 0} negocios
              </span>
              <span className="flex items-center gap-1">
                <Star size={12} /> {user.reviewCount ?? 0} reseñas
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
