/**
 * KRUZO — Firestore security-rules test suite.
 *
 * Runs against the Firestore EMULATOR with the real `firestore.rules`:
 *   npm run test:rules
 * (wraps `firebase emulators:exec --only firestore -- node scripts/test-rules.mjs`)
 *
 * Every case asserts either that a LEGITIMATE operation succeeds or that an
 * ILLEGITIMATE one is denied — covering the privilege-escalation fixes
 * (role/ban/verify), business/post moderation locks, review integrity
 * (ownerReply forgery), reports, contact messages and notifications.
 */
import { readFileSync } from 'node:fs'
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing'
import {
  doc, setDoc, getDoc, updateDoc, arrayUnion,
} from 'firebase/firestore'

const testEnv = await initializeTestEnvironment({
  projectId: 'demo-kruzo-rules',
  firestore: { rules: readFileSync('firestore.rules', 'utf8') },
})

// ── Seed data (written with rules disabled — simulates pre-existing state) ──
await testEnv.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore()
  const base = { isBanned: false, isVerified: false, favoriteIds: [], businessIds: [] }
  await setDoc(doc(db, 'users/alice'),   { ...base, role: 'user',  displayName: 'Alice' })
  await setDoc(doc(db, 'users/bob'),     { ...base, role: 'user',  displayName: 'Bob' })
  await setDoc(doc(db, 'users/admin'),   { ...base, role: 'admin', displayName: 'Admin' })
  await setDoc(doc(db, 'users/mallory'), { ...base, role: 'user',  isBanned: true, displayName: 'Mallory' })

  await setDoc(doc(db, 'businesses/biz-alice'), {
    ownerId: 'alice', name: 'Alice Biz', status: 'active',
    isFeatured: false, isVerified: false, plan: 'free',
    rating: 0, reviewCount: 0, viewCount: 5, favoriteCount: 0,
    createdAt: new Date('2026-01-01'),
  })
  await setDoc(doc(db, 'businesses/biz-alice-pending'), {
    ownerId: 'alice', name: 'Alice Pending', status: 'pending',
    isFeatured: false, isVerified: false, createdAt: new Date('2026-01-01'),
  })
  await setDoc(doc(db, 'businesses/biz-bob'), {
    ownerId: 'bob', name: 'Bob Biz', status: 'active',
    isFeatured: false, isVerified: false, createdAt: new Date('2026-01-01'),
  })

  await setDoc(doc(db, 'posts/post-alice-active'), {
    ownerId: 'alice', businessId: 'biz-alice', title: 'Activo',
    status: 'active', viewCount: 3, createdAt: new Date('2026-01-01'),
  })
  await setDoc(doc(db, 'posts/post-alice-paused'), {
    ownerId: 'alice', businessId: 'biz-alice', title: 'Pausado por admin',
    status: 'paused', viewCount: 0, createdAt: new Date('2026-01-01'),
  })

  await setDoc(doc(db, 'businesses/biz-alice/reviews/bob'), {
    userId: 'bob', businessId: 'biz-alice', userName: 'Bob', userPhoto: '',
    rating: 5, comment: 'Excelente atención y producto.',
    isHidden: false, isVerified: false, reportCount: 0,
    ownerReply: null, ownerRepliedAt: null, createdAt: new Date('2026-01-02'),
  })

  await setDoc(doc(db, 'users/alice/notifications/n1'), {
    type: 'review', title: 'Nueva reseña', body: 'Bob calificó tu negocio',
    read: false, createdAt: new Date('2026-01-03'),
  })
})

const alice  = testEnv.authenticatedContext('alice').firestore()
const bob    = testEnv.authenticatedContext('bob').firestore()
const admin  = testEnv.authenticatedContext('admin').firestore()
const mallory = testEnv.authenticatedContext('mallory').firestore()
const anon   = testEnv.unauthenticatedContext().firestore()

let pass = 0
let fail = 0
const lines = []

async function expectAllowed(name, promise) {
  try {
    await assertSucceeds(promise)
    pass++; lines.push(`  [OK] PERMITIDO  ${name}`)
  } catch (e) {
    fail++; lines.push(`  [!!] FALLO (debia PERMITIR) ${name} -> ${e.message?.split('\n')[0]}`)
  }
}
async function expectDenied(name, promise) {
  try {
    await assertFails(promise)
    pass++; lines.push(`  [OK] DENEGADO   ${name}`)
  } catch (e) {
    fail++; lines.push(`  [!!] FALLO (debia DENEGAR) ${name} -> ${e.message?.split('\n')[0]}`)
  }
}
const section = (t) => lines.push(`\n— ${t} —`)

// ─── USERS: perfil propio sí, privilegios no ────────────────────────────────
section('USERS')
await expectAllowed('alice edita su displayName/bio',
  updateDoc(doc(alice, 'users/alice'), { displayName: 'Alice M.', bio: 'Hola' }))
await expectAllowed('alice agrega un favorito (favoriteIds)',
  updateDoc(doc(alice, 'users/alice'), { favoriteIds: arrayUnion('biz-bob') }))
