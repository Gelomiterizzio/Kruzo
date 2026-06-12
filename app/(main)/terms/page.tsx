import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de uso',
  description: 'Términos y condiciones de uso de la plataforma KRUZO.',
}

export default function TermsPage() {
  return (
    <div className="container max-w-3xl pt-24 pb-16">
      <article className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-display">
        <h1>Términos de uso</h1>
        <p className="lead">Última actualización: junio de 2026</p>

        <h2>1. Qué es KRUZO</h2>
        <p>
          KRUZO es un directorio comercial local que conecta a personas con negocios, emprendimientos y
          servicios de Santa Cruz de la Sierra, Bolivia. KRUZO <strong>no participa en las transacciones</strong>:
          el contacto y cualquier acuerdo comercial ocurre directamente entre el usuario y el negocio
          (por ejemplo, vía WhatsApp).
        </p>

        <h2>2. Cuentas</h2>
        <p>
          Para guardar favoritos, dejar reseñas o registrar un negocio necesitas una cuenta. Eres responsable
          de la veracidad de los datos que publicas y de mantener la confidencialidad de tu acceso. Podemos
          suspender cuentas que incumplan estos términos.
        </p>

        <h2>3. Negocios y publicaciones</h2>
        <p>
          Los negocios nuevos pasan por una revisión antes de ser visibles. Al publicar declaras que tienes
          derecho a ofrecer los productos o servicios anunciados y que la información (precios, fotos,
          horarios, contacto) es real y está actualizada. No se permite contenido ilegal, engañoso u ofensivo.
        </p>

        <h2>4. Reseñas</h2>
        <p>
          Las reseñas deben basarse en experiencias reales. Se permite una reseña por usuario por negocio.
          Las reseñas reportadas son revisadas por el equipo de moderación, que puede ocultarlas si
          incumplen estas normas.
        </p>

        <h2>5. Contenido y propiedad intelectual</h2>
        <p>
          Cada negocio es responsable del contenido que sube (textos, imágenes, precios). Al subir contenido
          otorgas a KRUZO una licencia no exclusiva para mostrarlo dentro de la plataforma.
        </p>

        <h2>6. Limitación de responsabilidad</h2>
        <p>
          KRUZO ofrece la plataforma «tal cual». No garantizamos la exactitud de la información publicada por
          los negocios ni respondemos por los productos, servicios o acuerdos entre usuarios y negocios.
        </p>

        <h2>7. Cambios</h2>
        <p>
          Podemos actualizar estos términos; los cambios relevantes se anunciarán en la plataforma.
          El uso continuado implica la aceptación de la versión vigente.
        </p>

        <h2>8. Contacto</h2>
        <p>
          Dudas sobre estos términos: <a href="mailto:hola@kruzo.bo">hola@kruzo.bo</a>.
        </p>
      </article>
    </div>
  )
}
