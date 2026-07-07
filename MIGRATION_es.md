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

`transmute-lore` es la herramienta principal para migrar.

### 3.1 Modo `add` – Crear Lore donde falta

**Propósito:** introducir artefactos de Lore en un proyecto heredado.

Ejemplo de prompt:

```text
transmute-lore --mode add "Frontend heredado"
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

**Propósito:** eliminar duplicaciones y mover reglas compartidas al Área.

Ejemplo de prompt:

```text
transmute-lore --mode clean "Frontend heredado"
```

Conceptualmente, Lore:

- Identifica reglas que aparecen en varios documentos del proyecto.
- Sugiere mover el criterio verdaderamente general a `principios.md` o módulos temáticos del Área.
- Elimina copias redundantes del Lore del proyecto, dejando referencias cuando haga falta.

Tú revisas los cambios para asegurarte de que no se pierde nada importante y que las reglas compartidas quedan bien ubicadas.

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

1. **Crear Área:**

   ```text
   create-area "Frontend asistido por IA"
   ```

2. **Registrar proyecto:**

   ```text
   create-project "Sitio de marketing heredado" in "Frontend asistido por IA"
   ```

3. **Añadir estructura de Lore:**

   ```text
   transmute-lore --mode add "Sitio de marketing heredado"
   ```

   - Revisar los `identidad.md`, `principios.md`, módulos, `FASES.md`, `CLAUDE.md` propuestos.

4. **Limpiar criterio compartido:**

   ```text
   transmute-lore --mode clean "Sitio de marketing heredado"
   ```

   - Mover reglas generales de frontend (por ejemplo, «Preferir renderizado estático en páginas de marketing») al Lore del Área.
   - Mantener en módulos de proyecto el criterio específico (por ejemplo, «La home de esta marca debe mantenerse bajo X ms»).

5. **Refinar y hacer commit:**

   - Editar artefactos manualmente para mayor claridad.
   - Confirmar que la estructura final refleja las restricciones reales.

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
