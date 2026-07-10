# Plugin Lore – Guía de Uso

Esta guía muestra cómo usar el plugin Lore en **Claude Code** en el trabajo diario:  
crear Áreas y proyectos, capturar criterio después de resolver problemas y mantener tu Lore limpio y útil.

> Lore es un kit ligero de Spec‑Driven Development (SDD) para Claude Code.  
> Te ayuda a preservar el **criterio** detrás de tus decisiones, para que tu IA nunca tenga que empezar desde cero.

---

## 1. Visión general

Lore organiza la experiencia en **criterio** que sigue participando en decisiones futuras:

- Resuelves un problema con IA.
- En lugar de simplemente seguir adelante, capturas la *razón* detrás de la solución.
- Ese criterio se guarda en artefactos Markdown que Claude Code puede reutilizar en sesiones posteriores.

El plugin Lore agrupa un conjunto de **skills** que implementan este ciclo:

- `using-lore` – punto de entrada y navegación.
- `create-area` – Lore compartido para un grupo de proyectos.
- `create-project` – Lore a nivel proyecto que hereda de un Área.
- `save-to-lore` – captura criterio después de resolver un problema.
- `transmute-lore` – migra proyectos existentes hacia la arquitectura Lore.

> **El Lore habla tu idioma.** Aunque los skills están escritos en inglés, todo el contenido que
> generan (identidad, principios, pistas, índices) se escribe en el idioma en el que trabajas.
> Solo permanecen invariables los nombres de archivo canónicos (`identidad.md`, `principios.md`…)
> y los términos técnicos de uso general en inglés (workflow, commit, stack…).

---

## 2. Requisitos previos

Antes de usar Lore:

- Tienes **Claude Code** instalado y funcionando.
- Puedes ejecutar comandos `/plugin` en tu entorno de Claude Code.

Instala el plugin Lore:

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

Una vez instalado, los skills de Lore quedan disponibles como comandos/prompts dentro de Claude Code.

---

## 3. Ciclo central: usar Lore en el día a día

El ciclo cotidiano de Lore es:

1. Trabajas con Claude Code para resolver un problema en tu proyecto.
2. Decides si la solución reveló **criterio** que debería afectar decisiones futuras.
3. Usas `save-to-lore` para capturar ese criterio en tu Lore en Markdown.
4. Permites que las sesiones futuras reutilicen ese criterio en lugar de empezar desde cero.

### Ejemplo: capturar un bug de hidratación

Tú y Claude depuran un problema de hidratación en Next.js.  
En lugar de solo corregirlo, quieres capturar la regla detrás de la solución.

En Claude Code podrías ejecutar:

```text
save-to-lore "Problema de hidratación con opacidad inicial en Next.js"
```

Lore te ayudará a:

- Extraer las **Pistas Invariantes** (por ejemplo: «Nunca utilices estado del cliente para controlar la opacidad inicial»).
- Decidir si esto pertenece a módulos a nivel proyecto o a principios a nivel Área.
- Actualizar los artefactos Markdown apropiados (`principios.md`, algún módulo temático, etc.).

---

## 4. Primeros pasos: tu primera Área y proyecto

Lore escala mediante **Áreas**.  
Un Área es una carpeta madre que posee criterio compartido; los proyectos lo heredan en lugar de duplicar reglas.

### 4.1 Crear un Área

Piensa en un Área como un dominio tipo «Frontend», «Backend» o «Experimentos de producto».

En Claude Code:

```text
create-area "Desarrollo Frontend"
```

Lore:

- Crea una carpeta para el Área.
- Inicializa artefactos a nivel Área:
  - `lore/identidad.md`
  - `lore/principios.md`
  - `lore/index.md`
  - módulos temáticos dentro de `lore/`, según se necesiten.

### 4.2 Crear un proyecto dentro de un Área

Ahora quieres que un proyecto concreto herede ese Lore de Área.

```text
crea un proyecto "Landing Lore" en el área "Desarrollo Frontend"
```

Lore:

