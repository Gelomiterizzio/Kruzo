/**
 * One-off migration: collapse the legacy 'entrepreneur' role into 'user'.
 *
 * Owning a business is now a *resource* on the account (`businessIds`), not a
 * role. This backfills existing data so no user is left with the removed role.
 *
 * Run once, after deploying the new code + Cloud Functions:
 *   FIREBASE_SERVICE_ACCOUNT_KEY='<service-account-json>' \
 *     node scripts/migrate-roles-to-user-admin.mjs
 *
 * Safe to re-run: idempotent (only touches role === 'entrepreneur'). Admins and
 * plain users are never modified. Add --dry to preview without writing.
 */
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const DRY = process.argv.includes('--dry')

const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
if (!key) {
  console.error('✗ Falta FIREBASE_SERVICE_ACCOUNT_KEY (JSON de la service account).')
  process.exit(1)
}

initializeApp({ credential: cert(JSON.parse(key)) })
const db = getFirestore()

const snap = await db.collection('users').where('role', '==', 'entrepreneur').get()
console.log(`Encontrados ${snap.size} usuario(s) con role 'entrepreneur'.`)

if (DRY) {
  snap.docs.forEach((d) => console.log(`  [dry] ${d.id} → user`))
  console.log('Modo --dry: no se escribió nada.')
  process.exit(0)
}

let migrated = 0
let batch = db.batch()
let inBatch = 0
for (const d of snap.docs) {
  batch.update(d.ref, { role: 'user' })
  migrated++; inBatch++
  if (inBatch >= 400) { await batch.commit(); batch = db.batch(); inBatch = 0 }
}
if (inBatch > 0) await batch.commit()

console.log(`✓ Migrados ${migrated} usuario(s) a role 'user'.`)
process.exit(0)
