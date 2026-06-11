import { NextResponse } from 'next/server'
import { adminAuth, adminDb, getSessionUser, SESSION_COOKIE } from '@/lib/firebase/admin'

// firebase-admin needs the Node.js runtime (not Edge).
export const runtime = 'nodejs'

/**
 * DELETE — permanently deletes the signed-in user's account:
 * Auth user + Firestore profile. Their businesses are suspended and their
 * posts soft-deleted so no orphaned content stays publicly visible or
 * searchable after the owner is gone.
 */
export async function DELETE() {
  const session = await getSessionUser()
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const db = adminDb()

    // Take the account's content offline: businesses suspended, posts deleted.
    const [ownedBiz, ownedPosts] = await Promise.all([
      db.collection('businesses').where('ownerId', '==', session.uid).get(),
      db.collection('posts').where('ownerId', '==', session.uid).get(),
    ])
    if (!ownedBiz.empty || !ownedPosts.empty) {
      const batch = db.batch()
      ownedBiz.docs.forEach((d) => batch.update(d.ref, { status: 'suspended' }))
      ownedPosts.docs.forEach((d) => batch.update(d.ref, { status: 'deleted' }))
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
