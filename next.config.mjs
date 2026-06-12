/** @type {import('next').NextConfig} */

// ── Security headers ────────────────────────────────────────────────────────
// CSP is applied in PRODUCTION only (dev needs eval/inline for HMR + React
// Refresh). script-src uses 'unsafe-inline' because Next serves statically
// pre-rendered pages whose inline bootstrap scripts cannot carry a per-request
// nonce; every other directive is locked down and external origins are limited
// to exactly what the app talks to (Firebase/Google APIs, OSM tiles, Leaflet).
const isProd = process.env.NODE_ENV === 'production'

// AdSense CSP allowances — only added when a publisher id is configured, so the
// policy stays locked down whenever ads are switched off. Covers the loader,
// ad iframes/fenced-frames, creative images and the ad-quality beacons.
const adsEnabled = !!process.env.NEXT_PUBLIC_ADSENSE_CLIENT
const ads = adsEnabled
  ? {
      script: [
        'https://pagead2.googlesyndication.com',
        'https://*.googlesyndication.com',
        'https://partner.googleadservices.com',
        'https://tpc.googlesyndication.com',
        'https://www.googletagservices.com',
        'https://adservice.google.com',
        'https://*.adtrafficquality.google',
      ],
      frame: [
        'https://googleads.g.doubleclick.net',
        'https://tpc.googlesyndication.com',
        'https://*.googlesyndication.com',
        'https://*.doubleclick.net',
        'https://*.adtrafficquality.google',
      ],
      img: [
        'https://*.googlesyndication.com',
        'https://*.g.doubleclick.net',
        'https://*.google.com',
        'https://*.adtrafficquality.google',
      ],
      connect: [
        'https://pagead2.googlesyndication.com',
        'https://*.googlesyndication.com',
        'https://*.google.com',
        'https://*.doubleclick.net',
        'https://*.g.doubleclick.net',
        'https://*.adtrafficquality.google',
      ],
    }
  : { script: [], frame: [], img: [], connect: [] }

const join = (...parts) => parts.flat().filter(Boolean).join(' ')

const contentSecurityPolicy = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  `frame-ancestors 'none'`,
  `form-action 'self'`,
  join(`script-src 'self' 'unsafe-inline'`, ads.script),
  `style-src 'self' 'unsafe-inline' https://unpkg.com`,
  join(
    `img-src 'self' data: blob: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com https://images.unsplash.com https://avatars.githubusercontent.com https://*.tile.openstreetmap.org https://unpkg.com https://www.gstatic.com`,
    ads.img,
  ),
  `font-src 'self' data:`,
  join(`connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.gstatic.com https://www.google.com`, ads.connect),
  join(`frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://www.google.com`, ads.frame),
  ...(adsEnabled ? [join('fenced-frame-src', ads.frame)] : []),
  `worker-src 'self' blob:`,
  `manifest-src 'self'`,
  `upgrade-insecure-requests`,
].join('; ')

const securityHeaders = [
  { key: 'X-Frame-Options',        value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=(self)' },
  ...(isProd ? [{ key: 'Content-Security-Policy', value: contentSecurityPolicy }] : []),
]

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
  },

  // Webpack config for leaflet (browser-only SSR fix)
  // Used when building with: next build --webpack
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'leaflet']
    }
    return config
  },

  // Turbopack config for `next dev` (Next.js 16 default)
  // Prevents leaflet from being resolved on the server during dev
  turbopack: {
    resolveAlias: {
      leaflet: {
        browser: 'leaflet',
        default: './turbopack-leaflet-empty.js',
      },
    },
  },

  // Next.js 16.2 still expects this under `experimental` (a top-level key is
  // rejected as "unrecognized" and silently ignored).
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Note: no custom Cache-Control for /_next/static — Next already serves
      // hashed assets as immutable, and overriding it breaks dev behavior.
    ]
  },

  compress: true,
  poweredByHeader: false,
}

export default nextConfig
