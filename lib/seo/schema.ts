// ─────────────────────────────────────────────────────────────────────────────
// KRUZO — schema.org structured-data builders (JSON-LD).
//
// Single source of truth for every schema the app emits. Builders return plain
// objects rendered through <JsonLd /> (XSS-safe serialization lives there).
// Optional fields are only included when real data exists — Google penalizes
// fabricated/empty structured data, so nothing here is ever invented.
// ─────────────────────────────────────────────────────────────────────────────
import { APP_NAME, APP_TAGLINE, APP_CITY, APP_COUNTRY } from '@/lib/utils/constants'
import { normalizeBolivianPhone } from '@/lib/utils/whatsapp'
import type { Business, BusinessSchedule } from '@/lib/types/business'
import type { Post } from '@/lib/types/post'

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://kruzo.bo').replace(/\/$/, '')

/** Sitewide Organization — who publishes KRUZO. Emitted once in the root layout. */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE}/#organization`,
    name: APP_NAME,
    url: BASE,
    slogan: APP_TAGLINE,
    logo: `${BASE}/icons/icon-512.png`,
    areaServed: `${APP_CITY}, ${APP_COUNTRY}`,
  }
}

/** Sitewide WebSite + SearchAction — enables the Google sitelinks search box. */
export function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE}/#website`,
    name: APP_NAME,
    url: BASE,
    inLanguage: 'es-BO',
    publisher: { '@id': `${BASE}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

const DAY_MAP: Record<keyof BusinessSchedule, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
  thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}

function openingHours(hours: BusinessSchedule | undefined) {
  if (!hours) return []
  return (Object.keys(DAY_MAP) as (keyof BusinessSchedule)[])
    .filter((d) => hours[d]?.open && hours[d]?.close)
    .map((d) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${DAY_MAP[d]}`,
      opens: hours[d]!.open,
      closes: hours[d]!.close,
    }))
}

/** LocalBusiness for a business profile — the core local-SEO rich result. */
export function localBusinessSchema(business: Business) {
  const url = `${BASE}/business/${business.slug}`
  const images = [business.coverImage, business.logo, ...(business.images ?? [])].filter(Boolean)
  const sameAs = [
    business.website,
    business.instagram ? `https://instagram.com/${business.instagram}` : '',
  ].filter(Boolean)
  const hoursSpec = openingHours(business.hours)

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${url}/#business`,
    name: business.name,
    description: business.description || business.tagline || undefined,
    url,
    ...(images.length ? { image: images } : {}),
    telephone: `+${normalizeBolivianPhone(business.phone || business.whatsapp)}`,
    address: {
      '@type': 'PostalAddress',
      ...(business.address ? { streetAddress: business.address } : {}),
      addressLocality: business.city || APP_CITY,
      addressRegion: 'Santa Cruz',
      addressCountry: 'BO',
    },
    ...(business.coordinates
      ? { geo: { '@type': 'GeoCoordinates', latitude: business.coordinates.lat, longitude: business.coordinates.lng } }
      : {}),
    ...(hoursSpec.length ? { openingHoursSpecification: hoursSpec } : {}),
    // Only emit ratings backed by real reviews (Cloud-Function-maintained).
    ...(business.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Number(business.rating.toFixed(1)),
            reviewCount: business.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  }
}

/** Product for a post (producto/servicio publicado). */
export function productSchema(post: Post) {
  const url = `${BASE}/post/${post.id}`
  const hasPrice = post.price > 0 && (post.priceType === 'fixed' || post.priceType === 'negotiable')
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: post.title,
    description: post.description,
    url,
    ...(post.images?.length ? { image: post.images } : {}),
    ...(post.category ? { category: post.category } : {}),
    brand: { '@type': 'Brand', name: post.businessName },
    ...(hasPrice
      ? {
          offers: {
            '@type': 'Offer',
            url,
            price: post.price,
            priceCurrency: 'BOB',
            availability: post.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: { '@type': 'LocalBusiness', name: post.businessName, url: `${BASE}/business/${post.businessSlug}` },
          },
        }
      : {}),
  }
}

/** BreadcrumbList — pass ordered items; the last one has no URL (current page). */
export function breadcrumbSchema(items: { name: string; path?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: `${BASE}${item.path}` } : {}),
    })),
  }
}