- Crea la carpeta del proyecto **siempre dentro de** `{Área}/proyectos/{slug}/` — nunca directamente bajo el Área.
- Si el Área tiene una carpeta `_starter/`, instancia sus plantillas en el nuevo proyecto.
- Configura los artefactos a nivel proyecto:
  - `lore/identidad.md` y `lore/principios.md`, con contenido propio primero y un puntero al Área después.
  - `lore/index.md`, que referencia los módulos temáticos del Área por ruta relativa (`../../../lore/<módulo>.md`).
  - `FASES.md` en la raíz para estado y hoja de ruta.
  - `CLAUDE.md` en la raíz para contrato de colaboración y referencias operativas.
- Registra el proyecto en el `FASES.md` del Área, de modo que el criterio general se herede sin duplicarse.

### 4.3 Trabajar y capturar

Una vez que tu Área y proyecto existen:

1. Trabaja en el proyecto con Claude Code como siempre.
2. Cada vez que resuelves un problema que revela criterio reutilizable, llama a:

   ```text
   save-to-lore "Descripción corta del problema/decisión"
   ```

3. Revisa lo que Lore propone y edita los artefactos Markdown si lo ves necesario.

---

## 5. Skill por skill: cómo usarlos

### 5.1 `using-lore` – Punto de entrada y navegación

**Propósito:** ayudarte a entender el modelo de Lore y dirigirte al skill adecuado.

Uso típico:

```text
using-lore
```

Puedes pedir cosas como:

- «Explícame la arquitectura de Lore para este proyecto.»
- «Muéstrame los artefactos que existen ahora.»
- «Guíame al skill correcto para capturar una nueva pista invariante.»

`using-lore` es el lugar más seguro para empezar si no tienes claro qué skill usar a continuación.

---

### 5.2 `create-area` – Lore compartido para un dominio

**Propósito:** crear una raíz de Lore compartida para un dominio (Área).

Ejemplo de prompt:

```text
create-area "Frontend asistido por IA"
```

Lore:

- Crea una carpeta para el Área.
- Inicializa artefactos a nivel Área:
  - `lore/identidad.md`
  - `lore/principios.md`
  - `lore/index.md`
  - módulos temáticos bajo `lore/`.
- Opcionalmente explica para qué sirve cada artefacto y cómo extenderlo.

Usa este skill cuando quieres que varios proyectos compartan un conjunto común de criterios.

---

### 5.3 `create-project` – Lore con alcance de proyecto

**Propósito:** crear un proyecto que hereda Lore desde un Área.

Ejemplo de prompt:

```text
crea un proyecto "Sitio de marketing" en el área "Frontend asistido por IA"
```

Lore:

- Crea la carpeta del proyecto en `{Área}/proyectos/{slug}/` — nunca directamente bajo el Área.
- Prepara:
  - `lore/` para módulos específicos del proyecto (los módulos genéricos del Área solo se referencian, nunca se copian).
  - `FASES.md` en la raíz para estado y hoja de ruta.
  - `CLAUDE.md` en la raíz para contrato de colaboración y referencias.
- Conecta el proyecto con el Lore del Área, de modo que el criterio compartido esté disponible sin duplicación.

Usa este skill siempre que inicies una nueva base de código dentro de un dominio que ya tiene un Área.

---

### 5.4 `save-to-lore` – Capturar criterio tras resolver un problema

**Propósito:** destilar la experiencia recién adquirida en criterio reutilizable.

Ejemplos de prompts:

```text
save-to-lore "Bug de hidratación en landing de Next.js"
save-to-lore "Decisión: siempre preferir renderizado estático en páginas de marketing"
save-to-lore "Estándar: los mensajes de error deben ser humanistas y accionables"
```

No hace falta pedirlo siempre de forma explícita: si acabas de resolver una fricción que cumple un
**umbral de 4 condiciones** (restringe una decisión futura, es destilable a Contexto→Causa→Pista,
es accionable, y le serviría a otro proyecto del Área), Lore puede proponer guardarla por su
cuenta. Los cambios cosméticos nunca cuentan.

Lore normalmente:

- Te pide contexto sobre lo que ocurrió.
- Extrae **Pistas Invariantes** (criterio que restringe decisiones futuras) y las guarda como
  `conjecture` por defecto, o `confirmed` solo si ya se validaron en la app en marcha.
