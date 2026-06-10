'use client'
import { motion } from 'framer-motion'

/**
 * Subtle route-change transition (fade + 8px rise, 180ms). Used from the
 * route-group template.tsx files so every navigation feels intentional
 * instead of a hard cut. Respects reduced motion via the global MotionConfig.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
