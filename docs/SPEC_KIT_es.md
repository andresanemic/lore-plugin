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

## Dónde va spec-kit, y dónde no

Antes de los escenarios de entrada hay una pregunta anterior, y es la que suele saltarse: **¿este
repositorio quiere spec-kit?** La respuesta sale de un solo hecho — la unidad de trabajo de spec-kit
es una **feature**, y su paso terminal escribe código. Va donde una feature aterriza.

| Nivel | Su unidad de trabajo | spec-kit | Qué corre |
|---|---|---|---|
| **Área** | una pista — criterio | **no** | Nada. Un área no tiene entregable propio, y `specs/NNN-*/` sería un segundo registro de estado corriendo en paralelo a `FASES.md` por un canal disjunto — la forma exacta que produce omisión en vez de error |
| **Proyecto** | una feature | **sí** | El ciclo completo, `specify → implement`. Es el único nivel donde `implement` tiene dónde aterrizar |
| **Bot** | una instrucción corta | **sí, la mitad pensante** | `specify → plan → tasks`. **`implement` corre en el repositorio de destino**, que el spec nombra |

La fila del bot es la que necesita explicación, porque parece una solución de compromiso y no lo es.
Un bot custodia criterio federado de varias áreas y opera en repositorios que no tienen nada de él.
El spec vale más escrito donde ese criterio ya está cargado que donde el código resulta vivir — un
spec es un documento sobre *qué es trabajo bueno acá*, y eso es todo el contenido de un bot. Lo que
un bot no puede es terminar: no tiene qué compilar, así que `implement` cruza.

**Esto tiene un costo y el costo tiene su cláusula.** Los artefactos del ciclo quedan en un
repositorio y el código en otro, y el Principio III dice que `specs/` no se conserva. Así que la
jugada de cierre es explícita y es del bot, no del destino: **cuando el destino reporta la
implementación terminada, el bot destila la cicatriz por `save-to-lore` y borra `specs/NNN-*/`.** Sin
esa cláusula un bot acumula despacio specs de trabajo que no hizo, que es memoria del caso con el
nombre de otro — el fallo que este kit existe para evitar, entrando por la puerta de servicio.

Dos consecuencias que conviene decir sin rodeos. Un spec escrito en un bot **tiene que** nombrar su
repositorio de destino, y el que no lo hace no está listo para `plan` — es el primero de los tres
chequeos de más abajo, y este es el caso para el que se escribió. Y hay exactamente **una**
constitución que mantener por repositorio con `.specify/`, que es la razón práctica para no instalar
el kit en los tres niveles: cada instalación es otro documento de gobierno que se declara supremo y
hay que revocar por escrito.

## Tres escenarios de entrada

| Llegas con | Qué corre primero |
|---|---|
| Lore ya puesto, agregas spec-kit | La constitución, **antes** del primer `/speckit-specify` |
| spec-kit ya puesto, agregas Lore | `transmute-lore` sobre el criterio existente y **después** la constitución — una constitución preexistente es criterio importado y pasa por TRANSPLANT |
| Los dos desde cero | `create-area` / `create-project`, después `specify init` **en el proyecto**, después la constitución |

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

Esa frontera cubre también la tabla de niveles de más arriba, y conviene decirlo sin rodeos porque la
tabla se lee más segura que la evidencia que tiene detrás. La fila del **bot** se ejerció. La fila del
**proyecto** —el ciclo completo en un repositorio con código— **es razonamiento, no experiencia**: se
sigue de dónde puede aterrizar `implement`, y nadie la ha corrido. La fila del **área** es una decisión
de diseño sobre un segundo registro de estado, tomada por la fuerza de un modo de falla ya destilado y
no por un área que lo intentara y lo sufriera. Usa la tabla; no la cites como resultado.
