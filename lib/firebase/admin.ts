import { initializeApp, getApps, getApp, cert, type App, type ServiceAccount } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
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
