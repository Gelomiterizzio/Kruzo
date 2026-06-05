/** @type {import('next').NextConfig} */

// ── Security headers ────────────────────────────────────────────────────────
// CSP is applied in PRODUCTION only (dev needs eval/inline for HMR + React
// Refresh). script-src uses 'unsafe-inline' because Next serves statically
// pre-rendered pages whose inline bootstrap scripts cannot carry a per-request
// nonce; every other directive is locked down and external origins are limited
// to exactly what the app talks to (Firebase/Google APIs, OSM tiles, Leaflet).
const isProd = process.env.NODE_ENV === 'production'

const contentSecurityPolicy = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  `frame-ancestors 'none'`,
  `form-action 'self'`,
  `script-src 'self' 'unsafe-inline'`,
  `style-src 'self' 'unsafe-inline' https://unpkg.com`,
  `img-src 'self' data: blob: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com https://images.unsplash.com https://avatars.githubusercontent.com https://*.tile.openstreetmap.org https://unpkg.com https://www.gstatic.com`,
  `font-src 'self' data:`,
  `connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.gstatic.com https://www.google.com`,
  `frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://www.google.com`,
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

  // Stable in Next.js 16 (moved out of experimental)
  optimizePackageImports: ['lucide-react', 'framer-motion'],

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },

  compress: true,
  poweredByHeader: false,
}

export default nextConfig
