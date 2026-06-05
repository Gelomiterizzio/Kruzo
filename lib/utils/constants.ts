export const APP_NAME = 'KRUZO'
export const APP_TAGLINE = 'Tu Ciudad. Tu Mercado.'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kruzo.bo'
export const APP_CITY = 'Santa Cruz de la Sierra'
export const APP_COUNTRY = 'Bolivia'

export const WHATSAPP_COUNTRY_CODE = '591'

export const SCZ_CENTER = { lat: -17.7863, lng: -63.1812 } as const

export const SCZ_ZONES = [
  'Centro', 'Norte', 'Sur', 'Este', 'Oeste',
  'Equipetrol', 'Plan 3000', 'Urbarí', 'Villa 1ro de Mayo',
  'La Guardia', 'Warnes', 'Cotoca', 'Montero', 'Otros',
] as const

export const BUSINESS_CATEGORIES = [
  { key: 'comida',        emoji: '🍕', label: 'Comida' },
  { key: 'reposteria',    emoji: '🧁', label: 'Repostería' },
  { key: 'tecnologia',    emoji: '💻', label: 'Tecnología' },
  { key: 'belleza',       emoji: '💇', label: 'Belleza' },
  { key: 'ropa',          emoji: '👗', label: 'Ropa & Moda' },
  { key: 'servicios',     emoji: '🔧', label: 'Servicios' },
  { key: 'fotografia',    emoji: '📸', label: 'Fotografía' },
  { key: 'automotriz',    emoji: '🚗', label: 'Automotriz' },
  { key: 'hogar',         emoji: '🏠', label: 'Hogar' },
  { key: 'educacion',     emoji: '🎓', label: 'Educación' },
  { key: 'electricistas', emoji: '⚡', label: 'Electricistas' },
  { key: 'carpinteria',   emoji: '🪑', label: 'Carpintería' },
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