await expectDenied('alice se auto-asigna role admin (escalada)',
  updateDoc(doc(alice, 'users/alice'), { role: 'admin' }))
await expectDenied('mallory (baneada) se auto-desbanea',
  updateDoc(doc(mallory, 'users/mallory'), { isBanned: false }))
await expectDenied('alice se auto-verifica',
  updateDoc(doc(alice, 'users/alice'), { isVerified: true }))
await expectDenied('bob edita el perfil de alice',
  updateDoc(doc(bob, 'users/alice'), { displayName: 'Hackeado' }))
await expectAllowed('admin cambia el rol de alice a entrepreneur',
  updateDoc(doc(admin, 'users/alice'), { role: 'entrepreneur' }))
await expectAllowed('usuario nuevo crea su doc (role user, sin flags)',
  setDoc(doc(testEnv.authenticatedContext('newbie').firestore(), 'users/newbie'),
    { role: 'user', isBanned: false, isVerified: false, displayName: 'Newbie' }))
await expectDenied('usuario nuevo se crea directamente como admin',
  setDoc(doc(testEnv.authenticatedContext('evil').firestore(), 'users/evil'),
    { role: 'admin', isBanned: false, isVerified: false }))

// ─── BUSINESSES: crear pending sí, auto-moderarse no ────────────────────────
section('BUSINESSES')
await expectAllowed('alice crea negocio propio en estado pending',
  setDoc(doc(alice, 'businesses/biz-new'), {
    ownerId: 'alice', name: 'Nuevo', status: 'pending', isVerified: false, isFeatured: false,
  }))
await expectDenied('alice crea negocio ya en estado active (salta aprobación)',
  setDoc(doc(alice, 'businesses/biz-cheat'), {
    ownerId: 'alice', name: 'Cheat', status: 'active', isVerified: false, isFeatured: false,
  }))
await expectDenied('alice crea negocio a nombre de bob (ownerId ajeno)',
  setDoc(doc(alice, 'businesses/biz-fake'), {
    ownerId: 'bob', name: 'Fake', status: 'pending', isVerified: false, isFeatured: false,
  }))
await expectDenied('anónimo crea negocio',
  setDoc(doc(anon, 'businesses/biz-anon'), {
    ownerId: 'anon', name: 'Anon', status: 'pending', isVerified: false, isFeatured: false,
  }))
await expectAllowed('alice edita contenido de su negocio (nombre/desc)',
  updateDoc(doc(alice, 'businesses/biz-alice'), { name: 'Alice Biz 2', description: 'desc' }))
await expectDenied('alice auto-aprueba su negocio (pending → active)',
  updateDoc(doc(alice, 'businesses/biz-alice-pending'), { status: 'active' }))
await expectDenied('alice se auto-destaca (isFeatured)',
  updateDoc(doc(alice, 'businesses/biz-alice'), { isFeatured: true }))
await expectDenied('alice infla su viewCount',
  updateDoc(doc(alice, 'businesses/biz-alice'), { viewCount: 99999 }))
await expectDenied('alice falsifica createdAt (recencia)',
  updateDoc(doc(alice, 'businesses/biz-alice'), { createdAt: new Date('2026-06-10') }))
await expectAllowed('admin aprueba negocio (pending → active)',
  updateDoc(doc(admin, 'businesses/biz-alice-pending'), { status: 'active' }))

// ─── POSTS: dueño real sí, moderación intocable ─────────────────────────────
section('POSTS')
await expectAllowed('alice publica en su propio negocio',
  setDoc(doc(alice, 'posts/post-new'), {
    ownerId: 'alice', businessId: 'biz-alice', title: 'Torta', status: 'active',
  }))
await expectDenied('bob publica en el negocio de alice',
  setDoc(doc(bob, 'posts/post-intruso'), {
    ownerId: 'bob', businessId: 'biz-alice', title: 'Intruso', status: 'active',
  }))
await expectDenied('alice publica apuntando al negocio de bob',
  setDoc(doc(alice, 'posts/post-cross'), {
    ownerId: 'alice', businessId: 'biz-bob', title: 'Cross', status: 'active',
  }))
await expectAllowed('alice edita el título de su post (status intacto)',
  updateDoc(doc(alice, 'posts/post-alice-active'), { title: 'Activo v2' }))
await expectAllowed('alice soft-elimina su post (→ deleted)',
  updateDoc(doc(alice, 'posts/post-alice-active'), { status: 'deleted' }))
await expectDenied('alice reactiva un post pausado por admin (paused → active)',
  updateDoc(doc(alice, 'posts/post-alice-paused'), { status: 'active' }))
await expectDenied('alice infla viewCount de su post',
  updateDoc(doc(alice, 'posts/post-alice-paused'), { viewCount: 5000 }))
await expectAllowed('admin pausa/reactiva cualquier post',
  updateDoc(doc(admin, 'posts/post-alice-paused'), { status: 'active' }))

