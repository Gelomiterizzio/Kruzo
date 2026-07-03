// Server Component: renders a JSON-LD structured-data block.
//
// The payload is JSON.stringify'd and every `<` is escaped to <, so user
// content (business names, descriptions…) can never break out of the <script>
// tag — this is the standard XSS-safe pattern for JSON-LD in React/Next.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
