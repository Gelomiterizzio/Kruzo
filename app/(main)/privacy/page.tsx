import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Cómo KRUZO recopila, usa y protege tus datos personales.',
}

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl pt-24 pb-16">
      <article className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-display">
        <h1>Política de privacidad</h1>
        <p className="lead">Última actualización: junio de 2026</p>

        <h2>1. Datos que recopilamos</h2>
        <ul>
          <li><strong>Cuenta:</strong> nombre, email y foto (si inicias sesión con Google), teléfono y bio si los completas.</li>
          <li><strong>Negocios:</strong> la información comercial que el dueño publica (nombre, dirección, contacto, fotos, horarios).</li>
          <li><strong>Actividad:</strong> favoritos, reseñas y contadores agregados de visitas a perfiles y publicaciones.</li>
        </ul>

        <h2>2. Cómo usamos los datos</h2>
        <p>
          Para operar la plataforma: mostrar negocios y reseñas, mantener tu sesión iniciada, enviar
          notificaciones dentro de la app y calcular estadísticas reales para los dueños de negocios.
          No vendemos tus datos personales.
        </p>

        <h2>3. Infraestructura</h2>
        <p>
          KRUZO funciona sobre servicios de Google Firebase (autenticación, base de datos y almacenamiento
          de imágenes). Tus datos se procesan según las garantías de seguridad de dichos servicios.
        </p>

        <h2>4. Cookies y publicidad</h2>
        <p>
          Usamos una cookie de sesión propia (necesaria para mantenerte autenticado). Si la plataforma muestra
          anuncios de Google AdSense, Google puede usar cookies para personalizar y medir esos anuncios según
          sus propias políticas; puedes gestionar tus preferencias de anuncios en
          {' '}<a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>.
        </p>

        <h2>5. Tus derechos</h2>
        <p>
          Puedes editar tu perfil desde Configuración y eliminar tu cuenta de forma permanente desde
          Configuración → Seguridad. Al eliminarla, tu perfil se borra y tus negocios dejan de ser visibles.
          Para cualquier solicitud sobre tus datos escríbenos a <a href="mailto:hola@kruzo.bo">hola@kruzo.bo</a>.
        </p>

        <h2>6. Menores</h2>
        <p>KRUZO no está dirigido a menores de 13 años y no recopilamos datos de menores a sabiendas.</p>

        <h2>7. Cambios</h2>
        <p>Si esta política cambia de forma relevante, lo anunciaremos en la plataforma.</p>
      </article>
    </div>
  )
}
