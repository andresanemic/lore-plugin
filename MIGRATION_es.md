# Plugin Lore – Guía de Migración

Esta guía explica cómo migrar **proyectos existentes** hacia la arquitectura Lore usando el skill `transmute-lore`, y cómo mapear documentación heredada a los artefactos de Lore.

---

## 1. Cuándo migrar

Tiene sentido migrar cuando:

- Tienes proyectos con documentación dispersa (README, wikis, issues, ADRs).
- Los equipos vuelven a discutir las mismas decisiones o redescubren aprendizajes antiguos.
- Quieres que el trabajo asistido por IA se apoye en un cuerpo estable de criterio, no sólo en notas ad‑hoc.

Lore no exige reescribir toda tu historia.  
Sólo necesitas trasladar el **criterio** que debería seguir influyendo en decisiones futuras.

---

## 2. Estrategia de migración

Una estrategia pragmática de migración es:

1. **Crear una Área** para el dominio:
   - por ejemplo, `"Frontend asistido por IA"`, `"Backend núcleo"`, `"Experimentos de producto"`.
2. **Elegir uno o dos proyectos piloto** que representen trabajo típico de esa Área.
3. **Ejecutar `transmute-lore`** sobre esos proyectos:
   - empezar con `add` para crear artefactos que faltan;
   - luego usar `clean` para subir criterio compartido al Área.
4. **Refinar el Lore**:
   - consolidar reglas;
   - eliminar duplicaciones;
   - clarificar Pistas Invariantes.
5. **Extender el patrón** a otros proyectos cuando la estructura se sienta sólida.

---

## 3. Uso de `transmute-lore`

`transmute-lore` es la herramienta principal para migrar. No es un comando de CLI: el modo se
infiere de la frase que uses, no de un flag.

**Precondición de seguridad (todos los modos):** el repositorio del proyecto debe tener el árbol de git
limpio. Si hay cambios sin commitear, el skill se detiene y pide hacer commit o `stash` primero,
para que la migración aterrice como un *diff* revisable.

### 3.1 Modo `add` – Crear Lore donde falta

**Propósito:** introducir artefactos de Lore en un proyecto heredado.

Ejemplo de prompt:

```text
transmuta el lore del "Frontend heredado"
```

Conceptualmente, Lore:

- Inspecciona archivos existentes (por ejemplo, `README`, docs de arquitectura, notas).
- Propone un mapeo hacia:
  - `lore/identidad.md`
  - `lore/principios.md`
  - `lore/index.md`
  - módulos temáticos bajo `lore/`
  - `FASES.md` y `CLAUDE.md` en la raíz.
- Sugiere qué partes son criterio y cuáles son información pura.

Tú revisas y confirmas o ajustas la estructura propuesta.

### 3.2 Modo `clean` – Hacer DRY el criterio compartido

**Propósito:** eliminar del proyecto los módulos temáticos que ya duplican los del Área.

Ejemplo de prompt:

```text
limpia el lore del "Frontend heredado"
```

**Requiere una Área madre:** el proyecto debe vivir en `{área}/proyectos/{slug}/`. Si es un
proyecto standalone (sin Área), este modo no aplica y Lore te lo informa.

Conceptualmente, Lore:

- Compara cada módulo temático del proyecto contra su equivalente en el Lore del Área.
- Si toda pista de un módulo del proyecto ya está en el Área, propone eliminar ese módulo del
  proyecto y hacer que `index.md` apunte al del Área por ruta relativa.
- Cualquier pista que **no** esté todavía en el Área se reporta (no se descarta) para que decidas
  si se queda como módulo propio del proyecto o se promueve primero al Área.
- **Nunca** elimina ni reescribe `identidad.md` o `principios.md` — solo módulos temáticos
  redundantes.

Tú revisas los cambios para asegurarte de que no se pierde nada importante y que las reglas compartidas quedan bien ubicadas.

### 3.3 Modo `translate` – Estandarizar el idioma

**Propósito:** dejar todo el Lore de un proyecto (o Área) en un único idioma.

Útil tras una migración: un proyecto heredado puede traer artefactos en inglés, en español o
mezclados. Los skills de Lore generan contenido en tu idioma, pero el material previo a la
migración conserva el idioma en que fue escrito.

Ejemplos de prompt:

```text
estandariza el idioma del lore del "Frontend heredado"
traduce el lore del "Frontend heredado" al español
```

Conceptualmente, Lore:

- Detecta el idioma actual de cada artefacto (`lore/*.md`, `FASES.md`, `CLAUDE.md`).
- Propone un plan archivo por archivo y espera tu aprobación antes de escribir (HARD-GATE).
- Traduce **solo el contenido**, preservando el significado: nunca toca nombres de archivo, rutas
  relativas, bloques de código, marcadores de confianza ni términos técnicos de uso general en
  inglés (workflow, commit, stack…).
- No es una reescritura: ninguna pista se añade, se elimina ni se reinterpreta.

