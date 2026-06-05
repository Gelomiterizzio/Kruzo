import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kruzo.bo'

export function buildMetadata(opts: {
  title: string; description: string; image?: string; path?: string; noIndex?: boolean
}): Metadata {
  const { title, description, image, path = '', noIndex } = opts
  const url = `${BASE_URL}${path}`
  const ogImage = image ?? `${BASE_URL}/og-default.jpg`
  return {
    title: `${title} | KRUZO`,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: { canonical: url },
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',
    openGraph: {
      title, description, url, siteName: 'KRUZO',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      locale: 'es_BO', type: 'website',
    },
    twitter: {
      card: 'summary_large_image', title, description, images: [ogImage],
    },
  }
}
