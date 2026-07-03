import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Política de privacidad oficial de KRUZO: qué datos recopilamos, cómo los usamos, cómo los protegemos y cómo eliminar tu cuenta.",
  alternates: { canonical: "/privacy" },
};

// ── Datos de contacto / responsable ─────────────────────────────────────────
// El alta del buzón es un paso del runbook de lanzamiento (docs/DEPLOYMENT.md §6).
const CONTACT_EMAIL = "hola@kruzo.bo";
const LAST_UPDATED = "14 de junio de 2026";

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl pt-24 pb-16">
      <article className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-display">
        <h1>Política de privacidad de KRUZO</h1>
        <p className="lead">Última actualización: {LAST_UPDATED}</p>

        <p>
          KRUZO (&ldquo;la plataforma&rdquo;, &ldquo;nosotros&rdquo;) es un
          marketplace de negocios y emprendimientos locales de Santa Cruz de la
          Sierra, Bolivia, disponible como sitio web y como aplicación Android.
          Esta política describe con precisión qué datos personales recopilamos,
          para qué los usamos, dónde se almacenan, con quién se comparten y qué
          derechos tienes sobre ellos. Aplica tanto al sitio web como a la
          aplicación móvil, salvo donde se indique lo contrario.
        </p>

        <h2>1. Datos que recopilamos</h2>

        <h3>1.1 Datos de cuenta</h3>
        <ul>
          <li>
            <strong>Registro con email:</strong> tu dirección de email y una
            contraseña. La contraseña la gestiona Firebase Authentication de
            forma cifrada; nosotros nunca la vemos ni la almacenamos en texto
            plano.
          </li>
          <li>
            <strong>Inicio de sesión con Google:</strong> tu nombre, email y
            foto de perfil, tal como los comparte Google al autorizar el acceso.
          </li>
        </ul>

        <h3>1.2 Datos de perfil (opcionales, los completas tú)</h3>
        <ul>
          <li>Nombre visible y foto de perfil.</li>
          <li>
            Teléfono, biografía y ciudad (campo de texto libre; por defecto
            &ldquo;Santa Cruz de la Sierra, Bolivia&rdquo;).
          </li>
          <li>Preferencias de notificaciones.</li>
        </ul>

        <h3>1.3 Contenido que publicas</h3>
        <ul>
          <li>
            <strong>Negocios:</strong> si registras un negocio, la información
            comercial que publiques (nombre, descripción, dirección, zona,
            teléfono/WhatsApp, email, sitio web, horarios, fotos). Esta
            información es <strong>pública por diseño</strong>: existe para que
            los clientes encuentren y contacten al negocio.
          </li>
          <li>
            <strong>Publicaciones:</strong> productos o servicios que anuncies
            (título, descripción, precio, fotos).
          </li>
          <li>
            <strong>Reseñas:</strong> la calificación y el comentario que dejes
            en un negocio se muestran junto a tu nombre y foto de perfil.
          </li>
          <li>
            <strong>Fotos:</strong> las imágenes que subas desde tu galería o
            cámara se almacenan en Firebase Storage (límite de 5 MB por imagen).
          </li>
        </ul>

        <h3>1.4 Datos de actividad</h3>
        <ul>
          <li>Tus favoritos (negocios guardados).</li>
          <li>
            Contadores agregados y anónimos (visitas a perfiles, cantidad de
            favoritos, promedios de calificación). No registramos qué usuario
            concreto visitó qué negocio.
          </li>
          <li>Fecha de creación de la cuenta y de última actividad.</li>
        </ul>

        <h3>1.5 Notificaciones push (solo app, opcional)</h3>
        <p>
          Si aceptas recibir notificaciones, se genera un token de dispositivo
          (Expo/Firebase Cloud Messaging) que se asocia a tu cuenta para poder
          entregarlas. Puedes revocarlo desactivando las notificaciones en los
          ajustes de Android.
        </p>

        <h2>2. Datos que NO recopilamos</h2>
        <ul>
          <li>
            <strong>Ubicación del dispositivo:</strong> la app{" "}
            <strong>no</strong> solicita permisos de ubicación ni accede al GPS.
            El mapa de un negocio muestra la dirección que su dueño publicó, no
            tu posición.
          </li>
          <li>
            <strong>Contactos, SMS, registros de llamadas o micrófono:</strong>{" "}
            no se solicitan ni se usan.
          </li>
          <li>
            <strong>Datos de pago:</strong> KRUZO no procesa pagos ni almacena
            datos financieros.
          </li>
          <li>
            <strong>Publicidad y rastreo en la app:</strong> la aplicación
            Android no muestra anuncios, no integra SDKs publicitarios ni usa el
            identificador de publicidad, y no incluye SDK de analítica.
          </li>
          <li>
            El contacto con los negocios ocurre por{" "}
            <strong>WhatsApp o llamada telefónica fuera de KRUZO</strong>; esas
            conversaciones no pasan por nuestros sistemas.
          </li>
        </ul>

        <h2>3. Permisos de la aplicación Android</h2>
        <ul>
          <li>
            <strong>Internet / estado de red:</strong> funcionamiento básico y
            modo sin conexión.
          </li>
          <li>
            <strong>Cámara y fotos/galería:</strong> solo cuando eliges subir
            imágenes de tu negocio, publicaciones o perfil. Nunca accedemos a tu
            galería en segundo plano.
          </li>
          <li>
            <strong>Notificaciones:</strong> para avisos como nuevas reseñas o
            la aprobación de tu negocio.
          </li>
        </ul>

        <h2>4. Dónde se almacenan tus datos</h2>
        <ul>
          <li>
            <strong>En nuestros servidores (Google Firebase):</strong> cuenta y
            perfil (Firebase Authentication y Cloud Firestore), imágenes
            (Firebase Storage) y funciones del servidor (Cloud Functions). La
            base de datos y las funciones operan en la región{" "}
            <em>southamerica-east1</em> (São Paulo, Brasil); otros servicios de
            Google pueden procesar datos en centros de datos de Google en otras
            regiones, con las salvaguardas contractuales estándar de Google (ver
            sección 9).
          </li>
          <li>
            <strong>En tu dispositivo:</strong> tu sesión iniciada, una caché
            temporal de contenido (para uso sin conexión, expira en 24 h), tus
            favoritos y tu preferencia de tema. Se eliminan al cerrar sesión o
            desinstalar la app.
          </li>
        </ul>

        <h2>5. Cómo usamos los datos</h2>
        <ul>
          <li>
            Operar la plataforma: mostrar negocios, publicaciones, reseñas y
            favoritos.
          </li>
          <li>
            Mantener tu sesión iniciada y sincronizar tu cuenta entre web y app.
          </li>
          <li>
            Enviar notificaciones dentro de la plataforma y push (si las
            aceptaste).
          </li>
          <li>
            Calcular estadísticas agregadas y reales para los dueños de
            negocios.
          </li>
          <li>
            Moderar contenido y prevenir abuso (aprobación de negocios,
            suspensiones).
          </li>
        </ul>
        <p>
          <strong>No vendemos tus datos personales</strong> ni los compartimos
          con terceros con fines de marketing.
        </p>

        <h2>6. Servicios de terceros</h2>
        <p>
          Usamos los siguientes proveedores como encargados del tratamiento:
        </p>
        <ul>
          <li>
            <strong>Google Firebase</strong> (autenticación, base de datos,
            almacenamiento, funciones, notificaciones FCM) —{" "}
            <a
              href="https://firebase.google.com/support/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              privacidad de Firebase
            </a>
            .
          </li>
          <li>
            <strong>Google Sign-In</strong> (inicio de sesión opcional) —{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              política de Google
            </a>
            .
          </li>
          <li>
            <strong>Google Maps</strong> (mapa de la ubicación de los negocios):
            al cargar el mapa, Google recibe datos técnicos estándar de la
            solicitud (como tu dirección IP).
          </li>
          <li>
            <strong>Expo</strong> (entrega de notificaciones push en la app) —{" "}
            <a
              href="https://expo.dev/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              privacidad de Expo
            </a>
            .
          </li>
          <li>
            <strong>Solo en el sitio web:</strong> Firebase Analytics (métricas
            de uso agregadas) y, si se muestran anuncios de Google AdSense,
            Google puede usar cookies para personalizarlos y medirlos (gestiona
            tus preferencias en{" "}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              adssettings.google.com
            </a>
            ). La app Android no incluye analítica ni anuncios.
          </li>
        </ul>

        <h2>7. Cookies (solo sitio web)</h2>
        <p>
          El sitio usa una cookie de sesión propia y estrictamente necesaria
          para mantenerte autenticado. Las cookies de terceros solo aparecen si
          hay anuncios activos (sección 6). La aplicación Android no usa
          cookies.
        </p>

        <h2>8. Seguridad</h2>
        <ul>
          <li>Todos los datos viajan cifrados (TLS/HTTPS).</li>
          <li>
            El acceso a la base de datos está gobernado por reglas de seguridad
            de Firestore validadas: cada usuario solo puede modificar sus
            propios datos, y los campos sensibles (roles, verificaciones,
            sanciones) solo pueden cambiarlos administradores o el servidor.
          </li>
          <li>
            Las contraseñas las gestiona Firebase Authentication; nunca se
            almacenan en texto plano.
          </li>
          <li>
            La eliminación de cuenta la ejecuta una función del servidor con
            privilegios auditados.
          </li>
        </ul>

        <h2>9. Transferencias internacionales</h2>
        <p>
          Tus datos se procesan en la infraestructura global de Google Cloud
          (principalmente en São Paulo, Brasil). Cuando el procesamiento ocurre
          fuera de tu país, se aplica el marco contractual y las medidas de
          protección de datos de Google (incluidas cláusulas contractuales
          tipo).
        </p>

        <h2>10. Eliminación de cuenta y conservación</h2>
        <p>
          Puedes eliminar tu cuenta de forma permanente{" "}
          <strong>desde la propia app</strong> (Configuración → Eliminar cuenta)
          o desde el sitio web (Configuración). Al confirmar:
        </p>
        <ul>
          <li>se elimina tu cuenta de acceso (email/Google);</li>
          <li>se elimina tu perfil y tus notificaciones;</li>
          <li>
            se eliminan los negocios de tu propiedad, con sus publicaciones y
            reseñas recibidas;
          </li>
          <li>
            se eliminan las reseñas que escribiste en otros negocios (sus
            promedios se recalculan).
          </li>
        </ul>
        <p>
          La eliminación es inmediata en nuestros sistemas y{" "}
          <strong>no reversible</strong>. Copias de seguridad operativas de la
          infraestructura pueden persistir durante un periodo limitado antes de
          purgarse de forma definitiva. Los contadores agregados y anónimos (por
          ejemplo, el número total de visitas de un negocio ajeno) no
          identifican a tu cuenta y pueden conservarse.
        </p>

        <h2>11. Tus derechos</h2>
        <p>
          Puedes acceder a tus datos y rectificarlos en cualquier momento desde
          Configuración, y eliminarlos con la eliminación de cuenta. Para
          cualquier otra solicitud sobre tus datos (acceso, corrección,
          eliminación, oposición o portabilidad), escríbenos a{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> y
          responderemos en un plazo razonable.
        </p>

        <h2>12. Menores de edad</h2>
        <p>
          KRUZO es una plataforma de uso general orientada a mayores de 13 años.
          No está dirigida a niños y no recopilamos datos de menores a
          sabiendas; si detectamos una cuenta de un menor de 13 años, la
          eliminaremos.
        </p>

        <h2>13. Cambios en esta política</h2>
        <p>
          Si esta política cambia de forma relevante, actualizaremos la fecha en
          la parte superior y lo anunciaremos en la plataforma antes de que los
          cambios entren en vigor.
        </p>

        <h2>14. Contacto</h2>
        <p>
          Responsable de la plataforma: KRUZO. Para consultas de privacidad:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </article>
    </div>
  );
}
