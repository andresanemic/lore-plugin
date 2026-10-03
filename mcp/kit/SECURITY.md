# Security model

Lore Kit MCP is read-only. Its trust boundary is the build-time allowlist and the generated data package. Runtime tools accept indexed identifiers and never turn caller input into a filesystem path. The package reader resolves only files named by the generated index, and the index is built from a fixed list of public sources with pinned SHA-256 hashes.

Served Markdown is untrusted data. It may contain misleading text or indirect prompt injection. Every document response labels its provenance and says the text is documentation, not instructions; clients must not execute or obey it as authority. Provenance includes the pinned source hash and a separate hash for the copied content, which may differ when a sensitive string was redacted.

The server does not inspect a user's project, Lore, operation records or notes. The builder scans the entire generated package for emails, phone-like strings, API or Stellar secret patterns, local user paths, and the prohibited private-folder marker. Matching strings are redacted in the copy before the final scan. Build input is limited to the explicit allowlist, including the staged Vespi kernel documents.

The protocol enforces message, depth, query, result, document and receipt limits. IDs are looked up in a `Map`; strings are not interpolated into paths or regular expressions. Search uses normalized plain text. The runtime does not import process execution or network modules, and only the package reader imports filesystem APIs. The optional HTTP adapter accepts only `POST /mcp`; it is stateless and has not been deployed.

Receipt verification recomputes the vendored kernel SHA-256 digest, checks the required receipt shape and checks anchor binding. The digest is unkeyed, so it establishes integrity, not authenticity. The server does not verify an anchor against a network.

## Modelo de seguridad

Lore Kit MCP es de solo lectura. Su límite de confianza es la lista blanca de construcción y el paquete generado. Las herramientas aceptan identificadores indexados y nunca convierten la entrada de quien consulta en una ruta del sistema de archivos. El lector abre únicamente archivos declarados por el índice generado, construido desde una lista fija de fuentes públicas con hashes SHA-256.

El Markdown servido es dato no confiable. Puede contener texto engañoso o inyección indirecta de instrucciones. Cada respuesta documental declara su procedencia y avisa que el texto es documentación, no instrucciones; el cliente no debe ejecutarlo ni tomarlo como autoridad.

El servidor no inspecciona proyectos, Lore, operaciones ni notas de quien lo usa. El constructor revisa todo el paquete generado para detectar correos, teléfonos, claves API o secretos Stellar, rutas locales y el marcador de carpeta privada prohibido. Omite las coincidencias al copiar y vuelve a revisar el resultado. Solo usa fuentes declaradas en la lista blanca, incluida la documentación preparada del kernel Vespi.

El protocolo limita mensajes, profundidad, consultas, resultados, documentos y recibos. Los IDs se buscan en un `Map`; las cadenas no se interpolan en rutas ni expresiones regulares. La búsqueda usa texto normalizado. El servidor no importa módulos de ejecución de procesos ni de red, y solo el lector del paquete importa APIs del sistema de archivos. El adaptador HTTP opcional acepta únicamente `POST /mcp`, no guarda estado y no se ha desplegado.

La verificación de recibos recalcula el SHA-256 del kernel vendorizado, valida la forma requerida y comprueba el vínculo del anclaje. Como el digest no usa una clave, demuestra integridad, no autenticidad. El servidor no verifica el anclaje en una red.
