# KRUZO — Tu Ciudad. Tu Mercado.

> La plataforma comercial local de Santa Cruz de la Sierra, Bolivia.

KRUZO conecta emprendedores y negocios locales con su comunidad, ofreciendo un directorio inteligente, marketplace y red social comercial.

---

## 🚀 Stack tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| Estilos | TailwindCSS + Shadcn/ui |
| Animaciones | Framer Motion |
| Backend | Firebase (Firestore + Auth + Storage) |
| Búsqueda | Algolia |
| Mapas | Leaflet.js + OpenStreetMap |
| Deploy | Vercel |
| Estado | Zustand |
| Formularios | React Hook Form + Zod |

---

## 📁 Estructura del proyecto

```
kruzo/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/             # Páginas de autenticación
│   ├── (main)/             # Páginas públicas principales
│   ├── dashboard/          # Panel del emprendedor
│   └── admin/              # Panel administrativo
├── components/             # Componentes React
│   ├── business/           # Negocio: cards, profile, form
│   ├── home/               # Secciones del home
│   ├── layout/             # Navbar, Footer, Sidebar
│   ├── map/                # Mapa interactivo
│   ├── post/               # Publicaciones: cards, form, grid
│   ├── review/             # Reseñas y calificaciones
│   ├── search/             # Búsqueda y filtros
│   └── shared/             # Componentes reutilizables
├── lib/
│   ├── firebase/           # Configuración y servicios Firebase
│   ├── hooks/              # Custom hooks
│   ├── store/              # Estado global (Zustand)
│   ├── types/              # TypeScript types
│   └── utils/              # Utilidades
├── providers/              # React context providers
└── public/                 # Assets estáticos
```

---

## ⚡ Instalación y desarrollo

### 1. Clonar y instalar dependencias

```bash
git clone https://github.com/tu-usuario/kruzo.git
cd kruzo
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Firebase — Crear proyecto en https://console.firebase.google.com
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Google Maps — https://console.cloud.google.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...

# Algolia — https://algolia.com (opcional)
NEXT_PUBLIC_ALGOLIA_APP_ID=...
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=...
```

### 3. Configurar Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar **Firestore Database** (modo producción)
3. Habilitar **Authentication** (Google + Email/Password)
4. Habilitar **Storage**
5. Desplegar reglas:

```bash
npm run firebase:deploy-rules
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Configurar primer admin

1. Regístrate en la plataforma con Google o Email
2. Copia tu UID de Firebase Auth Console
3. En Firestore, edita `users/{tu-uid}` → `role: "admin"`

---

## 🚀 Deploy en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

O conecta el repositorio en [vercel.com](https://vercel.com) y configura las variables de entorno en el dashboard.

---

## 📱 Funcionalidades principales

### Para usuarios
- 🔍 Búsqueda inteligente de negocios y productos
- 🗺️ Mapa interactivo de negocios
- ❤️ Sistema de favoritos
- ⭐ Reseñas y calificaciones
- 📱 Contacto directo por WhatsApp

### Para emprendedores
- 🏪 Perfil completo de negocio con galería
- 📸 Publicaciones con fotos, precio y stock
- 📊 Panel de estadísticas
- 🕐 Horarios de atención
- 🚚 Opción de delivery

### Para administradores
- ✅ Aprobación y verificación de negocios
- ⭐ Gestión de negocios destacados
- 👥 Gestión de usuarios y roles
- 📋 Moderación de contenido
- 📈 Estadísticas generales

---

## 🎨 Identidad visual

- **Color primario:** `#ff4500` (Naranja fuego)
- **Color oscuro:** `#0a0e1a` (Azul profundo)
- **Color dorado:** `#fbbf24` (Premium)
- **Font display:** Bricolage Grotesque
- **Font body:** Inter

---

## 📄 Licencia

© 2025 KRUZO. Todos los derechos reservados.

---

*Hecho con ❤️ en Santa Cruz de la Sierra, Bolivia 🇧🇴*
