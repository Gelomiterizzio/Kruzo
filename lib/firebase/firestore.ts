import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, increment,
  serverTimestamp, type DocumentSnapshot, type QueryConstraint,
  runTransaction, writeBatch, arrayUnion, arrayRemove, GeoPoint
} from 'firebase/firestore'
import { db } from './config'
import type { Business, BusinessFormData } from '@/lib/types/business'
import type { Post, PostFormData } from '@/lib/types/post'
import type { Review, ReviewFormData } from '@/lib/types/review'
import type { AppUser } from '@/lib/types/user'

// ─── HELPERS ────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Math.random().toString(36).slice(2, 6)
}

// ─── USERS ──────────────────────────────────────────────────────────────────

export async function getUserById(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as AppUser) : null
}

export async function updateUserProfile(uid: string, data: Partial<AppUser>) {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() })
}

// ─── BUSINESSES ─────────────────────────────────────────────────────────────

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const q = query(collection(db, 'businesses'), where('slug', '==', slug), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as Business
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const snap = await getDoc(doc(db, 'businesses', id))
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

  const snap = await getDocs(query(collection(db, 'businesses'), ...constraints))
  return {
    businesses: snap.docs.map(d => ({ id: d.id, ...d.data() } as Business)),
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
  }
}

export async function createBusiness(ownerId: string, ownerName: string, data: BusinessFormData): Promise<string> {
  const slug = slugify(data.name)
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
  return ref.id
}

export async function updateBusiness(id: string, data: Partial<Business>) {
  await updateDoc(doc(db, 'businesses', id), { ...data, updatedAt: serverTimestamp() })
}

export async function incrementBusinessView(id: string) {
  await updateDoc(doc(db, 'businesses', id), { viewCount: increment(1) })
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
  const snap = await getDocs(query(collection(db, 'posts'), ...constraints))
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
  const snap = await getDocs(query(collection(db, 'posts'), ...constraints))
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
  const snap = await getDocs(query(collection(db, 'businesses', businessId, 'reviews'), ...constraints))
  return {
    reviews: snap.docs.map(d => ({ id: d.id, ...d.data() } as Review)),
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
  }
}

export async function createReview(
  businessId: string, userId: string, userName: string, userPhoto: string, data: ReviewFormData
) {
  return await runTransaction(db, async tx => {
    const bizRef = doc(db, 'businesses', businessId)
    const biz = await tx.get(bizRef)
    if (!biz.exists()) throw new Error('Business not found')

    const reviewRef = doc(collection(db, 'businesses', businessId, 'reviews'))
    tx.set(reviewRef, {
      businessId, userId, userName, userPhoto,
      rating: data.rating, comment: data.comment, images: [],
      ownerReply: null, ownerRepliedAt: null,
      isVerified: false, reportCount: 0, isHidden: false,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    })

    const prevCount = biz.data().reviewCount ?? 0
    const prevRating = biz.data().rating ?? 0
    const newCount = prevCount + 1
    const newRating = ((prevRating * prevCount) + data.rating) / newCount
    tx.update(bizRef, { reviewCount: newCount, rating: Math.round(newRating * 10) / 10 })
    return reviewRef.id
  })
}

// ─── FAVORITES ──────────────────────────────────────────────────────────────

export async function toggleFavorite(userId: string, businessId: string, isFav: boolean) {
  const batch = writeBatch(db)
  const userRef = doc(db, 'users', userId)
  const bizRef = doc(db, 'businesses', businessId)
  if (isFav) {
    batch.update(userRef, { favoriteIds: arrayRemove(businessId) })
    batch.update(bizRef, { favoriteCount: increment(-1) })
  } else {
    batch.update(userRef, { favoriteIds: arrayUnion(businessId) })
    batch.update(bizRef, { favoriteCount: increment(1) })
  }
  await batch.commit()
}
