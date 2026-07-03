import { NextResponse, type NextRequest } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { adminAuth, adminDb, getSessionUser } from '@/lib/firebase/admin'

// firebase-admin needs the Node.js runtime (not Edge).
export const runtime = 'nodejs'

/**
 * POST { uid, banned, reason? } — bans/unbans a user. Admin-only.
 *
 * Runs on the server (instead of a client-side updateDoc) so that banning also
 * REVOKES the user's refresh tokens: their session cookie and ID tokens stop
 * verifying within minutes instead of surviving until natural expiry. Firestore
 * rules already block a banned user's writes immediately; this closes the
 * remaining read/session window.
 */
export async function POST(req: NextRequest) {
  const session = await getSessionUser()
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const uid = typeof body?.uid === 'string' ? body.uid : ''
  const banned = body?.banned === true
  const reason = typeof body?.reason === 'string' ? body.reason.slice(0, 500) : ''

  if (!uid) {
    return NextResponse.json({ error: 'uid requerido' }, { status: 400 })
  }
  if (uid === session.uid) {
    return NextResponse.json({ error: 'No puedes suspender tu propia cuenta' }, { status: 400 })
  }

  try {
    await adminDb().collection('users').doc(uid).update({
      isBanned: banned,
      banReason: banned ? reason : '',
      updatedAt: FieldValue.serverTimestamp(),
    })
    if (banned) {
      // Invalidate every active session: existing session cookies fail the
      // next verifySessionCookie(…, true) check and ID tokens stop refreshing.
      await adminAuth().revokeRefreshTokens(uid)
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'No se pudo actualizar el usuario' }, { status: 500 })
  }
}
