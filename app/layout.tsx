import type { Metadata, Viewport } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { MotionProvider } from '@/providers/MotionProvider'
import { ServiceWorkerRegister } from '@/components/shared/ServiceWorkerRegister'
import { AdSenseScript } from '@/components/ads/AdSenseScript'
import { JsonLd } from '@/components/seo/JsonLd'
import { organizationSchema, webSiteSchema } from '@/lib/seo/schema'
import { Toaster } from 'sonner'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  axes: ['opsz'],
})

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kruzo.bo'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'KRUZO — Tu Ciudad. Tu Mercado.',
    template: '%s | KRUZO',
  },
  description:
    'Descubre negocios, emprendimientos y servicios de Santa Cruz de la Sierra, Bolivia. Conecta con tu comunidad local por WhatsApp.',
  keywords: ['Santa Cruz', 'Bolivia', 'negocios', 'emprendimientos', 'marketplace', 'servicios locales', 'KRUZO'],
  applicationName: 'KRUZO',
  authors: [{ name: 'KRUZO', url: APP_URL }],
  creator: 'KRUZO',
  publisher: 'KRUZO',
  openGraph: {
    type: 'website',
    locale: 'es_BO',
    url: APP_URL,
    siteName: 'KRUZO',
    title: 'KRUZO — Tu Ciudad. Tu Mercado.',
    description: 'Descubre negocios y emprendimientos de Santa Cruz de la Sierra.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'KRUZO — Tu Ciudad. Tu Mercado.', type: 'image/png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KRUZO — Tu Ciudad. Tu Mercado.',
    description: 'Descubre negocios locales en Santa Cruz de la Sierra, Bolivia.',
    images: ['/og-default.png'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'KRUZO', statusBarStyle: 'default' },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdfaf5' },
    { media: '(prefers-color-scheme: dark)',  color: '#0d0b09'  },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${syne.variable} font-sans min-h-screen`}>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={webSiteSchema()} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2.5 focus:bg-primary focus:text-white focus:rounded-xl focus:text-sm focus:font-semibold focus:shadow-lg"
        >
          Saltar al contenido principal
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MotionProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster
                richColors
                position="top-right"
                closeButton
                toastOptions={{ duration: 4000 }}
              />
              <ServiceWorkerRegister />
            </AuthProvider>
            <AdSenseScript />
          </QueryProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
