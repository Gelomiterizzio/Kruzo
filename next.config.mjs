/** @type {import('next').NextConfig} */
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
  optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-dialog'],

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'DENY'                          },
          { key: 'X-Content-Type-Options',     value: 'nosniff'                       },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin'},
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=(self)'},
        ],
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
