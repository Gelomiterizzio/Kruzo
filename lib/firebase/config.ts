import { initializeApp, getApps, getApp } from 'firebase/app'
import { initializeFirestore, getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
}

// Initialize Firebase app (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Auto-detect long-polling: Firestore's default WebChannel/gRPC streaming gets
// blocked by restrictive networks (corporate/institutional WiFi, proxies,
// some VPNs), which makes reads hang forever instead of resolving. Long-polling
// tunnels through those and is auto-selected only when needed, so it addresses
// the network stalls at the source. Guarded so HMR (which re-runs this module)
// doesn't throw "already initialized".
export const db = (() => {
  try {
    return initializeFirestore(app, { experimentalAutoDetectLongPolling: true })
  } catch {
    return getFirestore(app)
  }
})()
export const auth    = getAuth(app)
export const storage = getStorage(app)

// Analytics: browser-only, lazy-loaded
export const getAnalyticsInstance = async () => {
  if (typeof window === 'undefined') return null
  const { getAnalytics, isSupported } = await import('firebase/analytics')
  const supported = await isSupported()
  return supported ? getAnalytics(app) : null
}

// Firebase App Check — browser-only, opt-in.
// No-op unless NEXT_PUBLIC_FIREBASE_APPCHECK_KEY (a reCAPTCHA v3 site key) is set,
// so the app keeps working in dev / before App Check is provisioned. In non-prod
// a debug token is enabled (register it in the Firebase console for local use).
// Enforcement for Firestore must be turned on in the Firebase console.
let appCheckStarted = false
export async function initAppCheck() {
  if (typeof window === 'undefined' || appCheckStarted) return
  const key = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_KEY
  if (!key) return
  appCheckStarted = true
  if (process.env.NODE_ENV !== 'production') {
    ;(self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true
  }
  try {
    const { initializeAppCheck, ReCaptchaV3Provider } = await import('firebase/app-check')
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(key),
      isTokenAutoRefreshEnabled: true,
    })
  } catch {
    /* non-fatal: never block the app if App Check fails to initialize */
  }
}

export default app
