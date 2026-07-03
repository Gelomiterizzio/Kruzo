<div align="center">

# KRUZO — Tu Ciudad. Tu Mercado.

**El directorio inteligente y marketplace local de Santa Cruz de la Sierra, Bolivia.**

[![CI](https://github.com/Gelomiterizzio/Kruzo/actions/workflows/ci.yml/badge.svg)](https://github.com/Gelomiterizzio/Kruzo/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-ff4500.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org)

</div>

---

## 🎯 Qué es y qué problema resuelve

Miles de emprendedores y negocios locales de Santa Cruz venden únicamente por WhatsApp e Instagram, sin presencia descubrible ni reputación verificable. **KRUZO** les da un perfil profesional, indexable y compartible, y a los compradores un único lugar para **descubrir, comparar y contactar** negocios cercanos — con un solo toque a WhatsApp.

- **Para usuarios:** búsqueda y filtros por categoría/zona, mapa interactivo, favoritos, reseñas y contacto directo por WhatsApp.
- **Para emprendedores:** perfil de negocio con galería, publicaciones con precio/stock, panel de estadísticas, horarios y delivery.
- **Para administradores:** aprobación/verificación de negocios, destacados, gestión de usuarios y roles, moderación y métricas.

---

## 🧱 Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | **Next.js 16** (App Router, React 19, Server Components) |
| Lenguaje | **TypeScript** (strict) |
| Estilos | **TailwindCSS** + CSS variables (tema claro/oscuro con `next-themes`) |
| Datos (cliente) | **TanStack React Query** (`useInfiniteQuery`) |
| Estado local | **Zustand** |
| Backend | **Firebase** — Firestore · Auth · Storage · App Check (opcional) |
| Auth en servidor | **Firebase Admin SDK** — session cookies httpOnly + verificación de rol |
| Formularios | **React Hook Form** + **Zod** |
| Mapas | **Leaflet** + **OpenStreetMap** |
| UI / animación | **lucide-react**, **framer-motion**, **sonner** |
| Deploy | **Vercel** |
| CI | **GitHub Actions** (typecheck · lint · build) |

---

## 🏗️ Arquitectura

```
app/                      # Next.js App Router
├── (auth)/               # login · register · forgot-password
├── (main)/               # home · explore · search · business/[slug] · post/[id] · user/[id]
├── dashboard/            # panel del emprendedor (protegido)
├── admin/                # panel admin (protegido + verificación de rol en servidor)
├── api/session/          # mintea/borra la session cookie (Admin SDK)
├── api/account/          # eliminación completa de cuenta (paridad con la política §10)
├── api/admin/ban/        # ban/unban server-side + revocación de refresh tokens
├── sitemap.ts            # sitemap dinámico (rutas + negocios y posts activos)
├── robots.ts             # robots.txt
└── layout.tsx            # metadata, OG, PWA, JSON-LD (Organization/WebSite), providers
components/               # business · home · layout · map · post · review · search · seo · shared
lib/
├── firebase/             # config (Web SDK), admin (server), auth, firestore, storage
├── hooks/                # useBusinesses / usePosts / useReviews (React Query) · useAuth · ...
├── seo/                  # builders de schema.org (LocalBusiness, Product, Breadcrumb…)
├── store/                # Zustand
├── types/                # modelos de dominio
└── utils/                # constants (única fuente de verdad: zonas/categorías) · formatters · ...
providers/                # Theme · Auth · Query
proxy.ts                  # (Next 16, ex-middleware) redirecciones de auth por session cookie
firestore.rules           # reglas de seguridad (suite: npm run test:rules)
firestore.indexes.json    # índices compuestos
storage.rules             # reglas de Storage (ownership cross-service vía Firestore)
```

**Decisiones clave**

- **Autenticación:** el cliente intercambia su Firebase ID token por una **session cookie httpOnly** (`/api/session`, Admin SDK). El `middleware` la usa para proteger rutas; el layout de `/admin` **verifica el rol en el servidor**.
- **Datos:** los listados usan **React Query** con paginación por cursor de Firestore.
- **Seguridad:** CSP estricta en producción, popups del mapa sanitizados (anti-XSS), reglas de Firestore (una reseña por usuario, contadores acotados) y **App Check** opcional.
- **Fuente única de verdad:** zonas y categorías viven en `lib/utils/constants.ts`.

---

## ⚡ Puesta en marcha

### 1. Requisitos
- Node.js **20+**
- Un proyecto de [Firebase](https://console.firebase.google.com) con **Firestore**, **Authentication** (Google + Email/Password) y **Storage** habilitados.

### 2. Instalar
```bash
git clone https://github.com/Gelomiterizzio/Kruzo.git
cd Kruzo
npm install
```

### 3. Variables de entorno
```bash
cp .env.example .env.local
```
Completá `.env.local` (ver [Variables de entorno](#-variables-de-entorno)).

### 4. Reglas e índices de Firebase
```bash
npm run firebase:deploy-rules   # firestore.rules + firestore.indexes.json
firebase deploy --only storage  # storage.rules (requiere Firebase CLI logueado)
```

### 5. Desarrollo
```bash
npm run dev
```
Abrí [http://localhost:3000](http://localhost:3000).

### 6. Primer administrador
Registrate, copiá tu UID desde Firebase Auth y en Firestore poné `users/{tu-uid}.role = "admin"`.

---

## 📜 Scripts

| Script | Acción |
|--------|--------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint (flat config) |
| `npm run type-check` | `tsc --noEmit` |
| `npm run firebase:emulate` | Emuladores de Firebase |
| `npm run firebase:deploy-rules` | Despliega reglas + índices de Firestore |
| `node scripts/generate-pwa-assets.mjs` | Regenera el OG y los iconos PWA |

---

## 🔐 Variables de entorno

> `NEXT_PUBLIC_*` se exponen al navegador (la config Web de Firebase es pública por diseño; la seguridad la dan las reglas). El resto son **secretos de servidor**.

**Públicas**
| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` … `_APP_ID` | Config del Firebase Web SDK |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Analytics (opcional) |
| `NEXT_PUBLIC_APP_URL` | URL canónica (metadata, OG, sitemap, robots) |
| `NEXT_PUBLIC_FIREBASE_APPCHECK_KEY` | Site key reCAPTCHA v3 para App Check (opcional) |

**Secretas (solo servidor)**
| Variable | Descripción |
|----------|-------------|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | JSON de cuenta de servicio en una línea **(o)** |
| `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | Campos discretos de la cuenta de servicio |

La cuenta de servicio del Admin SDK es **obligatoria**: sin ella no se pueden emitir session cookies y las rutas protegidas quedan inaccesibles.

---

## 🚀 Deploy (Vercel)

Runbook completo y ordenado (reglas, funciones, envs, dominios, App Check,
primer admin y smoke test): **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)**.

Resumen: importá el repo en Vercel → cargá las variables de entorno → deploy.
Los headers de seguridad (incluida la CSP de producción) salen de
`next.config.mjs`; reglas/índices/funciones se despliegan con la Firebase CLI.

---

## 🔎 SEO & PWA

- **SEO:** `sitemap.xml` dinámico (rutas públicas + negocios activos), `robots.txt`, metadata + **Open Graph** (`/og-default.png`, 1200×630) y Twitter Card.
- **PWA:** `manifest.json` con iconos 192/512 + maskable, `apple-touch-icon`, y un service worker mínimo (instalable + shell offline básico). Compatible con iOS y Android.

---

## 🛡️ Seguridad

- **PII privada:** la colección `users` (email, teléfono, preferencias) solo la
  lee su dueño o un admin; los perfiles públicos se sirven por Admin SDK con
  proyección explícita de campos públicos.
- Session cookies httpOnly + verificación de rol admin en servidor; el ban
  revoca los refresh tokens (las sesiones activas mueren de inmediato).
- Eliminación de cuenta completa (negocios, posts y reseñas) en paridad con la
  política de privacidad y con la app móvil.
- Storage con **ownership real**: las reglas validan `ownerId` contra Firestore
  (cross-service) — nadie puede subir a carpetas ajenas.
- CSP estricta en producción y cabeceras de seguridad centralizadas en `next.config.mjs`.
- Reglas de Firestore probadas en emulador: `npm run test:rules` (67 casos).
- Popups del mapa sanitizados (HTML-escaping) — sin XSS almacenado.
- Formulario de contacto con shape bloqueado en reglas + honeypot anti-bots.
- Firebase App Check (opcional) para mitigar tráfico no autenticado/bots.

---

## 📄 Licencia

[MIT](./LICENSE) © 2026 KRUZO

<div align="center"><sub>Hecho con ❤️ en Santa Cruz de la Sierra, Bolivia 🇧🇴</sub></div>
