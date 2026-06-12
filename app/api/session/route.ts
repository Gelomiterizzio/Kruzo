import { NextResponse, type NextRequest } from 'next/server'
import { adminAuth, adminDb, SESSION_COOKIE } from '@/lib/firebase/admin'

// firebase-admin needs the Node.js runtime (not Edge).
export const runtime = 'nodejs'

// Firebase session cookies last up to 14 days; we use 5.
const EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000

/**
 * POST { idToken } — verifies a freshly-issued Firebase ID token and mints an
 * httpOnly session cookie. Called by the client right after sign-in.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const idToken = body?.idToken
    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'idToken requerido' }, { status: 400 })
    }

    // Validates signature, expiry and issuer before trusting the token.
    const decoded = await adminAuth().verifyIdToken(idToken)

    // Banned accounts never get a server session.
    const userSnap = await adminDb().collection('users').doc(decoded.uid).get()
    if (userSnap.exists && userSnap.data()?.isBanned === true) {
      return NextResponse.json({ error: 'Cuenta suspendida' }, { status: 403 })
    }

    const sessionCookie = await adminAuth().createSessionCookie(idToken, {
      expiresIn: EXPIRES_IN_MS,
    })

    const res = NextResponse.json({ ok: true })
    res.cookies.set(SESSION_COOKIE, sessionCookie, {
      maxAge: EXPIRES_IN_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })
    return res
  } catch {
    return NextResponse.json({ error: 'No se pudo crear la sesión' }, { status: 401 })
  }
}

/** DELETE — clears the session cookie on sign-out. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, '', { maxAge: 0, path: '/' })
  return res
}
