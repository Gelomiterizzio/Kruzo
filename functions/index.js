/**
 * KRUZO Cloud Functions — server-side aggregation & lifecycle (source of truth).
 *
 * The frontend no longer denormalises counters. These triggers keep the
 * documents consistent:
 *   • onReviewWritten        → reviewCount, rating (avg), ratingDistribution
 *                              + notifies the business owner of new reviews
 *   • onUserFavoritesWritten → favoriteCount
 *   • onBusinessWritten      → links businessIds to the owner, promotes them
 *                              to entrepreneur, notifies on approval
 *
 * Deploy with:  firebase deploy --only functions   (requires the Blaze plan)
 */
const { onDocumentWritten } = require('firebase-functions/v2/firestore')
const { setGlobalOptions } = require('firebase-functions/v2')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { applyReviewDelta, visibleRating } = require('./lib/aggregate')

initializeApp()
const db = getFirestore()
// Co-locate the functions with the Firestore database (and therefore the
// Eventarc trigger) in southamerica-east1 — avoids a cross-region trigger.
setGlobalOptions({ region: 'southamerica-east1', maxInstances: 10 })

/** Creates an in-app notification under users/{uid}/notifications. */
function notify(uid, payload) {
  return db
    .collection(`users/${uid}/notifications`)
    .add({ read: false, createdAt: FieldValue.serverTimestamp(), ...payload })
    .catch(() => {})
}

// Recompute a business's review aggregates whenever one of its reviews is
// created, edited (rating/hidden), or deleted. New reviews also notify the
// business owner.
exports.onReviewWritten = onDocumentWritten('businesses/{businessId}/reviews/{reviewId}', async (event) => {
  const before = event.data && event.data.before.exists ? event.data.before.data() : null
  const after = event.data && event.data.after.exists ? event.data.after.data() : null
  const beforeRating = visibleRating(before)
  const afterRating = visibleRating(after)
  if (beforeRating === afterRating) return // visible rating unchanged → nothing to do

  const bizRef = db.doc(`businesses/${event.params.businessId}`)
  let ownerId = null
  let businessName = ''
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(bizRef)
    if (!snap.exists) return
    ownerId = snap.get('ownerId') || null
    businessName = snap.get('name') || ''
    const agg = applyReviewDelta(snap.get('ratingDistribution'), beforeRating, afterRating)
    tx.update(bizRef, { ...agg, updatedAt: FieldValue.serverTimestamp() })
  })

  // Notify the owner about brand-new visible reviews (not edits/deletions,
  // and never about reviewing their own business).
  if (!before && after && !after.isHidden && ownerId && ownerId !== after.userId) {
    await notify(ownerId, {
      type: 'review',
      title: 'Nueva reseña',
      body: `${after.userName || 'Alguien'} calificó ${businessName || 'tu negocio'} con ${after.rating}★`,
      businessId: event.params.businessId,
    })
  }
})

// Clients only edit their own users/{uid}.favoriteIds. Keep each affected
// business's favoriteCount in sync from the diff.
exports.onUserFavoritesWritten = onDocumentWritten('users/{uid}', async (event) => {
  const before = (event.data && event.data.before.exists ? event.data.before.data().favoriteIds : null) || []
  const after = (event.data && event.data.after.exists ? event.data.after.data().favoriteIds : null) || []
  const beforeSet = new Set(before)
  const afterSet = new Set(after)
  const added = after.filter((id) => !beforeSet.has(id))
  const removed = before.filter((id) => !afterSet.has(id))
  if (added.length === 0 && removed.length === 0) return

  await Promise.all([
    ...added.map((id) => db.doc(`businesses/${id}`).update({ favoriteCount: FieldValue.increment(1) }).catch(() => {})),
    ...removed.map((id) => db.doc(`businesses/${id}`).update({ favoriteCount: FieldValue.increment(-1) }).catch(() => {})),
  ])
})

// Business lifecycle: on create, link the business to its owner (the client
// does the same arrayUnion — both are idempotent) and promote plain users to
// entrepreneur so role-gated UI lights up. On approval (pending → active),
// notify the owner.
exports.onBusinessWritten = onDocumentWritten('businesses/{businessId}', async (event) => {
  const before = event.data && event.data.before.exists ? event.data.before.data() : null
  const after = event.data && event.data.after.exists ? event.data.after.data() : null

  // ── Created ──
  if (!before && after && after.ownerId) {
    const userRef = db.doc(`users/${after.ownerId}`)
    await db
      .runTransaction(async (tx) => {
        const snap = await tx.get(userRef)
        if (!snap.exists) return
        const update = { businessIds: FieldValue.arrayUnion(event.params.businessId) }
        if ((snap.get('role') || 'user') === 'user') update.role = 'entrepreneur'
        tx.update(userRef, update)
      })
      .catch(() => {})
    return
  }

  // ── Approved (pending → active) ──
  if (before && after && before.status === 'pending' && after.status === 'active' && after.ownerId) {
    await notify(after.ownerId, {
      type: 'business_approved',
      title: '¡Negocio aprobado!',
      body: `${after.name || 'Tu negocio'} ya está visible en KRUZO.`,
      businessId: event.params.businessId,
    })
  }
})
