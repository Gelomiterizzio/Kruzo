'use client'
import { MotionConfig } from 'framer-motion'

/**
 * Honors the user's prefers-reduced-motion setting for every framer-motion
 * animation in the app (entrances, modals, hero blobs, tab indicators…).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
