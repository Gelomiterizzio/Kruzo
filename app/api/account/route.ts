import { NextResponse } from 'next/server'
import { adminAuth, adminDb, getSessionUser, SESSION_COOKIE } from '@/lib/firebase/admin'

// firebase-admin needs the Node.js runtime (not Edge).
export const runtime = 'nodejs'

/**
 * DELETE — permanently deletes the signed-in user's account:
 * Auth user + Firestore profile; their businesses are suspended (not deleted)
 * so reviews/posts don't dangle publicly under an orphaned active listing.
 */
export async function DELETE() {
  const session = await getSessionUser()
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const db = adminDb()

    // Suspend any businesses owned by the account.
    const owned = await db.collection('businesses').where('ownerId', '==', session.uid).get()
    if (!owned.empty) {
      const batch = db.batch()
      owned.docs.forEach((d) => batch.update(d.ref, { status: 'suspended' }))
      await batch.commit()
    }

    await db.collection('users').doc(session.uid).delete()
    await adminAuth().deleteUser(session.uid)

    const res = NextResponse.json({ ok: true })
    res.cookies.set(SESSION_COOKIE, '', { maxAge: 0, path: '/' })
    return res
  } catch {
    return NextResponse.json({ error: 'No se pudo eliminar la cuenta' }, { status: 500 })
  }
}
