# Lore conviviendo con spec-kit

> [← Volver al README](../README.md) · [English version](./SPEC_KIT_en.md)

[spec-kit](https://github.com/github/spec-kit) de GitHub y Lore Plugin son dos kits de criterio, y
cubren **el mismo modo de falla en dos superficies distintas**: lo que falta no parece faltar.
spec-kit obliga a llenar casillas que uno dejaría vacías sin notarlo, antes de construir. Lore
obliga a lo mismo para el criterio, después. No compiten.

**Lore no depende de spec-kit, y no va a depender.** Nada de esta página hace falta para usar el
kit. Si no usas spec-kit, no sigas leyendo.

## El conflicto es de autoridad, no de archivos

Instalar spec-kit sobre un proyecto con Lore no toca ni un archivo que Lore posea. No edita
`CLAUDE.md` ni `AGENTS.md`, no entra a `lore/`. Todo aterriza en `.specify/`, `specs/` y sus propias
skills.

Y por eso mismo la colisión es fácil de no ver: **dos kits en canales disjuntos no fallan —
omiten.** No aparece ningún error. Lo que aparece es un ciclo que corre sin consultar nunca el
criterio, y produce un plan que se ve completo.

Lo único que spec-kit sí reclama es autoridad. Su plantilla de constitución por defecto dice:

> *Constitution supersedes all other practices*

Un kit instalado esta semana, declarándose supremo sobre criterio que se pagó con fricción antes de
que él existiera.

## La solución: una constitución que es frontera

Copia [`assets/constitucion-puntero.md`](../assets/constitucion-puntero.md) sobre la
`.specify/memory/constitution.md` que `specify init` generó vacía, y adáptala.

Contiene delegaciones con dueño y ruta, un orden de precedencia explícito, los tres escenarios de
entrada, y la cláusula de supremacía **revocada por escrito** — no omitida. Omitirla deja el hueco
vacío, y la próxima regeneración de la plantilla la repone.

**Lore Plugin no escribe ese archivo por ti.** Automatizar la constitución de otro kit sería
reclamar sobre él la autoridad que el propio documento le niega a él sobre Lore. La copias, la
adaptas, es tuya.

### Orden de precedencia

```text
canon/  →  lore/ del proyecto  →  lore/ del área madre  →  Lore federado en su origen
        →  la constitución  →  specs/<id>/
```

La constitución está **por debajo de todo `lore/` y por encima de los artefactos del ciclo**. Media
entre los dos y no gobierna ninguno.

### Reparto de autoridad

| Gobierna | Dueño |
|---|---|
| El ciclo de construcción — specify, clarify, plan, tasks, implement | spec-kit |
| Qué es trabajo bueno — estándares, prohibiciones, cicatrices | tu `lore/` |
| Dónde se registra un hallazgo | `save-to-lore` |

Tu `lore/` le gana al ciclo **dentro de su frontera de validez declarada**, no en todas partes. Donde
una Pista no llega, lo que tienes no es una excepción concedida por spec-kit: es territorio sin
criterio todavía, y la diferencia decide si obedeces al ciclo o abres un arbitraje.

### Quién puede escribir

La constitución lleva un principio que no delega nada: **nada se commitea ni se publica por
iniciativa del ciclo.** Commits, pushes, tags, releases y cualquier publicación ocurren solo con tu
autorización explícita, y `/speckit-implement` y todo hook de extensión quedan sujetos a eso.

No se puede delegar al `lore/`, porque es una regla sobre spec-kit y el `lore/` no gobierna los
internos de spec-kit: gobierna qué es trabajo bueno. Y no se puede omitir: `implement` es un bucle de
escritura autónomo, así que una frontera que media entre dos kits sin decir quién puede escribir es
una frontera con la puerta abierta.

## Adónde va una cicatriz cuando el ciclo termina

Por `save-to-lore`, hacia el `lore/` que la posee. **`specs/` no se conserva como historia del
proyecto.**

Un `specs/` guardado «por si acaso» es memoria del caso: satisface el impulso de preservar sin
producir criterio, y lo destilable queda dentro, inerte. Esta tiene evidencia longitudinal detrás —
ver [los casos de estudio](./CASES_es.md).

## Tres escenarios de entrada

| Llegas con | Qué corre primero |
|---|---|
| Lore ya puesto, agregas spec-kit | La constitución, **antes** del primer `/speckit-specify` |
| spec-kit ya puesto, agregas Lore | `transmute-lore` sobre el criterio existente y **después** la constitución — una constitución preexistente es criterio importado y pasa por ARBITRATE |
| Los dos desde cero | `create-area` / `create-project`, después `specify init`, después la constitución |

La fila del medio es la que más importa: el arbitraje necesita una vara. Frente a una fuente
autoritativa sin una identidad escrita con la que juzgarla, la única jugada disponible es obedecerla.

## Antes de pasar de `specify` a `plan`

1. **Destino declarado** — ¿el spec dice quién posee el criterio con el que va a ser juzgado? En un
   repositorio que no tiene código propio —un bot, un área— eso incluye nombrar el repositorio donde
   aterriza el trabajo.
2. **Sin copias** — ¿alguna sección reproduce criterio que ya tiene dueño en otra ruta?
3. **Sin excepciones disfrazadas** — ¿algún requisito pide romper una Pista? Entonces lo que se abre
   es un arbitraje, no una excepción.

## Latencia declarada

Las skills que un kit instala **a mitad de sesión no quedan invocables de inmediato.** El runtime las
registra de forma asíncrona, y hay una ventana en que están en disco pero no en la sesión. Verificado
el 2026-08-14: `speckit-*` no era invocable justo después de `specify init`, y sí lo era minutos
después — dentro de la **misma** sesión.

Entonces: si después de `specify init` los comandos no aparecen, no te falta un paso. Espera, o abre
una sesión nueva. Y de forma más general, nada de lo que escribas debería depender de surtir efecto
en el turno siguiente al que lo escribió. Escríbelo y después confirma que está vivo.

## El hook opcional de Claude Code

Claude Code puede correr un hook `SessionStart` que inyecta texto al inicio de cada sesión. Es una
forma legítima de hacer más fuerte un Lore, y es **opcional a propósito**:

- Es **específico del proveedor**. Codex no tiene equivalente, así que un kit que dependiera de él
  dejaría de ser neutral — y el contrato, que los dos hosts ya cargan, es el canal que no lo es.
- **No es el mecanismo principal.** El bloque siempre-activo dentro del contrato lo es. El hook
  agrega énfasis a algo que ya funciona sin él.

Si lo quieres, agrégalo a tu propio `.claude/settings.json`. Lore Plugin no lo instala.

> **Nunca pongas todo `.claude/` en el gitignore.** Es un reflejo común y se lleva las skills
> instaladas por delante.

## Frontera de validez

Verificado contra `specify-cli 0.16.5.dev0` (commit `bf88c9f`) el 2026-08-14, en una instalación real
sobre un **bot** — un proyecto cuyo producto son registros, no código.

**No se ha ejercido en un repositorio con código donde el ciclo sí aterriza**, que es el caso
mayoritario de spec-kit. Las delegaciones y el orden de precedencia se sostienen; la ergonomía del
ciclo completo bajo esta frontera está sin probar. Trátalo como la pregunta abierta que es.
