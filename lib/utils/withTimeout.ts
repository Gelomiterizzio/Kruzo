/**
 * Bounds a promise: rejects if it doesn't settle within `ms`.
 *
 * Firestore one-shot reads (getDoc/getDocs/getCount) have NO built-in timeout —
 * on a stalled transport (e.g. a network that blocks the WebChannel stream) they
 * can stay PENDING forever, and React Query cannot rescue a promise that never
 * settles (retry only fires on rejection). Wrapping reads with this turns an
 * indefinite hang into a bounded rejection, so no screen can load forever.
 *
 * The value is generous (measured normal reads resolve in <4s), so it never
 * trips on a healthy/slow-but-working network — only on a true stall.
 */
export const READ_TIMEOUT_MS = 15000

export function withTimeout<T>(promise: Promise<T>, ms = READ_TIMEOUT_MS, label = 'operación'): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Tiempo de espera agotado (${label})`)), ms),
    ),
  ])
}
