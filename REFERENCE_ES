# Plugin Lore – Referencia

Este documento es la referencia técnica del **plugin Lore** para Claude Code.  
Define los conceptos centrales de Lore, los skills disponibles, los artefactos en Markdown y cómo encajan entre sí.

Para una guía práctica de “cómo usarlo en el día a día”, consulta [`USAGE_ES.md`](./USAGE_ES.md).  
Para una visión conceptual y la filosofía del proyecto, consulta el [`README.md`](../README.md).

---

## 1. Conceptos centrales

Lore se construye sobre un conjunto pequeño de conceptos:

- **Criterio** – Reglas y restricciones que deberían influir decisiones futuras.
- **Pistas Invariantes** – Pequeñas piezas de criterio destilado que siguen siendo útiles incluso cuando el contexto original desaparece.
- **Áreas** – Carpetas madre que poseen Lore compartido; los proyectos heredan su criterio.
- **Proyectos** – Bases de código individuales con su propio Lore, heredando de un Área.
- **Artefactos** – Archivos Markdown que estructuran y almacenan criterio y estado de proyecto.

La documentación tradicional almacena información.  
Lore almacena criterio que restringe lo que debería ocurrir después.

---

## 2. Resumen de skills

El plugin Lore expone cinco skills principales en Claude Code:

| Skill            | Propósito                                     | Ejemplo de uso típico                                      |
|------------------|-----------------------------------------------|------------------------------------------------------------|
| `using-lore`     | Punto de entrada, navegación y ayuda          | `using-lore`                                               |
| `create-area`    | Crear una nueva Área con Lore compartido      | `create-area "Desarrollo Frontend"`                       |
| `create-project` | Crear un proyecto que hereda de un Área       | `create-project "Sitio de marketing" in "Desarrollo Frontend"` |
| `save-to-lore`   | Capturar criterio tras resolver un problema   | `save-to-lore "Bug de hidratación en landing de Next.js"` |
| `transmute-lore` | Migrar proyectos existentes hacia Lore        | `transmute-lore --mode add "Frontend heredado"`           |

Cada skill opera sobre, o crea, artefactos Markdown específicos dentro de tu repositorio.

---

## 3. Detalle de skills

### 3.1 `using-lore`

**Rol:** Punto de entrada a Lore.

**Responsabilidades:**

- Explicar la arquitectura de Lore para el proyecto o Área actual.
- Mostrar qué artefactos existen y cómo están estructurados.
- Dirigirte al skill adecuado según tu intención.

**Interacciones típicas:**

- «Explícame la estructura de Lore de este repositorio.»
- «¿Qué artefactos existen para este proyecto?»
- «¿Qué skill debería usar para capturar una nueva pista invariante?»

Usa `using-lore` siempre que no tengas claro dónde empezar.

---

### 3.2 `create-area`

**Rol:** Inicializar una raíz de Lore compartida para un dominio (Área).

**Entrada:**

- Nombre del Área (por ejemplo, `"Desarrollo Frontend"`).

**Crea / actualiza:**

- Carpeta `lore/` a nivel Área.
- Artefactos centrales, típicamente:
  - `lore/identidad.md`
  - `lore/principios.md`
  - `lore/index.md`
  - módulos temáticos bajo `lore/`, según se necesiten.

**Responsabilidades:**

- Establecer un lugar donde viva el criterio compartido de un dominio.
- Proporcionar el esqueleto que los proyectos pueden heredar.

Usa `create-area` cuando quieras que varios proyectos compartan el mismo criterio fundamental.

---

### 3.3 `create-project`

**Rol:** Inicializar Lore específico de un proyecto que hereda de un Área.

**Entrada:**

- Nombre del proyecto (por ejemplo, `"Landing Lore"`).
- Nombre del Área (por ejemplo, `"Desarrollo Frontend"`).

**Crea / actualiza:**

- Carpeta del proyecto con su propio `lore/`.
- Artefactos a nivel proyecto:
  - Módulos temáticos bajo `lore/`.
  - `FASES.md` (raíz) para estado actual y hoja de ruta.
  - `CLAUDE.md` (raíz) para contrato de colaboración y referencias operativas.