---

## 4. Mapear documentación antigua a artefactos de Lore

Al migrar, normalmente mapearás contenido heredado de esta forma:

### 4.1 Viejos READMEs

- Identidad y propósito de alto nivel → `lore/identidad.md`.
- Resumen de preocupaciones y dominios → `lore/index.md` + módulos temáticos iniciales.

Ejemplo:

- Sección “Project Overview” → identidad.
- Sección “Tech Stack and Principles” → principios + módulos.

### 4.2 Documentos de arquitectura

- Documentos largos de arquitectura → dividir en:
  - principios duraderos → `lore/principios.md`;
  - criterio específico por dominio → módulos temáticos (por ejemplo, `frontend-rendering.md`, `api-design.md`).

Enfócate en reglas que aún restringen decisiones hoy; ignora detalles obsoletos.

### 4.3 Roadmaps y notas de planificación

- Roadmaps y descripciones de fases → `FASES.md`.
- Planes históricos que ya no afectan decisiones pueden descartarse o referenciarse brevemente.

### 4.4 Notas de onboarding y “cómo trabajamos”

- Guías de onboarding y notas de colaboración → `CLAUDE.md` (para la parte específica de IA) + `identidad.md` / `principios.md` según corresponda.
- Cualquier acuerdo explícito sobre cómo el equipo usa IA → `CLAUDE.md`.

---

## 5. Ejemplo de flujo de migración

### 5.1 Migrar un proyecto de frontend heredado

1. **Crear el Área** (si todavía no existe):

   ```text
   crea un área de trabajo para "Frontend asistido por IA"
   ```

2. **Adoptar el proyecto heredado.** `create-project` crea proyectos **nuevos** desde cero — no es
   la herramienta para incorporar un proyecto ya existente. Para uno heredado, se **adopta**
   añadiendo una fila con su ruta al `FASES.md` del Área (sin moverlo ni tocar su git):

   ```text
   registra "Sitio de marketing heredado" en el FASES.md del Área, con su ruta actual
   ```

3. **Añadir estructura de Lore** al proyecto adoptado, directamente sobre su carpeta real:

   ```text
   transmuta el lore del "Sitio de marketing heredado"
   ```

   - El proyecto debe tener el árbol de git limpio antes de esto (precondición de `transmute-lore`).
   - Revisar los `identidad.md`, `principios.md`, módulos, `FASES.md`, `CLAUDE.md` propuestos, y
     aprobar el mapeo antes de que se escriba nada (HARD-GATE).

4. **Limpiar módulos redundantes** una vez que el Área ya tiene sus propios módulos generales:

   ```text
   limpia el lore del "Sitio de marketing heredado"
   ```

   - Elimina del proyecto los módulos temáticos que ya duplican los del Área (por ejemplo, un
     módulo genérico de renderizado si el Área ya lo tiene).
   - Mantiene en el proyecto el criterio verdaderamente específico (por ejemplo, «La home de esta
     marca debe mantenerse bajo X ms») — `identidad.md` y `principios.md` nunca se tocan en este modo.

5. **Refinar y hacer commit:**

   - Editar artefactos manualmente para mayor claridad.
   - Confirmar que la estructura final refleja las restricciones reales.
   - `transmute-lore` no hace commit por ti: el *diff* queda para que tú lo revises y confirmes.

---

## 6. Checklist posterior a la migración

Tras ejecutar `transmute-lore` y ajustar artefactos, verifica:

- **El Lore de las Áreas captura el criterio compartido:**
  - Principios que aplican a varios proyectos viven en el Área.
  - Los módulos de proyecto no repiten reglas generales.

- **Los proyectos conservan sólo el criterio específico:**
  - El Lore del proyecto se centra en decisiones únicas de esa base de código.
  - Los módulos temáticos están acotados a preocupaciones del proyecto.

- **Las Pistas Invariantes son accionables:**
  - Las reglas son suficientemente específicas como para restringir decisiones futuras.
  - Las afirmaciones ambiguas u obsoletas se eliminan o se clarifican.

- **`FASES.md` refleja la realidad:**
  - La fase actual es correcta.
  - La hoja de ruta está alineada con cómo trabajáis de verdad.

- **`CLAUDE.md` coincide con vuestra colaboración:**
  - Describe cómo usáis Claude en la práctica.
  - Incluye restricciones innegociables sobre el comportamiento de la IA.

---

## 7. Principios de migración

Para mantener la migración manejable:

- **No** intentes preservar todos los detalles históricos.
- Enfócate en lo que aún restringe decisiones hoy.
- Trata Lore como documentación viva: debe reflejar cómo trabajáis ahora, no sólo cómo trabajabais.
- Deja que `transmute-lore` haga el trabajo pesado, pero revisa siempre sus propuestas como editor humano.

Una vez que uno o dos proyectos piloto estén migrados, podrás reutilizar los mismos patrones para otros repositorios dentro del Área.
