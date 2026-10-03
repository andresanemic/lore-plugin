### 4.6 `CLAUDE.md` o `AGENTS.md`

**Ámbito:** Proyecto (nivel raíz).

**Propósito:**

- Definir el contrato de colaboración entre humanos y Claude (u otras herramientas de IA).
- Almacenar referencias operativas para trabajo asistido por IA.

**Contenido típico:**

- Cómo se espera usar Claude en el proyecto.
- Restricciones innegociables para las sugerencias de IA (por ejemplo, «Nunca saltarse la revisión de código»).
- Punteros a prompts, flujos de trabajo y mecanismos de seguridad.

**Guías:**

- Piensa en este archivo como el “acuerdo de trabajo” para la colaboración humano–IA.
- Mantén el contenido explícito y práctico.

**El bloque siempre-activo:**

El contrato es el único artefacto que los dos hosts cargan sin que nadie se lo pida, así que lleva el
canal siempre-activo del kit — su sección de punteros, delimitada por un par de marcadores:

```markdown
<!-- lore:always-on -->
…qué Lore gobierna acá · dónde vive · dónde vive el estado · cuándo invocar en vez de escribir a mano…
<!-- /lore:always-on -->
```

- **Los marcadores son literales.** Sin variantes de espaciado, sin atributos, sin número de versión;
  se localizan por coincidencia de línea completa tras recortar espacios, y **nunca se traducen** —
  traducirlos rompe la idempotencia del estampado sin producir ningún error.
- **Techo: 25 líneas, marcadores incluidos.** Es un límite duro. Si una variante no cabe, el
  contenido se mueve al `lore/`; el techo no se mueve.
- **Exactamente cuatro cosas:** qué Lore gobierna acá, dónde vive, **dónde vive el estado**
  (`FASES.md`, una línea, solo la ruta), y la señal de invocar en vez de escribir criterio a mano.
  Apunta al `lore/` y nunca reproduce una Pista. El criterio y el estado siguen en archivos separados
  —esa ley no se mueve—, pero la sesión que los recibe no puede leer dos veces, y un agente que tiene
  el criterio y no la fase propone bien y **fuera de orden**. La entrada de estado es un **puntero, no
  contenido**: la ruta es estable, lo que se agita es su destino.
- **Tres variantes.** Área → su propio `lore/`. Proyecto → su capa más la del área madre. Bot →
  `canon/` más la tabla de enrutamiento, nunca los Lore federados uno por uno. Las tres apuntan a su
  propio `FASES.md`, que es una línea y no escala con la cantidad de fuentes.
- **Quién estampa:** `create-area`, `create-project` y `create-bot`, dentro del umbral que ya
  tienen; `transmute-lore` UPGRADE para contratos anteriores al bloque.
- **Idempotencia:** sin marcadores → insertar tras el primer H1. Un par bien formado con contenido
  idéntico → **no-op, no se escribe nada**. Un par bien formado con contenido distinto → **reportar
  la divergencia y esperar**. Marcadores duplicados o rotos → **detener y reportar**; nunca adivinar.
  Salvo el bloque, el archivo no cambia.
- **Colisión con prosa preexistente.** Un contrato anterior al bloque suele nombrar ya las mismas rutas en una sección de carga, y estamparlo deja dos copias de los mismos punteros. El bloque es el que las skills reestampan, así que la copia que se desactualiza es la escrita a mano: los punteros quedan solo dentro del bloque y esa sección se reduce a lo que el bloque no lleva — reportado en el mismo umbral, nunca en silencio.

---

