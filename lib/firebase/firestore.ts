import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, setDoc,
  query, where, orderBy, limit, startAfter,
  serverTimestamp, type DocumentSnapshot, type QueryConstraint,
  runTransaction, arrayUnion, arrayRemove, writeBatch, getCountFromServer,
} from 'firebase/firestore'
import { db } from './config'
import type { Business, BusinessFormData } from '@/lib/types/business'
import type { Post, PostFormData } from '@/lib/types/post'
import type { Review, ReviewFormData } from '@/lib/types/review'
import type { AppUser } from '@/lib/types/user'
import type { AppNotification } from '@/lib/types/notification'
import { uniqueSlug, normalizeText } from '@/lib/utils/formatters'
import { withTimeout, READ_TIMEOUT_MS } from '@/lib/utils/withTimeout'

// ─── HELPERS ────────────────────────────────────────────────────────────────

// ─── USERS ──────────────────────────────────────────────────────────────────

export async function getUserById(uid: string): Promise<AppUser | null> {
  const snap = await withTimeout(getDoc(doc(db, 'users', uid)), READ_TIMEOUT_MS, 'getUserById')
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as AppUser) : null
}

export async function updateUserProfile(uid: string, data: Partial<AppUser>) {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() })
}

// ─── BUSINESSES ─────────────────────────────────────────────────────────────

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const q = query(collection(db, 'businesses'), where('slug', '==', slug), limit(1))
  const snap = await withTimeout(getDocs(q), READ_TIMEOUT_MS, 'getBusinessBySlug')
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as Business
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const snap = await withTimeout(getDoc(doc(db, 'businesses', id)), READ_TIMEOUT_MS, 'getBusinessById')
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Business) : null
}

export async function getBusinesses(opts: {
  category?: string; featured?: boolean; zone?: string
  pageSize?: number; cursor?: DocumentSnapshot
}): Promise<{ businesses: Business[]; lastDoc: DocumentSnapshot | null }> {
  const { category, featured, zone, pageSize = 12, cursor } = opts
  const constraints: QueryConstraint[] = [
    where('status', '==', 'active'),
    orderBy('isFeatured', 'desc'),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  ]
  if (category) constraints.push(where('category', 'array-contains', category))
  if (featured) constraints.push(where('isFeatured', '==', true))
  if (zone) constraints.push(where('zone', '==', zone))
  if (cursor) constraints.push(startAfter(cursor))

  const snap = await withTimeout(getDocs(query(collection(db, 'businesses'), ...constraints)), READ_TIMEOUT_MS, 'getBusinesses')
  return {
    businesses: snap.docs.map(d => ({ id: d.id, ...d.data() } as Business)),
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
  }
}

export async function createBusiness(ownerId: string, ownerName: string, data: BusinessFormData): Promise<string> {
  const slug = uniqueSlug(data.name)
  const ref = await addDoc(collection(db, 'businesses'), {
    ...data,
    slug, ownerId, ownerName,
    tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
    logo: '', coverImage: '', images: [],
    coordinates: null, mapUrl: '',
    hours: { mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null },
    rating: 0, reviewCount: 0, viewCount: 0, favoriteCount: 0, shareCount: 0, contactCount: 0,
    status: 'pending', isVerified: false, isFeatured: false, featuredUntil: null, plan: 'free',
    city: 'Santa Cruz de la Sierra',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
  // Link the business to its owner right away so the dashboard finds it on the
  // very next read. The onBusinessCreated Cloud Function repeats this server-
  // side (idempotent arrayUnion) and also promotes the user to entrepreneur.
  try {
    await updateDoc(doc(db, 'users', ownerId), { businessIds: arrayUnion(ref.id) })
  } catch { /* non-fatal: the Cloud Function performs the same link */ }
  return ref.id
}

export async function updateBusiness(id: string, data: Partial<Business>) {
  await updateDoc(doc(db, 'businesses', id), { ...data, updatedAt: serverTimestamp() })
}

// ─── POSTS ──────────────────────────────────────────────────────────────────

export async function getPostsByBusiness(businessId: string, pageSize = 12, cursor?: DocumentSnapshot) {
  const constraints: QueryConstraint[] = [
    where('businessId', '==', businessId),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  ]
  if (cursor) constraints.push(startAfter(cursor))
  const snap = await withTimeout(getDocs(query(collection(db, 'posts'), ...constraints)), READ_TIMEOUT_MS, 'getPosts')
  return {
    posts: snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)),
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
  }
}

