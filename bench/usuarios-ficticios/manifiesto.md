# Manifiesto de exposición — corrida RC5 + kernel 0.1.3 · 2026-09-29

> Qué ve cada usuario ficticio y qué no. La consigna exige que cada persona reciba **solo la
> documentación e instalación que tendría de verdad**, nunca el acuerdo interno ni la rúbrica. Este
> archivo es la lista, y existe para que la exclusión sea auditable en vez de declarada.

## Build bajo prueba

| Elemento | Identidad verificada | Dónde |
|---|---|---|
| Rama | `codex/rc5` | `plugins/proyectos/lore-plugin` |
| HEAD | `9ea1097` «Vendor Vespi kernel 0.1.3 into Lore Plugin RC5» | idem |
| Copia instalable etiquetada | `2.4.9-rc.5` | cuatro metadatos de la copia, no del repositorio |
| Kernel | **0.1.3 candidato**, 5 módulos | `skills/vespi/core/kernel/` |
| Skill de entrada | 8 skills | `skills/` |

### Procedencia del kernel, comprobada byte a byte antes de correr

Se quitó el encabezado de procedencia de tres líneas a cada archivo y se comparó el SHA-256 del cuerpo
con la fuente canónica `founder/proyectos/vespi/kernel/src/` y con la tabla de
`skills/vespi/core/kernel/SOURCE.md`. Cobertura: cuatro ubicaciones, cinco archivos cada una.

| Ubicación | Resultado |
|---|---|
| Repositorio `plugins/proyectos/lore-plugin` | **5/5** coinciden con la fuente 0.1.3 |
| Claude Code — `~/.claude/plugins/cache/lore-plugin/lore/2.4.9-rc.5` | **5/5** coinciden |
| Codex — `~/.codex/plugins/cache/personal/lore/2.4.9-rc.5` | **5/5** coinciden |
| Codex — origen `~/.agents/plugins/plugins/lore` | **5/5** coinciden |
| OpenCode | **no aplica** y no se cuenta: ese host recibe solo `.md` sueltos, sin `core/` (frontera declarada del kit, NC-B-1) |

La diferencia que la comparación neutraliza son los finales de línea del checkout
(`core.autocrlf=true`): se compararon bytes crudos contra bytes crudos y el resultado es idéntico, así
que no hay discrepancia que atribuírsela al checkout.

---

## Bloqueo de precondición — S5, L4 y L5 **no** están integrados

La consigna fija el momento de corrida «después de integrar S5, L4 y L5» y manda, si no lo están,
**informar el bloqueo y no fingir la prueba**. Los tres se verificaron uno por uno:

| Candidato | Estado verificado | Evidencia |
|---|---|---|
| **S5** (salvaguardas de evidencia de `save-to-lore`) | **Parcial.** El trabajo de S5 está en el árbol desde `bd13dee` y la suite S5 tiene `fix1` a `fix7` (18 pruebas). **El `fix8` no está aplicado.** | `scripts/save-to-lore-s5.test.mjs` no contiene ninguna prueba `fix8` (733 líneas, la última prueba es `S5-fix7 positivo: duplicados exactos…`); `notas/2026-09-29_informe-s5-rc5.md` no existe; `save-to-lore.mjs` no contiene ni `prestada` ni `perezosa` |
| **L4** (recordatorio por turno y estado visible) | **No integrado.** No hay implementación, ni en `hooks/`, ni en `hooks.json`, ni en `scripts/lore-plugin.mjs`. Existe un test RED sin versionar. | `hooks/` tiene 4 archivos (`codex-guard.mjs`, `hooks.json`, `lore-guard.mjs`, `lore-state.mjs`) y ninguno menciona turno ni `statusline`; `hooks.json` declara `SessionStart`, `PreToolUse` y `PostToolUse`, y no `UserPromptSubmit`; `bench/lore-turno.test.mjs` aparece como `??` en `git status`, o sea sin versionar; `notas/2026-09-29_informe-l4-rc5.md` no existe |
| **L5** (hooks de OpenCode equivalentes) | **No integrado.** | No existe `~/.config/opencode/plugin`, ni `plugins/`, ni equivalente en `%APPDATA%`; el instalador sigue copiando solo skills a OpenCode; `notas/2026-09-29_informe-l5-rc5.md` no existe |

