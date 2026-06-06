// ─────────────────────────────────────────────────────────────────────────────
// KRUZO — centralized Google AdSense configuration (single source of truth).
//
// The ENTIRE ad system is driven by environment variables. When no publisher id
// is configured the system is a complete no-op: the app renders exactly as it
// did before (no script, no <ins>, no ads.txt, no CSP loosening). This lets us
// ship the integration safely and switch it on later by pasting the real ids
// into .env.local — without touching code.
//
// NEXT_PUBLIC_* vars are inlined at build time, so these constants are valid in
// both Server and Client Components.
// ─────────────────────────────────────────────────────────────────────────────

/** AdSense publisher id, e.g. "ca-pub-1234567890123456". Empty when unset. */
export const ADSENSE_CLIENT = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '').trim()

/** Master switch. Gate EVERY ad render and the loader script on this. */
export const ADS_ENABLED = ADSENSE_CLIENT.startsWith('ca-pub-')

/** Logical ad placements. Each maps to one AdSense ad unit (slot id) via env. */
export type AdPlacement = 'top' | 'inline' | 'sidebar' | 'footer' | 'infeed'

const SLOTS: Record<AdPlacement, string> = {
  top: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP ?? '').trim(),
  inline: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_INLINE ?? '').trim(),
  sidebar: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? '').trim(),
  footer: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER ?? '').trim(),
  infeed: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED ?? '').trim(),
}

/** Returns the configured slot id for a placement, or '' when not set. */
export function getSlot(placement: AdPlacement): string {
  return SLOTS[placement]
}

/** True when both the publisher id AND this placement's slot id are present. */
export function isPlacementReady(placement: AdPlacement): boolean {
  return ADS_ENABLED && getSlot(placement).length > 0
}