export async function getPosts(opts: {
  category?: string; pageSize?: number; cursor?: DocumentSnapshot
}): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }> {
  const { category, pageSize = 12, cursor } = opts
  const constraints: QueryConstraint[] = [
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  ]
  if (category) constraints.push(where('category', '==', category))
  if (cursor) constraints.push(startAfter(cursor))
  const snap = await withTimeout(getDocs(query(collection(db, 'posts'), ...constraints)), READ_TIMEOUT_MS, 'getPosts')
  return {
    posts: snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)),
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
  }
}

export async function createPost(ownerId: string, businessId: string, businessName: string,
  businessSlug: string, businessLogo: string, whatsapp: string, data: PostFormData): Promise<string> {
  const ref = await addDoc(collection(db, 'posts'), {
    ...data,
    ownerId, businessId, businessName, businessSlug, businessLogo, whatsapp,
    tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
    deliveryZones: data.deliveryZones.split(',').map(t => t.trim()).filter(Boolean),
    currency: 'BOB', images: [],
    viewCount: 0, likeCount: 0, commentCount: 0, shareCount: 0,
    status: 'active', isFeatured: false,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updatePost(id: string, data: Partial<Post>) {
  await updateDoc(doc(db, 'posts', id), { ...data, updatedAt: serverTimestamp() })
}

// ─── REVIEWS ────────────────────────────────────────────────────────────────

export async function getReviews(businessId: string, pageSize = 10, cursor?: DocumentSnapshot) {
  const constraints: QueryConstraint[] = [
    where('isHidden', '==', false),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  ]
  if (cursor) constraints.push(startAfter(cursor))
  const snap = await withTimeout(getDocs(query(collection(db, 'businesses', businessId, 'reviews'), ...constraints)), READ_TIMEOUT_MS, 'getReviews')
  return {
    reviews: snap.docs.map(d => ({ id: d.id, ...d.data() } as Review)),
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
  }
}

export async function createReview(
  businessId: string, userId: string, userName: string, userPhoto: string, data: ReviewFormData
) {
  // One review per user per business — the review id IS the user id. The client
  // ONLY writes the review document; the `onReviewWritten` Cloud Function keeps
  // the business's reviewCount, rating and ratingDistribution consistent.
  const reviewRef = doc(db, 'businesses', businessId, 'reviews', userId)
  return await runTransaction(db, async tx => {
    const existing = await tx.get(reviewRef)
    if (existing.exists()) throw new Error('already-reviewed')
    tx.set(reviewRef, {
      businessId, userId, userName, userPhoto,
      rating: data.rating, comment: data.comment, images: [],
      ownerReply: null, ownerRepliedAt: null,
      isVerified: false, reportCount: 0, isHidden: false,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    })
    return reviewRef.id
  })
}

// ─── SEARCH ─────────────────────────────────────────────────────────────────
// Firestore has no full-text search, so /search fetches one capped batch with
// the already-indexed filters and matches/sorts client-side. Accent- and
// case-insensitive; good for a local directory's scale. The fetch reuses the
// composite indexes that /explore already needs (status+zone/category+
// isFeatured+createdAt), so no new indexes are required.

export type SearchSort = 'recent' | 'rating' | 'popular' | 'featured'

const SEARCH_FETCH_LIMIT = 100

function matchesQuery(fields: (string | string[] | undefined)[], q: string): boolean {
  const needle = normalizeText(q)
  return fields.some((f) => !!f && normalizeText(Array.isArray(f) ? f.join(' ') : f).includes(needle))
}

const millis = (t: unknown) => (t as { toMillis?: () => number } | null)?.toMillis?.() ?? 0

export async function searchBusinesses(opts: {
  q?: string; category?: string; zone?: string; sort?: SearchSort
}): Promise<Business[]> {
  const { q, category, zone, sort = 'featured' } = opts
  const constraints: QueryConstraint[] = [
    where('status', '==', 'active'),
    orderBy('isFeatured', 'desc'),
    orderBy('createdAt', 'desc'),
    limit(SEARCH_FETCH_LIMIT),
  ]
  if (category) constraints.push(where('category', 'array-contains', category))
  if (zone) constraints.push(where('zone', '==', zone))

  const snap = await getDocs(query(collection(db, 'businesses'), ...constraints))
  let results = snap.docs.map(d => ({ id: d.id, ...d.data() } as Business))

  if (q?.trim()) {
    results = results.filter(b =>
      matchesQuery([b.name, b.tagline, b.description, b.tags, b.zone, b.category], q))
  }

  switch (sort) {
    case 'rating':
      results = [...results].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
      break
    case 'popular':
      results = [...results].sort((a, b) => b.viewCount - a.viewCount)
      break
    case 'recent':
      results = [...results].sort((a, b) => millis(b.createdAt) - millis(a.createdAt))
      break
    // 'featured' keeps the query order (isFeatured desc, createdAt desc)
  }
  return results
}

export async function searchPosts(opts: {
  q?: string; category?: string; sort?: SearchSort
}): Promise<Post[]> {
  const { q, category, sort = 'recent' } = opts
  const constraints: QueryConstraint[] = [
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(SEARCH_FETCH_LIMIT),
  ]
  if (category) constraints.push(where('category', '==', category))

  const snap = await withTimeout(getDocs(query(collection(db, 'posts'), ...constraints)), READ_TIMEOUT_MS, 'getPosts')
  let results = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post))

  if (q?.trim()) {
    results = results.filter(p =>
      matchesQuery([p.title, p.description, p.tags, p.businessName], q))
  }

  if (sort === 'popular') {
    results = [...results].sort((a, b) => b.viewCount - a.viewCount)
  }
  return results
}

// ─── FAVORITES ──────────────────────────────────────────────────────────────

export async function toggleFavorite(userId: string, businessId: string, isFav: boolean) {
  // The client only edits its OWN favoriteIds. The `onUserFavoritesWritten`
  // Cloud Function keeps each business's favoriteCount in sync from the diff.
  await updateDoc(doc(db, 'users', userId), {
    favoriteIds: isFav ? arrayRemove(businessId) : arrayUnion(businessId),
  })
}

// ─── NOTIFICATIONS ──────────────────────────────────────────────────────────
// Real in-app notifications: documents are created by Cloud Functions under
// users/{uid}/notifications; the client reads them and marks them as read.

export async function getNotifications(userId: string, pageSize = 50): Promise<AppNotification[]> {
  const snap = await withTimeout(getDocs(query(
    collection(db, 'users', userId, 'notifications'),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  )), READ_TIMEOUT_MS, 'getNotifications')
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification))
}

