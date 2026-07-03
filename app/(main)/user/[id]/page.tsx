import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getPublicUserProfile } from '@/lib/firebase/admin'
import { getInitials, formatDate } from '@/lib/utils/formatters'
import { BadgeCheck, CalendarDays, Store } from 'lucide-react'

// Public profiles are served by the Admin SDK through an explicit projection
// (getPublicUserProfile): the users collection itself is private and its
// Firestore rules deny client reads of other people's documents. This page can
// therefore never leak email/phone/preferences — those fields never reach it.

// ── Next.js 16: params is now a Promise ──────────────────────────────────────
interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const profile = await getPublicUserProfile(id)
  if (!profile) return { title: 'Usuario no encontrado' }
  return {
    title: profile.displayName || 'Perfil',
    description: profile.bio || `Perfil de ${profile.displayName} en KRUZO`,
    alternates: { canonical: `/user/${id}` },
  }
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params
  const profile = await getPublicUserProfile(id)
  if (!profile) notFound()

  return (
    <div className="container max-w-2xl pt-20 pb-16 space-y-6">
      <div className="p-6 bg-card border border-border rounded-2xl">
        <div className="flex items-start gap-4">
          {profile.photoURL ? (
            <Image
              src={profile.photoURL}
              alt={`Foto de perfil de ${profile.displayName}`}
              width={80}
              height={80}
              className="w-20 h-20 rounded-2xl object-cover shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold shrink-0">
              {getInitials(profile.displayName || 'U')}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-display font-bold">{profile.displayName}</h1>
              {profile.isVerified && <BadgeCheck size={18} className="text-blue-500" aria-label="Perfil verificado" />}
            </div>
            {profile.location && (
              <p className="text-sm text-muted-foreground mt-0.5">📍 {profile.location}</p>
            )}
            {profile.bio && (
              <p className="text-sm mt-2 leading-relaxed">{profile.bio}</p>
            )}
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
              {profile.createdAt && (
                <span className="flex items-center gap-1">
                  <CalendarDays size={12} /> Desde {formatDate(profile.createdAt)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Store size={12} /> {profile.businessCount} {profile.businessCount === 1 ? 'negocio' : 'negocios'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