- Enlaces entre el Lore del proyecto y el Lore del Área para heredar criterio compartido.

**Responsabilidades:**

- Dar al proyecto un lugar donde almacenar **su propio** criterio y estado.
- Evitar duplicar reglas ya definidas a nivel Área.

Usa `create-project` siempre que arranques una nueva base de código dentro de un Área existente.

---

### 3.4 `save-to-lore`

**Rol:** Destilar la experiencia recién adquirida en criterio reutilizable.

**Entrada:**

- Una descripción corta del problema, decisión o aprendizaje (por ejemplo, `"Bug de hidratación en landing de Next.js"`).

**Proceso (conceptual):**

1. Preguntar por contexto: qué ocurrió, qué se intentó, qué funcionó al final.
2. Extraer **Pistas Invariantes**:
   - Restricciones que deberían afectar decisiones futuras.
   - Reglas válidas más allá del incidente específico.
3. Decidir dónde guardarlas:
   - Módulos de proyecto bajo `lore/`.
   - `principios.md` a nivel Área para reglas generales.
   - Actualizaciones en `identidad.md` o `CLAUDE.md` si cambian identidad o colaboración.

**Invariantes:**

- El criterio nunca se inventa.
- Todo proviene de experiencia real.
- El ruido descartado se informa; nunca se elimina en silencio.
- Todo cambio pasa por un HARD-GATE antes de escribirse.
- Nada hace commit automáticamente.
- Un ser humano siempre revisa el *diff* final.

Usa `save-to-lore` como mecanismo principal para alimentar tu Lore tras decisiones importantes.

---

### 3.5 `transmute-lore`

**Rol:** Migrar proyectos existentes hacia la arquitectura Lore.

**Entrada:**

- Nombre del proyecto (por ejemplo, `"Frontend heredado"`).
- Modo:
  - `add` – crea artefactos de Lore que aún no existen.
  - `clean` – elimina módulos redundantes y mueve criterio compartido al Área.

**Proceso (conceptual):**

1. Escanear la documentación y estructura actuales.
2. Proponer cómo mapear archivos antiguos a:
   - `identidad.md`, `principios.md`, `index.md`, módulos temáticos bajo `lore/`.
   - `FASES.md` y `CLAUDE.md` en la raíz.
3. Identificar criterio que debería ser compartido a nivel Área versus detalles específicos de proyecto.
4. Ayudar a limpiar duplicaciones preservando la experiencia.

Usa `transmute-lore` cuando ya tienes proyectos en marcha y quieres incorporarlos a Lore sin reconstruirlo todo desde cero.

---

## 4. Especificación de artefactos

Lore usa un conjunto fijo de artefactos Markdown para mantener el criterio estructurado.

### 4.1 `lore/identidad.md`

**Ámbito:** Área o proyecto.

**Propósito:**

- Definir la identidad del proyecto o Área.
- Capturar el estándar mínimo de calidad que debe cumplirse.

**Contenido típico:**

- Nombre y descripción.
- Intención central y audiencia.
- Barrera mínima de calidad (por ejemplo, «Nunca introducir regresiones visibles para el usuario en producción»).

**Guías:**

- Mantén este archivo breve y estable.
- Solo actualízalo cuando la identidad o los estándares cambien de verdad.

---

### 4.2 `lore/principios.md`

**Ámbito:** Área (y, a veces, proyecto).

**Propósito:**

- Almacenar reglas permanentes de ingeniería y negocio.

**Contenido típico:**

- Principios arquitectónicos (por ejemplo, «Preferir renderizado estático en páginas de marketing»).
- Reglas de negocio que moldean decisiones técnicas.
- Restricciones que aplican a varios proyectos.

**Guías:**

- Prefiere principios claros y accionables frente a eslóganes abstractos.
- Mueve reglas muy específicas a módulos temáticos en lugar de saturar este archivo.

---

### 4.3 Módulos temáticos bajo `lore/`

**Ámbito:** Proyecto y Área.