// ─── REVIEWS: una por usuario, sin forjar respuestas ────────────────────────
section('REVIEWS')
await expectAllowed('bob crea reseña con id == su uid',
  setDoc(doc(testEnv.authenticatedContext('newbie').firestore(),
    'businesses/biz-bob/reviews/newbie'), {
    userId: 'newbie', businessId: 'biz-bob', userName: 'Newbie', userPhoto: '',
    rating: 4, comment: 'Muy bueno', isHidden: false, isVerified: false, reportCount: 0,
  }))
await expectDenied('bob crea reseña con id distinto a su uid (duplicado)',
  setDoc(doc(bob, 'businesses/biz-alice/reviews/bob-2'), {
    userId: 'bob', businessId: 'biz-alice', rating: 5, comment: 'Spam',
  }))
await expectDenied('reseña con rating fuera de rango (0)',
  setDoc(doc(testEnv.authenticatedContext('zed').firestore(),
    'businesses/biz-alice/reviews/zed'), {
    userId: 'zed', businessId: 'biz-alice', rating: 0, comment: 'Malísimo',
  }))
await expectAllowed('bob edita el comentario/rating de SU reseña',
  updateDoc(doc(bob, 'businesses/biz-alice/reviews/bob'), { comment: 'Actualizado', rating: 4 }))
await expectDenied('bob forja una "Respuesta del propietario" (ownerReply)',
  updateDoc(doc(bob, 'businesses/biz-alice/reviews/bob'), { ownerReply: 'Gracias! — El dueño' }))
await expectDenied('bob se cambia el userName mostrado (suplantación)',
  updateDoc(doc(bob, 'businesses/biz-alice/reviews/bob'), { userName: 'El Dueño Oficial' }))
await expectDenied('bob altera el createdAt de su reseña',
  updateDoc(doc(bob, 'businesses/biz-alice/reviews/bob'), { createdAt: new Date('2026-06-10') }))
await expectDenied('bob toca flags de moderación (isHidden)',
  updateDoc(doc(bob, 'businesses/biz-alice/reviews/bob'), { isHidden: true }))
await expectAllowed('admin oculta una reseña reportada',
  updateDoc(doc(admin, 'businesses/biz-alice/reviews/bob'), { isHidden: true }))

// ─── REPORTS ────────────────────────────────────────────────────────────────
section('REPORTS')
await expectAllowed('bob reporta una reseña (reporterId propio)',
  setDoc(doc(bob, 'reports/review_biz-alice_bob_bob'), {
    type: 'review', businessId: 'biz-alice', reviewId: 'bob',
    reporterId: 'bob', status: 'pending', createdAt: new Date(),
  }))
await expectDenied('bob crea reporte con reporterId ajeno',
  setDoc(doc(bob, 'reports/fake'), {
    type: 'review', reporterId: 'alice', status: 'pending',
  }))
await expectDenied('bob lee la bandeja de reportes',
  getDoc(doc(bob, 'reports/review_biz-alice_bob_bob')))
await expectAllowed('admin lee reportes',
  getDoc(doc(admin, 'reports/review_biz-alice_bob_bob')))

// ─── CONTACT MESSAGES ───────────────────────────────────────────────────────
section('CONTACT MESSAGES')
await expectAllowed('visitante anónimo envía mensaje de contacto válido',
  setDoc(doc(anon, 'contactMessages/m1'), {
    name: 'Visitante', email: 'v@mail.com', message: 'Hola, quiero información sobre KRUZO.',
  }))
await expectDenied('mensaje demasiado corto (spam barato)',
  setDoc(doc(anon, 'contactMessages/m2'), {
    name: 'X', email: 'x@x.co', message: 'hola',
  }))
await expectDenied('usuario normal lee los mensajes de contacto',
  getDoc(doc(bob, 'contactMessages/m1')))
await expectAllowed('admin lee los mensajes de contacto',
  getDoc(doc(admin, 'contactMessages/m1')))

// ─── NOTIFICATIONS ──────────────────────────────────────────────────────────
section('NOTIFICATIONS')
await expectDenied('cliente crea notificaciones (solo Cloud Functions)',
  setDoc(doc(alice, 'users/alice/notifications/forjada'), {
    type: 'system', title: 'Fake', body: 'x', read: false,
  }))
await expectAllowed('alice lee su notificación',
  getDoc(doc(alice, 'users/alice/notifications/n1')))
await expectAllowed('alice marca su notificación como leída',
  updateDoc(doc(alice, 'users/alice/notifications/n1'), { read: true }))
await expectDenied('bob lee las notificaciones de alice',
  getDoc(doc(bob, 'users/alice/notifications/n1')))

// ─── Resultado ──────────────────────────────────────────────────────────────
console.log(lines.join('\n'))
console.log(`\n══════════════════════════════════════`)
console.log(`  RESULTADO: ${pass} PASS · ${fail} FAIL · ${pass + fail} casos`)
console.log(`══════════════════════════════════════`)

await testEnv.cleanup()
process.exit(fail > 0 ? 1 : 0)
