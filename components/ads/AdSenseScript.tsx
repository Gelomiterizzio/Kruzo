// Loads the AdSense library once, after hydration, so it never competes with
// LCP/INP. Renders nothing when AdSense is not configured. Server Component.
import Script from 'next/script'
import { ADSENSE_CLIENT, ADS_ENABLED } from '@/lib/ads/config'

export function AdSenseScript() {
  if (!ADS_ENABLED) return null
  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  )
}
