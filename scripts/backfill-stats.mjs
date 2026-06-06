/**
 * One-time backfill so EXISTING data matches the new Cloud-Function-maintained
 * aggregates. Run once after deploying functions + rules:
 *   node scripts/backfill-stats.mjs
 *
 * Recomputes, from the real documents:
 *   • each business: ratingDistribution, reviewCount, rating (from its reviews)
 *   • each business: favoriteCount (from users' favoriteIds)
 *
 * Uses the Admin SDK (same env as the app). Safe to re-run (idempotent).
 */
import nextEnv from '@next/env'
nextEnv.loadEnvConfig(process.cwd())
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function resolveCredentials() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (raw) { const j = JSON.parse(raw); return { projectId: j.project_id, clientEmail: j.client_email, privateKey: j.private_key?.replace(/\\n/g, '\n') } }
  return {
    projectId: process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }
}

const db = getFirestore(getApps().length ? getApps()[0] : initializeApp({ credential: cert(resolveCredentials()) }))
const STARS = [1, 2, 3, 4, 5]

const businesses = await db.collection('businesses').get()
console.log(`Backfilling ${businesses.size} businesses…`)

// 1) Review aggregates per business
for (const biz of businesses.docs) {
  const reviews = await biz.ref.collection('reviews').get()
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const rv of reviews.docs) {
    const d = rv.data()
    if (d.isHidden === true) continue
    const r = Number(d.rating)
    if (STARS.includes(r)) dist[r]++
  }
  const total = STARS.reduce((a, s) => a + dist[s], 0)
  const sum = STARS.reduce((a, s) => a + s * dist[s], 0)
  const rating = total > 0 ? Math.round((sum / total) * 10) / 10 : 0
  await biz.ref.update({ ratingDistribution: dist, reviewCount: total, rating })
}

// 2) favoriteCount per business (from users' favoriteIds)
const favCounts = {}
const users = await db.collection('users').get()
for (const u of users.docs) for (const id of (u.data().favoriteIds || [])) favCounts[id] = (favCounts[id] || 0) + 1
await Promise.all(
  businesses.docs.map((biz) => biz.ref.update({ favoriteCount: favCounts[biz.id] || 0 }).catch(() => {})),
)

console.log('Backfill complete.')
process.exit(0)
