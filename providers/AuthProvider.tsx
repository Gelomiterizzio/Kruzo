'use client'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { type User } from 'firebase/auth'
import { onAuthChange, syncSession, clearSession, logout } from '@/lib/firebase/auth'
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const uidRef = useRef<string | null>(null)
  const setStoreUser = useStore((s) => s.setUser)
  const setFavorites = useStore((s) => s.setFavorites)

  // Rehydrate Zustand persist store + start App Check (no-op without a key) on client mount
  useEffect(() => {
    useStore.persist.rehydrate()
    void initAppCheck()
  }, [])

  const loadAppUser = useCallback(async (uid: string): Promise<AppUser | null> => {
    try {
      const u = await getUserById(uid)
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
    if (uidRef.current) await loadAppUser(uidRef.current)
  }, [loadAppUser])

  useEffect(() => {
    const unsub = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser)
      uidRef.current = fbUser?.uid ?? null
      if (fbUser) {
        // Keep the server session cookie in sync with the client session
        // (covers expired/missing cookie while the client is still signed in).
        void syncSession(fbUser)
        await loadAppUser(fbUser.uid)
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
