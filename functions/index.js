/**
 * KRUZO Cloud Functions — server-side aggregation (source of truth).
 *
 * The frontend no longer denormalises counters. These triggers keep the
 * business documents consistent:
 *   • onReviewWritten        → reviewCount, rating (avg), ratingDistribution
 *   • onUserFavoritesWritten → favoriteCount
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

// Recompute a business's review aggregates whenever one of its reviews is
// created, edited (rating/hidden), or deleted.
exports.onReviewWritten = onDocumentWritten('businesses/{businessId}/reviews/{reviewId}', async (event) => {
  const before = event.data && event.data.before.exists ? event.data.before.data() : null
  const after = event.data && event.data.after.exists ? event.data.after.data() : null
  const beforeRating = visibleRating(before)
  const afterRating = visibleRating(after)
  if (beforeRating === afterRating) return // visible rating unchanged → nothing to do

  const bizRef = db.doc(`businesses/${event.params.businessId}`)
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(bizRef)
    if (!snap.exists) return
    const agg = applyReviewDelta(snap.get('ratingDistribution'), beforeRating, afterRating)
    tx.update(bizRef, { ...agg, updatedAt: FieldValue.serverTimestamp() })
  })
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
