import { NextResponse } from 'next/server'
import { adminAuth, adminDb, getSessionUser, SESSION_COOKIE } from '@/lib/firebase/admin'

// firebase-admin needs the Node.js runtime (not Edge).
export const runtime = 'nodejs'

/**
 * DELETE — permanently deletes the signed-in user's account, with the exact
 * semantics the privacy policy (§10) promises and in parity with the
 * `deleteAccount` callable the mobile app uses:
 *   • owned businesses (recursively, including their reviews/subcollections)
 *   • owned posts
 *   • reviews the user wrote on other businesses (aggregates recalculate via
 *     the onReviewWritten Cloud Function)
 *   • the user document + subcollections (notifications, …)
 *   • the Auth account itself
 *
 * Each cleanup step is isolated so a per-resource failure never leaves the
 * Auth account behind — removing access is what the user relies on.
 */
export async function DELETE() {
  const session = await getSessionUser()
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  const uid = session.uid
  const db = adminDb()

  // 1. Businesses owned by the user — recursiveDelete also clears their
  //    reviews and any other subcollections.
  try {
    const businesses = await db.collection('businesses').where('ownerId', '==', uid).get()
    for (const biz of businesses.docs) {
      await db.recursiveDelete(biz.ref).catch(() => {})
    }
  } catch { /* isolated: continue with the rest of the cleanup */ }

  // 2. Posts owned by the user.
  try {
    const posts = await db.collection('posts').where('ownerId', '==', uid).get()
    await Promise.all(posts.docs.map((d) => d.ref.delete().catch(() => {})))
  } catch { /* isolated */ }

  // 3. Reviews the user authored on OTHER businesses (own-business reviews
  //    went with step 1). Uses the reviews.userId COLLECTION_GROUP index.
  try {
    const reviews = await db.collectionGroup('reviews').where('userId', '==', uid).get()
    await Promise.all(reviews.docs.map((d) => d.ref.delete().catch(() => {})))
  } catch { /* isolated */ }

  // 4. The user document + its subcollections (notifications, …). Clearing it
  //    also lets onUserFavoritesWritten decrement favoriteCount everywhere.
  await db.recursiveDelete(db.doc(`users/${uid}`)).catch(() => {})

  // 5. Finally the Auth account — the critical step. If THIS fails the user
  //    must know their account was not removed.
  try {
    await adminAuth().deleteUser(uid)
  } catch {
    return NextResponse.json({ error: 'No se pudo eliminar la cuenta' }, { status: 500 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, '', { maxAge: 0, path: '/' })
  return res
}
