# KRUZO Web — Runbook de despliegue a producción

Guía única y ordenada para publicar la web en Vercel. El código ya está listo;
todo lo que sigue son pasos de **infraestructura sobre tu cuenta** que nadie más
puede ejecutar por ti. Hazlos en orden — cada paso indica cómo verificarlo.

---

## 0. Requisitos previos

- Proyecto de Firebase con **Firestore**, **Authentication** (Google + Email/Password)
  y **Storage** habilitados, en plan **Blaze** (las Cloud Functions lo requieren).
- Cuenta de Vercel con acceso al repo `Gelomiterizzio/Kruzo`.
- Firebase CLI autenticada: `npx firebase login`.

## 1. Desplegar reglas, índices y funciones de Firebase

Las reglas del repo (probadas con `npm run test:rules`, 67/67) deben quedar
activas en el proyecto REAL — hasta entonces producción sigue con las antiguas:

```bash
# desde web/
npm run firebase:deploy-rules            # firestore.rules + firestore.indexes.json
npx firebase deploy --only storage       # storage.rules (ownership cross-service)
npx firebase deploy --only functions     # contadores, notificaciones, deleteAccount
```

**Verificar:** en Firebase Console → Firestore → Reglas debe verse
`allow read: if isAuth() && (request.auth.uid == uid || isAdmin())` en `users`.
En Functions deben aparecer `onReviewWritten`, `onUserFavoritesWritten`,
`onBusinessWritten` y `deleteAccount` en `southamerica-east1`.

> Sin las funciones desplegadas, los ratings/contadores NO se actualizan y las
> notificaciones no se crean. Es dependencia dura, no opcional.

## 2. Variables de entorno en Vercel

Project → Settings → Environment Variables (entorno **Production**; añade
Preview si quieres deploys de PR funcionales):

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` … `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Los 7 valores del SDK Web (Firebase Console → Project settings → General) |
| `NEXT_PUBLIC_APP_URL` | La URL canónica final, p. ej. `https://kruzo.bo` (sin barra final) |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | JSON completo de la cuenta de servicio **en una sola línea** (Console → Project settings → Service accounts → Generate new private key) |
| `NEXT_PUBLIC_FIREBASE_APPCHECK_KEY` | (Recomendado) site key de reCAPTCHA v3 — ver paso 5 |

> Sin la service account no se emiten session cookies: `/dashboard`, `/admin` y
> `/settings` redirigen a login para siempre, y los perfiles públicos `/user/[id]`
> devuelven 404. Es obligatoria.

## 3. Dominios autorizados en Firebase Auth

Firebase Console → Authentication → Settings → **Authorized domains**: añade el
dominio de producción (`kruzo.bo`) y el dominio `*.vercel.app` del proyecto.
Sin esto, `signInWithPopup` de Google falla con `auth/unauthorized-domain`.

## 4. Primer administrador

1. Regístrate normalmente en la web desplegada.
2. Copia tu UID (Authentication → Users).
3. En Firestore, edita `users/{tu-uid}` → `role: "admin"`.

Desde ahí, el resto de admins se gestionan desde `/admin/users`.

## 5. App Check (recomendado, mitiga bots/abuso)

1. Crea una site key **reCAPTCHA v3** y regístrala en Console → App Check.
2. Pon la key en `NEXT_PUBLIC_FIREBASE_APPCHECK_KEY` (Vercel) y redeploya.
3. Activa **Enforcement** para Firestore y Storage cuando veas tráfico verificado.

## 6. Buzón de contacto

La política de privacidad y la página de contacto publican `hola@kruzo.bo`.
**Crea ese buzón** (o alias) antes del lanzamiento — es el canal legal de
solicitudes de datos.

## 7. Smoke test post-deploy (5 minutos)

- [ ] Home carga con datos reales y sin errores en consola
- [ ] Registro con email + login con Google funcionan en el dominio final
- [ ] Crear negocio → aparece "pendiente" → aprobar desde `/admin/businesses`
- [ ] Subir logo/portada (Storage con ownership) y publicar un post con foto
- [ ] Dejar una reseña con otro usuario → el rating del negocio se actualiza
      (confirma que las Functions corren) → responderla desde `/dashboard/reviews`
- [ ] `/sitemap.xml` lista negocios y posts; `/robots.txt` correcto
- [ ] Ver el HTML de un negocio: JSON-LD `LocalBusiness` presente
      (valida en https://search.google.com/test/rich-results)
- [ ] Eliminar una cuenta de prueba desde Configuración → desaparecen su
      negocio, posts y reseñas

## 8. Después del lanzamiento

- Envía `https://kruzo.bo/sitemap.xml` en Google Search Console.
- Vigila Vercel → Observability y Firebase → Usage los primeros días.
- ⚠️ **Móvil:** las reglas nuevas hacen privada la colección `users`. Antes de
  publicar la app Android, verifica que no lea perfiles de OTROS usuarios con el
  SDK cliente (los propios sí puede). Si lo hace, exponer un endpoint/callable
  equivalente a `getPublicUserProfile`.