export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  const snap = await withTimeout(getCountFromServer(query(
    collection(db, 'users', userId, 'notifications'),
    where('read', '==', false),
  )), READ_TIMEOUT_MS, 'getUnreadNotificationsCount')
  return snap.data().count
}

export async function markAllNotificationsRead(userId: string, notifications: AppNotification[]) {
  const unread = notifications.filter(n => !n.read)
  if (!unread.length) return
  const batch = writeBatch(db)
  unread.forEach(n => batch.update(doc(db, 'users', userId, 'notifications', n.id), { read: true }))
  await batch.commit()
}

// ─── REPORTS ────────────────────────────────────────────────────────────────

/**
 * Reports a review. The doc id is derived from reviewer+reporter so the same
 * person can't spam-report the same review (the second create is denied).
 */
export async function reportReview(businessId: string, reviewId: string, reporterId: string) {
  const ref = doc(db, 'reports', `review_${businessId}_${reviewId}_${reporterId}`)
  await setDoc(ref, {
    type: 'review',
    businessId,
    reviewId,
    reporterId,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
}

// ─── CONTACT ────────────────────────────────────────────────────────────────

export async function sendContactMessage(data: { name: string; email: string; message: string }) {
  await addDoc(collection(db, 'contactMessages'), {
    ...data,
    status: 'new',
    createdAt: serverTimestamp(),
  })
}
