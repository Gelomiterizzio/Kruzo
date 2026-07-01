'use client'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { type User } from 'firebase/auth'
import { onAuthChange, syncSession, clearSession, logout, createUserDocument } from '@/lib/firebase/auth'
import { getUserById } from '@/lib/firebase/firestore'
import { initAppCheck } from '@/lib/firebase/config'
import { useStore } from '@/lib/store/useStore'
import { toast } from 'sonner'
import type { AppUser } from '@/lib/types/user'

interface AuthContextType {
  firebaseUser: User | null
  appUser: AppUser | null
  loading: boolean
  /** Re-reads the Firestore user doc (e.g. right after creating a business). */
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  appUser: null,
  loading: true,
  refreshUser: async () => {},
})

// The profile read (getUserById) is a network call that, when Firestore is
// unreachable/slow, can stay PENDING forever (it neither resolves nor rejects).
// Because the auth callback awaits it before clearing `loading`, a hung read
// used to freeze the whole app (Settings stuck on a skeleton, navbar stuck on
// the logged-out state). Bounding it guarantees `loading` always resolves.
const PROFILE_LOAD_TIMEOUT_MS = 12000
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('profile-load-timeout')), ms),
    ),
  ])
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const fbUserRef = useRef<User | null>(null)
  const setStoreUser = useStore((s) => s.setUser)
  const setFavorites = useStore((s) => s.setFavorites)

  // Rehydrate Zustand persist store + start App Check (no-op without a key) on client mount
  useEffect(() => {
    useStore.persist.rehydrate()
    void initAppCheck()
  }, [])

  const loadAppUser = useCallback(async (fbUser: User): Promise<AppUser | null> => {
    try {
      let u = await withTimeout(getUserById(fbUser.uid), PROFILE_LOAD_TIMEOUT_MS)
      // Self-heal: an authenticated user with no Firestore profile (e.g. the
      // doc creation failed at sign-up, an Auth-only account, or an old
      // email-login path that never created it). Create it idempotently and
      // re-read, instead of leaving the app profile-less. (A missing doc RESOLVES
      // to null in ms — it never hung; this closes the real data-level gap.)
      if (!u) {
        await withTimeout(createUserDocument(fbUser), PROFILE_LOAD_TIMEOUT_MS)
        u = await withTimeout(getUserById(fbUser.uid), PROFILE_LOAD_TIMEOUT_MS)
      }
      if (u?.isBanned) {
        // Banned accounts are signed out everywhere (server already refuses
        // the session cookie; this covers an existing client session).
        toast.error('Tu cuenta fue suspendida. Contacta a soporte.')
        await logout()
        return null
      }
      setAppUser(u)
      setStoreUser(u)
      setFavorites(u?.favoriteIds ?? [])
      return u
    } catch {
      setAppUser(null)
      setStoreUser(null)
      return null
    }
  }, [setStoreUser, setFavorites])

  const refreshUser = useCallback(async () => {
    if (fbUserRef.current) await loadAppUser(fbUserRef.current)
  }, [loadAppUser])

  useEffect(() => {
    const unsub = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser)
      fbUserRef.current = fbUser
      if (fbUser) {
        // Keep the server session cookie in sync with the client session
        // (covers expired/missing cookie while the client is still signed in).
        void syncSession(fbUser)
        await loadAppUser(fbUser)
      } else {
        void clearSession()
        setAppUser(null)
        setStoreUser(null)
        setFavorites([])
      }
      setLoading(false)
    })
    return unsub
  }, [loadAppUser, setStoreUser, setFavorites])

  return (
    <AuthContext.Provider value={{ firebaseUser, appUser, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
