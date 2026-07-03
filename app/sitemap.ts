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
  let postEntries: MetadataRoute.Sitemap = []
  try {
    const db = adminDb()
    const [bizSnap, postSnap] = await Promise.all([
      db.collection('businesses')
        .where('status', '==', 'active')
        .select('slug', 'updatedAt')
        .get(),
      db.collection('posts')
        .where('status', '==', 'active')
        .select('updatedAt')
        .limit(5000)
        .get(),
    ])

    businessEntries = bizSnap.docs
      .map((d) => d.data() as { slug?: string; updatedAt?: { toDate?: () => Date } })
      .filter((b) => !!b.slug)
      .map((b) => ({
        url: `${BASE}/business/${b.slug}`,
        lastModified: b.updatedAt?.toDate?.() ?? now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }))

    postEntries = postSnap.docs.map((d) => {
      const p = d.data() as { updatedAt?: { toDate?: () => Date } }
      return {
        url: `${BASE}/post/${d.id}`,
        lastModified: p.updatedAt?.toDate?.() ?? now,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }
    })
  } catch {
    // Firebase Admin not configured (e.g. CI build) — ship the static sitemap.
  }

  return [...staticEntries, ...businessEntries, ...postEntries]
}