**Propósito:**

- Agrupar experiencia destilada por dominio.

**Ejemplos:**

- `frontend-rendering.md`
- `error-handling.md`
- `data-modeling.md`
- `deployment-and-ops.md`

**Contenido típico:**

- Pistas Invariantes relacionadas con ese dominio.
- Fragmentos breves de contexto sólo cuando son necesarios para entender una regla.

**Guías:**

- Cada módulo debería enfocarse en un solo dominio o preocupación.
- Si un módulo crece demasiado, considera dividirlo.

---

### 4.4 `lore/index.md`

**Ámbito:** Área o proyecto.

**Propósito:**

- Actuar como mapa de navegación del Lore.

**Contenido típico:**

- Estructura de alto nivel:
  - enlaces a `identidad.md` y `principios.md`;
  - lista de módulos temáticos con descripciones cortas.
- Punteros a artefactos a nivel proyecto y Área.

**Guías:**

- Mantén este archivo actualizado al añadir o renombrar módulos.
- Haz que sea fácil para alguien nuevo saber dónde buscar un tema concreto.

---

### 4.5 `FASES.md`

**Ámbito:** Proyecto (nivel raíz).

**Propósito:**

- Describir el estado actual y la hoja de ruta del proyecto.

**Contenido típico:**

- Fase actual (por ejemplo, «Exploración», «MVP», «Escalado»).
- Objetivos y restricciones activas.
- Hitos próximos relevantes para criterio y decisiones.

**Guías:**

- Actualiza este archivo cuando el proyecto avance de fase.
- Usa descripciones concisas y basadas en hechos.

---

### 4.6 `CLAUDE.md`

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

---

## 5. Estructura de archivos

Una estructura típica de Lore se ve así:

```text
<raíz-de-área-o-proyecto>/
  lore/
    identidad.md
    principios.md
    index.md
    <módulos-temáticos>.md

  FASES.md
  CLAUDE.md
```

Cuando usas Áreas y proyectos:

- La **Área** posee su propio `lore/` y (opcionalmente) `FASES.md` / `CLAUDE.md` de alto nivel.
- Cada **proyecto** dentro de esa Área tiene:
  - su propio `lore/` para módulos específicos del proyecto;
  - su propio `FASES.md` y `CLAUDE.md` en la raíz del proyecto.

El criterio compartido vive en el Área.  
El criterio específico de proyecto vive en el proyecto.

---

## 6. Invariantes operativas

El comportamiento de Lore está gobernado por un conjunto de invariantes compartidas:

- **El criterio nunca se inventa** – todas las reglas provienen de experiencia real.
- **Todo proviene de trabajo real** – experimentos, incidentes, decisiones.
- **El ruido descartado se informa** – nada se elimina en silencio.
- **Todo cambio pasa por un HARD-GATE** – el criterio debe revisarse antes de escribirse.
- **Nada hace commit automáticamente** – la revisión humana es obligatoria.
- **Un humano revisa siempre el diff final** – la IA asiste, pero no modifica Lore en secreto.

Estas invariantes distinguen a Lore de herramientas genéricas de notas o logs:  
el objetivo es mantener un cuerpo de criterio confiable, curado por humanos, del que la IA pueda depender.

---

## 7. Relación con README y otros docs

La documentación de Lore suele dividirse así:

- `README.md` – historia, motivación, visión de arquitectura, instalación y comparación de alto nivel con documentación tradicional.
- `docs/USAGE_EN.md` / `docs/USAGE_ES.md` – guías prácticas de uso y flujos de trabajo.
- `docs/REFERENCE.md` / `docs/REFERENCE_ES.md` – esta referencia técnica del modelo.
- `docs/MIGRATION.md` / `docs/MIGRATION_ES.md` – estrategias y ejemplos de migración para proyectos heredados.

Separar referencia de uso y narrativa facilita:

- Consultar el comportamiento exacto de un skill o la semántica de un artefacto.
- Mantener el README enfocado y legible.
- Evolucionar patrones de uso sin romper el modelo subyacente.