- Sugiere dónde guardarlas:
  - módulos del proyecto bajo `lore/`;
  - `principios.md` del Área si son reglas generales y están confirmadas;
  - actualizaciones de `identidad.md` o `CLAUDE.md` si afectan identidad o colaboración.
- Respeta invariantes:
  - Nunca inventa criterio.
  - Informa el ruido descartado.
  - Requiere revisión humana antes de escribir nada; nunca hace `git push`.
  - Marca lo ya promovido al Área con el glifo ` · ↑` en el `index.md` del proyecto, para no repetir el trabajo.

Usa este skill como herramienta principal para alimentar tu Lore con el tiempo.

---

### 5.5 `transmute-lore` – Migrar proyectos existentes

**Propósito:** mover proyectos heredados hacia la arquitectura Lore.

No es un comando de CLI: el modo se infiere de la frase, no de un flag. Tiene tres modos:

- `add` – crea artefactos de Lore que aún no existen.
- `clean` – elimina módulos redundantes que ya duplican los del Área (requiere que el proyecto
  tenga una Área madre; si es standalone, este modo no aplica).
- `translate` – estandariza el idioma del Lore: traduce el contenido de todos los artefactos a un
  único idioma (el que pidas o, por defecto, el tuyo), sin tocar nombres de archivo, estructura,
  código ni significado.

Ejemplos de prompts:

```text
transmuta el lore del "Frontend heredado"
limpia el lore del "Frontend heredado"
estandariza el idioma del lore del "Frontend heredado"
traduce el lore del "Frontend heredado" al español
```

**Precondición:** el proyecto debe tener el árbol de git limpio antes de ejecutar cualquiera de los
tres modos; si hay cambios sin commitear, el skill se detiene y pide hacer commit o `stash` primero.

Comportamiento esperado:

- Escanear la documentación y estructura existentes.
- Proponer cómo mapear archivos antiguos a:
  - `identidad.md`, `principios.md`, `index.md`, módulos temáticos.
  - `FASES.md` y `CLAUDE.md`.
- Esperar tu aprobación explícita antes de escribir nada (HARD-GATE).
- Garantizar que el resultado sea DRY:
  - Las reglas compartidas van al Área.
  - El proyecto conserva solo el criterio específico; `identidad.md` y `principios.md` nunca se
    eliminan en modo `clean`.

Usa este skill cuando ya tienes proyectos en marcha y quieres incorporarlos a Lore sin reescribirlo todo a mano.

---

## 6. Trabajar con los artefactos

Lore utiliza un conjunto fijo de artefactos para mantener el criterio organizado:

- `lore/identidad.md` – identidad del proyecto y estándar mínimo de calidad.
- `lore/principios.md` – reglas permanentes de ingeniería y negocio.
- Módulos temáticos en `lore/` – experiencia destilada agrupada por dominio.
- `lore/index.md` – mapa de navegación del Lore en ese proyecto o Área.
- `FASES.md` (raíz) – estado actual y hoja de ruta del proyecto.
- `CLAUDE.md` (raíz) – contrato de colaboración y referencias operativas.

Recomendaciones generales:

- Identidad y principios cambian poco; mantenlos breves e intencionales.
- Los módulos temáticos pueden crecer, pero cada uno debería enfocarse en un dominio específico.
- `FASES.md` debe reflejar la realidad; actualízalo cuando el proyecto cambie de fase.
- `CLAUDE.md` debe describir cómo trabajan tú y Claude juntos (prompts, rituales, restricciones).

---

## 7. Buenas prácticas

Para que tu Lore se mantenga útil:

- Captura solo **criterio**: si no restringe una decisión futura, no lo añadas.
- Prefiere módulos pequeños y enfocados en lugar de documentos narrativos largos.
- Revisa periódicamente tu Lore para fusionar reglas solapadas y eliminar las obsoletas.
- Usa Áreas para todo lo que debería ser compartido; mantén el Lore del proyecto ligero.
- Mantén todo el Lore en un único idioma; si quedó mezclado o en el idioma equivocado, usa
  `transmute-lore` en modo `translate`.
- Revisa siempre el diff que Lore propone antes de confirmar cambios.

Si quieres una visión más conceptual de por qué existe Lore y en qué se diferencia de la documentación tradicional, consulta el [`README.md`](./README.md).
