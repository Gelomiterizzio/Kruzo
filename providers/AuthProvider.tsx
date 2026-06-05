'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { type User } from 'firebase/auth'
import { onAuthChange, syncSession, clearSession } from '@/lib/firebase/auth'
import { getUserById } from '@/lib/firebase/firestore'
import { useStore } from '@/lib/store/useStore'
import type { AppUser } from '@/lib/types/user'

interface AuthContextType {
  firebaseUser: User | null
  appUser: AppUser | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  appUser: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const setStoreUser = useStore((s) => s.setUser)
  const setFavorites = useStore((s) => s.setFavorites)

  // Rehydrate Zustand persist store on client mount
  useEffect(() => {
    useStore.persist.rehydrate()
  }, [])

  useEffect(() => {
    const unsub = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser)
      if (fbUser) {
        // Keep the server session cookie in sync with the client session
        // (covers expired/missing cookie while the client is still signed in).
        void syncSession(fbUser)
        try {
          const u = await getUserById(fbUser.uid)
          setAppUser(u)
          setStoreUser(u)
          if (u?.favoriteIds?.length) setFavorites(u.favoriteIds)
        } catch {
          setAppUser(null)
          setStoreUser(null)
        }
      } else {
        void clearSession()
        setAppUser(null)
        setStoreUser(null)
        setFavorites([])
      }
      setLoading(false)
    })
    return unsub
  }, [setStoreUser, setFavorites])

  return (
    <AuthContext.Provider value={{ firebaseUser, appUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
