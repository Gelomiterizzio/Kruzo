import {
  GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, sendPasswordResetEmail, signOut,
  updateProfile, onAuthStateChanged, type User
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { auth, db } from './config'
import type { AppUser } from '@/lib/types/user'

const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('profile')
googleProvider.addScope('email')

export async function createUserDocument(user: User, extra?: Partial<AppUser>) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    await updateDoc(ref, { lastSeen: serverTimestamp() })
    return
  }
  await setDoc(ref, {
    id: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    photoURL: user.photoURL ?? '',
    phone: '',
    bio: '',
    location: 'Santa Cruz de la Sierra, Bolivia',
    role: 'user',
    businessIds: [],
    favoriteIds: [],
    postCount: 0,
    reviewCount: 0,
    reputation: 0,
    notifications: {
      email: true, whatsapp: false, push: true,
      newReviews: true, newMessages: true, promotions: false,
    },
    isVerified: false,
    isBanned: false,
    banReason: '',
    createdAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
    ...extra,
  })
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  await createUserDocument(result.user)
  return result.user
}

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function registerWithEmail(email: string, password: string, name: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(result.user, { displayName: name })
  await createUserDocument(result.user)
  return result.user
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email)
}

export async function logout() {
  await signOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
