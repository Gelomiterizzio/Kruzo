export const APP_NAME = 'KRUZO'
export const APP_TAGLINE = 'Tu Ciudad. Tu Mercado.'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kruzo.bo'
export const APP_CITY = 'Santa Cruz de la Sierra'
export const APP_COUNTRY = 'Bolivia'

export const WHATSAPP_COUNTRY_CODE = '591'

export const SCZ_CENTER = { lat: -17.7863, lng: -63.1812 } as const

// ─── Zonas de Santa Cruz — ÚNICA fuente de verdad ───────────────────────────
export const SCZ_ZONES = [
  'Centro', 'Norte', 'Sur', 'Este', 'Oeste',
  'Equipetrol', 'Plan 3000',
  'La Guardia', 'Warnes', 'Cotoca', 'Montero', 'Otros',
] as const

// ─── Categorías de negocio — ÚNICA fuente de verdad ─────────────────────────
// key/emoji/label = identidad; color = badge (CategoryBadge); gradient = grid (CategoryGrid).
export const BUSINESS_CATEGORIES = [
  { key: 'comida',        emoji: '🍕', label: 'Comida',        color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300', gradient: 'from-orange-500 to-red-500' },
  { key: 'reposteria',    emoji: '🧁', label: 'Repostería',    color: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',         gradient: 'from-pink-500 to-rose-500' },
  { key: 'tecnologia',    emoji: '💻', label: 'Tecnología',    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',         gradient: 'from-blue-600 to-indigo-600' },
  { key: 'belleza',       emoji: '💇', label: 'Belleza',       color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',         gradient: 'from-fuchsia-500 to-pink-500' },
  { key: 'ropa',          emoji: '👗', label: 'Ropa',          color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300', gradient: 'from-violet-600 to-purple-600' },
  { key: 'servicios',     emoji: '🔧', label: 'Servicios',     color: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',         gradient: 'from-teal-500 to-cyan-500' },
  { key: 'fotografia',    emoji: '📸', label: 'Fotografía',    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300', gradient: 'from-indigo-600 to-blue-600' },
  { key: 'automotriz',    emoji: '🚗', label: 'Automotriz',    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',     gradient: 'from-slate-600 to-slate-700' },
  { key: 'hogar',         emoji: '🏠', label: 'Hogar',         color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',     gradient: 'from-green-600 to-emerald-600' },
  { key: 'educacion',     emoji: '🎓', label: 'Educación',     color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',         gradient: 'from-cyan-600 to-sky-600' },
  { key: 'electricistas', emoji: '⚡', label: 'Electricistas', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300', gradient: 'from-yellow-500 to-amber-500' },
  { key: 'carpinteria',   emoji: '🪑', label: 'Carpintería',   color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',     gradient: 'from-amber-600 to-yellow-600' },
] as const

export const PRICE_TYPE_LABELS = {
  fixed:      'Precio fijo',
  negotiable: 'Negociable',
  free:       'Gratis',
  consult:    'Consultar precio',
} as const

export const BUSINESS_PLAN_LABELS = {
  free:    'Básico',
  pro:     'Pro',
  premium: 'Premium',
} as const

export const PAGINATION_SIZE = 12
export const REVIEWS_PER_PAGE = 5
export const POSTS_PER_PAGE = 12
