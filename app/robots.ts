import type { MetadataRoute } from 'next'

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://kruzo.bo').replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private / non-indexable areas.
      disallow: [
        '/dashboard',
        '/admin',
        '/api',
        '/settings',
        '/notifications',
        '/favorites',
        '/login',
        '/register',
        '/forgot-password',
      ],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
