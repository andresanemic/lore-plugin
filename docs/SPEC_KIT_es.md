# Lore conviviendo con spec-kit

> [← Volver al README](../README.md) · [English version](./SPEC_KIT_en.md)

[spec-kit](https://github.com/github/spec-kit) de GitHub y Lore Plugin son dos kits de criterio, y
cubren **el mismo modo de falla en dos superficies distintas**: lo que falta no parece faltar.
spec-kit obliga a llenar casillas que uno dejaría vacías sin notarlo, antes de construir; Lore lo hace con el criterio, después. No compiten.

**Lore no depende de spec-kit y no va a depender** — nada de esta página hace falta para usar el
kit. Si no usas spec-kit, no sigas leyendo.

## El conflicto es de autoridad, no de archivos

Instalar spec-kit sobre un proyecto con Lore no toca ni un archivo que Lore posea: nada edita
`CLAUDE.md` ni `AGENTS.md`, nada entra a `lore/`; todo aterriza en `.specify/`, `specs/` y sus
propias skills.

Por eso la colisión es fácil de no ver: **dos kits en canales disjuntos no fallan —
omiten.** Ningún error — solo un ciclo que corre sin consultar nunca el criterio, y produce un plan
que se ve completo.

Lo único que spec-kit sí reclama es autoridad. Su plantilla de constitución por defecto dice:

> *Constitution supersedes all other practices*

Instalado esta semana, supremo sobre criterio pagado con fricción antes de que el kit existiera.

## La solución: una constitución que es frontera

Copia [`assets/constitucion-puntero.md`](../assets/constitucion-puntero.md) sobre la
`.specify/memory/constitution.md` que `specify init` generó vacía, y adáptala.

Delegaciones con dueño y ruta, orden de precedencia explícito, los tres escenarios de
entrada, y la cláusula de supremacía **revocada por escrito** — omitirla deja el hueco que la próxima
regeneración de la plantilla repone.

**Lore Plugin no escribe ese archivo por ti:** automatizar la constitución de otro kit sería reclamar
sobre él la autoridad que el propio documento le niega sobre Lore. La copias, la adaptas, es tuya.

### Orden de precedencia

```text
canon/  →  lore/ del proyecto  →  lore/ del área madre  →  Lore federado en su origen
        →  la constitución  →  specs/<id>/
```

La constitución está **por debajo de todo `lore/` y por encima de los artefactos del ciclo** — media
entre ellos y no gobierna ninguno.

### Reparto de autoridad

| Gobierna | Dueño |
|---|---|
| El ciclo de construcción — specify, clarify, plan, tasks, implement | spec-kit |
| Qué es trabajo bueno — estándares, prohibiciones, cicatrices | tu `lore/` |
| Dónde se registra un hallazgo | `save-to-lore` |

Tu `lore/` le gana al ciclo **dentro de su frontera de validez declarada**, no en todas partes. Donde
una Pista no llega hay territorio sin criterio todavía, no una excepción concedida por spec-kit —
la diferencia decide si obedeces al ciclo o abres un arbitraje.

### Quién puede escribir

La constitución lleva un principio que no delega nada: **nada se commitea ni se publica por
iniciativa del ciclo.** Commits, pushes, tags, releases y cualquier publicación ocurren solo con tu
autorización explícita, y `/speckit-implement` y todo hook de extensión quedan sujetos a eso.

No se puede delegar al `lore/` — es una regla sobre spec-kit, fuera de lo que `lore/` gobierna — ni
omitir: `implement` es un bucle de escritura autónomo, así que una frontera que media entre dos kits
sin decir quién puede escribir tiene la puerta abierta.

## Adónde va una cicatriz cuando el ciclo termina

Por `save-to-lore`, hacia el `lore/` que la posee. **`specs/` no se conserva como historia del
proyecto.**

Un `specs/` guardado «por si acaso» es memoria del caso: preservación sin producir criterio, lo
destilable inerte dentro. Evidencia longitudinal en [los casos de estudio](./CASES_es.md).

## Dónde va spec-kit, y dónde no

La pregunta anterior, la que suele saltarse: **¿este repositorio quiere spec-kit?** Su unidad de
trabajo es una **feature** y su paso terminal escribe código; va donde una feature aterriza.

| Nivel | Su unidad de trabajo | spec-kit | Qué corre |
|---|---|---|---|
| **Área** | una pista — criterio | **no** | Nada. Un área no tiene entregable propio; `specs/NNN-*/` sería un segundo registro de estado paralelo a `FASES.md` por canal disjunto — la forma que produce omisión, no error |
| **Proyecto** | una feature | **sí** | El ciclo completo, `specify → implement`. Es el único nivel donde `implement` tiene dónde aterrizar |
| **Bot** | una instrucción corta | **sí, la mitad pensante** | `specify → plan → tasks`. **`implement` corre en el repositorio de destino**, que el spec nombra |

La fila del bot parece un compromiso y no lo es: un bot custodia criterio federado de varias áreas y
opera en repositorios que no tienen nada de él. La spec pertenece donde ese criterio ya está
cargado: dice qué es trabajo bueno acá, y ese es todo el contenido del bot. Lo que un bot no puede
es terminar: no tiene nada que compilar, así que `implement` cruza.

**El costo tiene su cláusula.** Los artefactos del ciclo quedan en un repo y el código en
otro, y el Principio III dice que `specs/` no se conserva. La jugada de cierre es explícita y del
bot: **cuando el destino reporta la implementación terminada, el bot destila la cicatriz por
`save-to-lore` y borra `specs/NNN-*/`.** Sin ella un bot acumula specs de trabajo que no hizo —
memoria del caso con nombre de otro: el fallo que este kit evita, por la puerta de servicio.

Dos consecuencias: un spec escrito en un bot **tiene que** nombrar su repositorio de destino, y el
que no lo hace no está listo para `plan` — para eso se escribió el primer chequeo de abajo. Y hay
exactamente **una** constitución por repositorio con `.specify/`, la razón práctica para no instalar
en los tres niveles: cada instalación es otro documento auto-supremo que hay que revocar por escrito.

## Tres escenarios de entrada

| Llegas con | Qué corre primero |
|---|---|
| Lore ya puesto, agregas spec-kit | La constitución, **antes** del primer `/speckit-specify` |
| spec-kit ya puesto, agregas Lore | `transmute-lore` sobre el criterio existente y **después** la constitución — una constitución preexistente es criterio importado y pasa por GRAFT |
| Los dos desde cero | `create-area` / `create-project`, después `specify init` **en el proyecto**, después la constitución |

La fila del medio es la que más importa: el arbitraje necesita una vara. Frente a una fuente
autoritativa sin una identidad escrita con la que juzgarla, la única jugada disponible es obedecerla.

## Antes de pasar de `specify` a `plan`

1. **Destino declarado** — ¿el spec dice quién posee el criterio con el que va a ser juzgado? En un
    repositorio sin código propio —bot, área— incluye nombrar el repositorio donde aterriza el trabajo.
2. **Sin copias** — ¿alguna sección reproduce criterio que ya tiene dueño en otra ruta?
3. **Sin excepciones disfrazadas** — ¿algún requisito pide romper una Pista? Entonces lo que se abre
   es un arbitraje, no una excepción.

## Latencia declarada

Las skills que un kit instala **a mitad de sesión no quedan invocables de inmediato.** El runtime las
registra de forma asíncrona — hay una ventana en que están en disco pero no en sesión. Verificado
el 2026-08-14: `speckit-*` no era invocable justo después de `specify init`, y sí lo era minutos
después — dentro de la **misma** sesión.

Después de `specify init`, si los comandos no aparecen no te falta un paso: espera o abre sesión
nueva. Y nada debería depender de surtir efecto en el turno siguiente al que lo escribió. Escríbelo
y confirma que está vivo.

## Énfasis opcional al abrir sesión

Claude Code y Codex pueden ejecutar hooks de ciclo de vida. Un proyecto puede agregar texto propio
en `SessionStart` para reforzar una regla, y ese énfasis es **opcional a propósito**:

- Su configuración y protocolo de salida son **específicos de cada proveedor** — el contrato, que
  ambos hosts ya cargan, sigue siendo el canal portable.
- **No es el mecanismo principal**: el bloque siempre-activo del contrato lo es; el hook agrega
  énfasis a algo que ya funciona sin él.

Si quieres ese énfasis extra, configúralo en el host elegido. Lore Plugin no instala esta inyección
opcional de prompt; sus guardias silenciosas de estado de 2.4.5 son un mecanismo separado.

> **Nunca pongas todo `.claude/` en el gitignore.** Es un reflejo común y se lleva las skills
> instaladas por delante.

## Frontera de validez

Verificado contra `specify-cli 0.16.5.dev0` (commit `bf88c9f`) el 2026-08-14, en una instalación real
sobre un **bot** — un proyecto cuyo producto son registros, no código.

**No se ha ejercido en un repositorio con código donde el ciclo sí aterriza**, que es el caso
mayoritario de spec-kit. Delegaciones y precedencia se sostienen; la ergonomía del ciclo completo bajo
esta frontera, sin probar. Trátalo como la pregunta abierta que es.

Esa frontera cubre también la tabla de niveles — conviene decirlo porque la tabla se lee más segura
que su evidencia. La fila del **bot** se ejerció. La fila del
**proyecto** —el ciclo completo en un repositorio con código— **es razonamiento, no experiencia**: se
sigue de dónde puede aterrizar `implement`, y nadie la ha corrido. La fila del **área** es una decisión
de diseño sobre un segundo registro de estado, tomada de un modo de falla ya destilado, no de un área
que lo intentara y sufriera. Usa la tabla; no la cites como resultado.
