// Serves /ads.txt from the configured publisher id (single source of truth).
// Returns 404 when AdSense is not configured, so we never publish a stale file.
import { ADSENSE_CLIENT, ADS_ENABLED } from '@/lib/ads/config'

export const dynamic = 'force-static'

export function GET() {
  if (!ADS_ENABLED) {
    return new Response('Not found', { status: 404 })
  }
  // "ca-pub-1234…" → ads.txt expects the "pub-1234…" form.
  const publisher = ADSENSE_CLIENT.replace(/^ca-/, '')
  const body = `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
