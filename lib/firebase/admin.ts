import { initializeApp, getApps, getApp, cert, type App, type ServiceAccount } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue, type Timestamp } from 'firebase-admin/firestore'
import { cookies } from 'next/headers'

// ─────────────────────────────────────────────────────────────────────────────
// Firebase Admin SDK — SERVER ONLY.
// Powers production session cookies (POST /api/session) and server-side role
// checks (e.g. the /admin layout). Never import this from a client component.
//
// Requires a service account, provided via EITHER:
//   • FIREBASE_SERVICE_ACCOUNT_KEY  → full JSON string (recommended on Vercel), OR
//   • FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
// ─────────────────────────────────────────────────────────────────────────────

export const SESSION_COOKIE = 'kruzo-session'

function resolveCredentials(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (raw) {
    let json: Record<string, string>
    try {
      json = JSON.parse(raw)
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY no es un JSON válido.')
    }
    return {
      projectId: json.project_id,
      clientEmail: json.client_email,
      privateKey: json.private_key?.replace(/\\n/g, '\n'),
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey }
  }
  return null
}

function getAdminApp(): App {
  if (getApps().length) return getApp()
  const credentials = resolveCredentials()
  if (!credentials) {
    throw new Error(
      'Firebase Admin no está configurado. Define FIREBASE_SERVICE_ACCOUNT_KEY ' +
        'o FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY.'
    )
  }
  return initializeApp({ credential: cert(credentials) })
}

export const adminAuth = () => getAuth(getAdminApp())
export const adminDb = () => getFirestore(getAdminApp())

export interface SessionUser {
  uid: string
  role: string
}

/**
 * Reads and verifies the `kruzo-session` cookie. Returns the authenticated user
 * and their Firestore role, or null if there is no valid session (or Admin is
 * not configured — in which case access is denied by default).
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const store = await cookies()
    const session = store.get(SESSION_COOKIE)?.value
    if (!session) return null

    const decoded = await adminAuth().verifySessionCookie(session, true)
    const snap = await adminDb().collection('users').doc(decoded.uid).get()
    const role = (snap.exists ? (snap.data()?.role as string | undefined) : undefined) ?? 'user'
    return { uid: decoded.uid, role }
  } catch {
    return null
  }
}

/**
 * Increments a business view counter from the server using the Admin SDK.
 * The previous client-SDK call ran unauthenticated on the server and was
 * rejected by Firestore rules, so views never counted. Admin writes bypass
 * rules; failures are swallowed so a counter never blocks page rendering.
 */
export async function incrementBusinessView(businessId: string): Promise<void> {
  try {
    await adminDb().collection('businesses').doc(businessId).update({
      viewCount: FieldValue.increment(1),
    })
  } catch {
    /* non-fatal */
  }
}

// ─── Public user profiles ─────────────────────────────────────────────────────
// The users collection is PRIVATE (email, phone, notification preferences…)
// and its Firestore rules only allow the owner/admins to read it. Public
// profile pages therefore go through this explicit server-side projection:
// only the fields listed here can ever reach a public page.

export interface PublicUserProfile {
  id: string
  displayName: string
  photoURL: string
  bio: string
  location: string
  isVerified: boolean
  businessCount: number
  createdAt: Timestamp | null
}

/**
 * Returns the PUBLIC subset of a user profile, or null when the user does not
 * exist, is banned, or the Admin SDK is not configured. Never returns private
 * fields (email, phone, favorites, notification settings, ban details…).
 */
export async function getPublicUserProfile(uid: string): Promise<PublicUserProfile | null> {
  try {
    const snap = await adminDb().collection('users').doc(uid).get()
    if (!snap.exists) return null
    const d = snap.data() ?? {}
    if (d.isBanned === true) return null
    return {
      id: snap.id,
      displayName: (d.displayName as string) || '',
      photoURL: (d.photoURL as string) || '',
      bio: (d.bio as string) || '',
      location: (d.location as string) || '',
      isVerified: d.isVerified === true,
      businessCount: Array.isArray(d.businessIds) ? d.businessIds.length : 0,
      createdAt: (d.createdAt as Timestamp | undefined) ?? null,
    }
  } catch {
    return null
  }
}

export interface PublicStats {
  activeBusinesses: number
  users: number
}

/**
 * Real platform-wide counts for public marketing surfaces (home hero).
 * Returns null when the Admin SDK isn't configured (e.g. CI builds) so the
 * caller can degrade gracefully instead of showing invented numbers.
 */
export async function getPublicStats(): Promise<PublicStats | null> {
  try {
    const db = adminDb()
    const [biz, users] = await Promise.all([
      db.collection('businesses').where('status', '==', 'active').count().get(),
      db.collection('users').count().get(),
    ])
    return { activeBusinesses: biz.data().count, users: users.data().count }
  } catch {
    return null
  }
}

/** Same as above, for post detail views (feeds the owner's real analytics). */
export async function incrementPostView(postId: string): Promise<void> {
  try {
    await adminDb().collection('posts').doc(postId).update({
      viewCount: FieldValue.increment(1),
    })
  } catch {
    /* non-fatal */
  }
}
