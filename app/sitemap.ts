import type { MetadataRoute } from 'next'
import { adminDb } from '@/lib/firebase/admin'

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://kruzo.bo').replace(/\/$/, '')

// Refresh hourly so newly approved businesses are picked up without a redeploy.
export const revalidate = 3600

const STATIC_ROUTES = ['', '/explore', '/search', '/trending', '/about', '/contact', '/terms', '/privacy']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))

  let businessEntries: MetadataRoute.Sitemap = []
  try {
    const snap = await adminDb()
      .collection('businesses')
      .where('status', '==', 'active')
      .select('slug', 'updatedAt')
      .get()

    businessEntries = snap.docs
      .map((d) => d.data() as { slug?: string; updatedAt?: { toDate?: () => Date } })
      .filter((b) => !!b.slug)
      .map((b) => ({
        url: `${BASE}/business/${b.slug}`,
        lastModified: b.updatedAt?.toDate?.() ?? now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }))
  } catch {
    // Firebase Admin not configured (e.g. CI build) — ship the static sitemap.
  }

  return [...staticEntries, ...businessEntries]
}
