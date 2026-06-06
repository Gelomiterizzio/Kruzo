'use client'
import { useEffect } from 'react'

/**
 * Registers the service worker (production only) so the app is installable as a
 * PWA and has a basic offline shell. Failures are swallowed — the SW is purely
 * progressive enhancement and never blocks the app.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [])
  return null
}