**Consecuencia sobre lo que esta corrida puede y no puede afirmar.** La candidata que la consigna
quiere probar es *RC6 = RC5 + S5 + L4 + L5*. Lo que existe instalado es **RC5 con el kernel 0.1.3**.
Por lo tanto:

- **Sí se mide, y con qué valor:** el enrutamiento de las ocho skills sobre la prosa RC5; la frontera
  entre `vespi` y el resto; el comportamiento de silencio; y los efectos verificables que el kernel
  0.1.3 produce —que es la parte que la consigna más exige y la que S5/L4/L5 no tocan.
- **No se mide, y no se va a medir en su lugar:** el recordatorio por turno de L4, la marca
  `[Lore Plugin]` en la línea de estado, la paridad de hooks en OpenCode de L5, y el `fix8` de S5
  (evidencia prestada por continuación perezosa de una cita).
- **El nombre del build queda correcto en todas partes:** este informe dice **RC5**, nunca RC6. El
  nombre del archivo de salida conserva `rc6` porque lo fijó la consigna, y esa asimetría se declara en
  la primera línea del informe para que nadie la lea como un Alias.

---

## Exposición por usuario

### Lo que ven todos

| Sí | No |
|---|---|
| Las ocho skills de `skills/` tal como están instaladas | `specs/`, `acuerdo.md`, notas de versión en borrador |
| El `README` público si su instalación lo deja visible | `lore/principios.md` del kit (no existe tal cual: el criterio vive en el andamiaje del área, fuera del paquete) |
| La prosa de su propia skill cuando se invoca | `bot-lus-lore/`, `specs/012-rc4/`, `specs/013-acuerdo-vespi/` |
| — | Este archivo, `tareas-congeladas.md`, y la rúbrica |

### Lo que ve cada uno además

| Usuario | Además ve | Nota de aislamiento |
|---|---|---|
| U1 Ilde | Nada extra | Su sesgo declarado: cree que las skills son macros |
| U2 Noren | Su `FASES.md` declarando kit 2.4.8, y solo ese | Es el migrador: su sesgo declarado es conocer los nombres viejos |
| U3 Sabi | Nada; y la instrucción de que no sabe qué es una skill | Es el que más tiene que perder si el kit habla en interno |
| U4 Fermina | Un fragmento de política interna y el nombre del jefe, en prosa | La política es de su empresa, no del kit; el kit no la lee ni la cita |
| U5 Anselmo | Una carpeta de recibos dispersos, simulada, con tres artefactos | El efecto de continuidad se verifica contra esos archivos, no contra memoria |

### Frontera de aislamiento, y su límite

Cada usuario ficticio corre como **sesión nueva con contexto fresco**, en su propio directorio de
trabajo, y su prompt no contiene el brazo, el verbo ni la skill esperada. Ese aislamiento es real en
contexto: la sesión no hereda la conversación anterior.

**El límite, declarado porque no es lo mismo:** los subagentes de esta corrida arrancan dentro de la
misma instancia que ya tiene el kit en su lista de herramientas, de modo que **no son cinco personas
reales** y su habilidad para razonar sobre skills no es la de un usuario que recién llega. Lo que la
corrida mide es la **conducta de la prosa y del enrutamiento** —qué dispara, qué calla, qué pide, qué
entrega—, no la dificultad de una persona para aprender. Cualquier línea de este informe que hable de
«comprensión de la persona» se debe leer con esa reserva puesta.

---

## Una instancia de OpenCode

La consigna pide una instancia a la vez. En la máquina ya había una cola paralela con varios procesos
`opencode` corriendo, y la regla de «una a la vez» había sido **retirada por Andrés el 2026-09-29**
(registrado en `notas/cola-bunny-paralela-total.estado.json`: *«se descarta la regla de un OpenCode a
la vez»*). Esta corrida **no abrió ninguna instancia de OpenCode**: todo se ejecutó con subagentes de
la instancia que ya estaba corriendo y con el kernel invocado en proceso. El conflicto potencial —dos
escritores sobre el mismo árbol del kit— se evitó por construcción: esta corrida solo **escribe** bajo
`bench/usuarios-ficticios/`, y no toca `skills/`, `hooks/`, `scripts/` ni el kernel, como ordena la
consigna.
