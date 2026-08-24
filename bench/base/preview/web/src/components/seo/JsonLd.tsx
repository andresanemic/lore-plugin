// Inyecta datos estructurados JSON-LD. `data` es siempre contenido propio y
// controlado (no entrada de usuario); se escapa "<" por seguridad defensiva.
export default function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
