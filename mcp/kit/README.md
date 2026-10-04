# Lore Kit MCP

Lore Kit MCP is a read-only Model Context Protocol server for public Lore Plugin and Vespi documentation. It runs on Node.js 24, uses no runtime dependencies, and communicates over newline-delimited JSON-RPC on stdio. A minimal stateless Streamable HTTP handler is included for serverless hosting, but this package has not been deployed.

## What it serves

The build-time package contains the public README, eight skills, the Vespi coordinator method, sectioned English and Spanish references, quick-start guides, cases, bibliography, genealogy, LUS and observer documents, Lore Plugin 2.4.9 release notes, and staged Vespi kernel documentation. It also carries an exact copy of the kernel receipt verifier used for local digest checks. Every document response includes its logical source, pinned source SHA-256, packaged-content SHA-256, package version and build date, plus a notice that the served text is documentation rather than instructions.

It does not serve user Lore, project files or operation state, private notes, `operations/`, credentials, or arbitrary files. The package is built only from `public-allowlist.json`; source hashes must match, and the build scans the complete output for sensitive patterns. Contact addresses, phone-like strings, local user paths, and secret-like strings are omitted from copied content when found.

## Connect

Install this package where Node.js 24 is available, then use the local executable path in your client configuration. These examples are templates; they do not change any client configuration for you.

Claude Code (`.mcp.json`):

```json
{
  "mcpServers": {
    "lore-kit": {
      "command": "node",
      "args": ["/absolute/path/to/lore-kit-mcp/bin/lore-kit-mcp.mjs"]
    }
  }
}
```

Codex (`~/.codex/config.toml`):

```toml
[mcp_servers.lore-kit]
command = "node"
args = ["/absolute/path/to/lore-kit-mcp/bin/lore-kit-mcp.mjs"]
```

OpenCode (`opencode.json`):

```json
{
  "mcp": {
    "lore-kit": {
      "type": "local",
      "command": ["node", "/absolute/path/to/lore-kit-mcp/bin/lore-kit-mcp.mjs"]
    }
  }
}
```

## Tools and limits

The tools are `kit_about`, `kit_privacy`, `kit_list_skills`, `kit_get_skill`, `kit_get_method`, `kit_search_docs`, `kit_get_doc`, `kit_reference_sections`, `kit_get_reference_section`, `kit_cases`, `kit_bibliography`, `kit_genealogy`, `kit_release_notes`, `vespi_about`, `vespi_explain`, and `vespi_verify_receipt`. Public documents are also exposed as `kit://<id>` resources.

Queries are limited to 500 characters, results to 10, documents to 12,000 characters per response, messages to 1 MiB, JSON nesting to 32 levels, and receipt JSON to 100,000 characters. Document pagination uses character offsets. Search is in-memory plain text with accent normalization, frequency and title scoring, and contextual fragments.

Receipt verification recalculates the vendored kernel digest and checks the receipt shape and anchor binding. A matching unkeyed digest establishes integrity only, not authorship; this tool does not query or verify a network anchor.

## Rebuild

From the repository root, run `node mcp/kit/scripts/build-data.mjs`. The script verifies every SHA-256 in `public-allowlist.json`, splits reference files by headings, sanitizes specified sensitive patterns, scans every packaged document, and writes `data/index.json` and `data/content/`. Review any source change and update its pinned hash deliberately before rebuilding. `_vespi-staging/` is build input only and is not included in the package.

## Lore Kit MCP

Lore Kit MCP es un servidor MCP de solo lectura para la documentación pública de Lore Plugin y Vespi. Funciona con Node.js 24, no tiene dependencias de ejecución y usa JSON-RPC delimitado por saltos de línea sobre stdio. Incluye un manejador HTTP mínimo y sin estado para alojamiento serverless, pero el paquete no se ha desplegado.

## Qué sirve

El paquete construido contiene el README público, las ocho skills, el método coordinador de Vespi, referencias en inglés y español separadas por encabezados, guías breves, casos, bibliografía, genealogía, documentos de LUS y Observer, notas de Lore Plugin 2.4.9 y documentación pública del kernel Vespi 0.1.4. Cada documento incluye su fuente lógica, el SHA-256 fijado de la fuente, el SHA-256 del contenido servido, la versión y la fecha de construcción, además del aviso de que el texto es documentación y no instrucciones.

No sirve el Lore de cada usuario, archivos de proyectos ni estado de operaciones, notas privadas, `operations/`, credenciales ni archivos arbitrarios. El paquete se construye solo desde `public-allowlist.json`; los hashes deben coincidir y la compilación revisa todo el resultado buscando patrones sensibles. Si encuentra correos, teléfonos, rutas locales o cadenas parecidas a secretos, omite esas cadenas al copiar el contenido.

## Conexión

Instala el paquete donde esté disponible Node.js 24 y usa la ruta local del ejecutable en la configuración de tu cliente. Estos ejemplos son plantillas y no modifican la configuración de ningún cliente.

Claude Code (`.mcp.json`):

```json
{
  "mcpServers": {
    "lore-kit": {
      "command": "node",
      "args": ["/ruta/absoluta/lore-kit-mcp/bin/lore-kit-mcp.mjs"]
    }
  }
}
```

Codex (`~/.codex/config.toml`):

```toml
[mcp_servers.lore-kit]
command = "node"
args = ["/ruta/absoluta/lore-kit-mcp/bin/lore-kit-mcp.mjs"]
```

OpenCode (`opencode.json`):

```json
{
  "mcp": {
    "lore-kit": {
      "type": "local",
      "command": ["node", "/ruta/absoluta/lore-kit-mcp/bin/lore-kit-mcp.mjs"]
    }
  }
}
```

## Herramientas y límites

Las herramientas son `kit_about`, `kit_privacy`, `kit_list_skills`, `kit_get_skill`, `kit_get_method`, `kit_search_docs`, `kit_get_doc`, `kit_reference_sections`, `kit_get_reference_section`, `kit_cases`, `kit_bibliography`, `kit_genealogy`, `kit_release_notes`, `vespi_about`, `vespi_explain` y `vespi_verify_receipt`. Los documentos públicos también aparecen como recursos `kit://<id>`.

Las consultas admiten 500 caracteres, los resultados hasta 10 documentos, cada respuesta documental hasta 12.000 caracteres, cada mensaje hasta 1 MiB, el JSON hasta 32 niveles y los recibos hasta 100.000 caracteres. La paginación cuenta caracteres. La búsqueda es de texto en memoria, normaliza acentos y puntúa frecuencia y coincidencia en el título.

La verificación de recibos recalcula el digest del kernel vendorizado y valida la forma y el vínculo del anclaje. Un digest sin clave demuestra integridad, no autoría; esta herramienta no consulta ni verifica el anclaje en una red.

## Reconstrucción

Desde la raíz del repositorio, ejecuta `node mcp/kit/scripts/build-data.mjs`. El script verifica cada SHA-256 de `public-allowlist.json`, separa las referencias por encabezados, omite los patrones sensibles indicados, revisa todos los documentos y escribe `data/index.json` y `data/content/`. Revisa cualquier cambio de fuente y actualiza deliberadamente su hash fijado antes de reconstruir. `_vespi-staging/` solo es entrada de construcción y no se incluye en el paquete.
