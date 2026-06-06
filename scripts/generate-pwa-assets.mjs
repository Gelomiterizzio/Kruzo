/**
 * Generates the production raster assets (OG image + PWA icons) from the KRUZO
 * brand SVGs. Run with: node scripts/generate-pwa-assets.mjs
 * Requires `sharp` (already a dependency).
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')
const icons = join(pub, 'icons')

const FONT = 'Arial, Helvetica, system-ui, sans-serif'

// 1200x630 Open Graph image
const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff4500" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#0a0e1a" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#0a0e1a"/>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="80" y="78" width="96" height="96" rx="24" fill="#ff4500"/>
  <text x="128" y="148" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="62" fill="#ffffff">K</text>
  <text x="80" y="350" font-family="${FONT}" font-weight="900" font-size="110" fill="#ffffff">KRUZO</text>
  <text x="84" y="420" font-family="${FONT}" font-weight="700" font-size="40" fill="#ff7a45">Tu Ciudad. Tu Mercado.</text>
  <text x="84" y="500" font-family="${FONT}" font-size="28" fill="rgba(255,255,255,0.55)">Directorio y marketplace local · Santa Cruz de la Sierra, Bolivia</text>
</svg>`

// Icon (rounded) and maskable (full-bleed, logo in safe zone)
const iconSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="115" fill="#ff4500"/>
  <text x="256" y="372" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="320" fill="#ffffff">K</text>
</svg>`

const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#ff4500"/>
  <text x="256" y="348" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="248" fill="#ffffff">K</text>
</svg>`

await mkdir(icons, { recursive: true })
const png = (svg) => sharp(Buffer.from(svg)).png()

await png(ogSvg).toFile(join(pub, 'og-default.png'))
await png(iconSvg(512)).resize(192, 192).toFile(join(icons, 'icon-192.png'))
await png(iconSvg(512)).resize(512, 512).toFile(join(icons, 'icon-512.png'))
await png(maskableSvg).resize(512, 512).toFile(join(icons, 'icon-maskable-512.png'))
await png(iconSvg(512)).resize(180, 180).toFile(join(icons, 'apple-touch-icon.png'))

console.log('Generated: og-default.png, icons/{icon-192,icon-512,icon-maskable-512,apple-touch-icon}.png')
