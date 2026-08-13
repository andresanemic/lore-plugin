# lore/testing.md — Testing y verificación

> Pistas históricas, NO fuente de verdad. Leads a validar, no recetas.
> ⚠ Validar contra código actual antes de actuar.

---

## La puerta de pre-flight (esto sí es ley)

```bash
node tools/preflight.mjs proyectos/<slug>/web/src
node tools/preflight.mjs --selftest      # las reglas se verifican a sí mismas
```

**Por qué existe.** Un cuerpo de criterio sin puerta de control se evapora en la tercera sesión
larga. El Lore del área tiene leyes que un regex puede verificar; dejarlas a la buena memoria es
regalarlas. El script las cobra: sale con código **1** si hay violaciones, y eso **bloquea el
cierre** de la Mini-Fase (ritual de `FASES.md`).

**Qué verifica** (solo lo mecánico): raya (`—`) en copy visible, **literal o como entidad HTML**
(`&ndash;`, `&#8211;`: invisible en el fuente, visible en pantalla) · `addEventListener('scroll')` ·
`h-screen` / `100vh` · `gsap.from()` · `outline` eliminado sin reemplazo `focus-visible` · emoji en
el markup · fuente por defecto de IA (Inter/Roboto/Arial). Lo que exige criterio (composición,
jerarquía, *tells*, dirección estética) **no está aquí**: es la checklist humana de `FASES.md`.
Un linter no tiene gusto.

### La lección que costó descubrir: el filtro de ruido **es** la herramienta

La primera versión daba **72 violaciones en `enma`** y era inservible: la mayoría eran rayas
dentro de `// comentarios de código`, que nadie lee en la web. Excluyendo comentarios quedan
**10, y las 10 son copy visible real** (el `title` del sitio, dos `aria-label`, un FAQ, un artículo).

La regla general: **una puerta que grita por todo es una puerta que se desactiva.** La precisión no
es un lujo del linter, es la condición para que alguien lo siga corriendo. Cada regla nueva se
prueba contra un proyecto real antes de entrar, y se le exige un caso negativo (algo correcto que
NO debe disparar) en el `--selftest`.

### Un check greppable puede coincidir con su propio comentario

Un check mecánico busca una **forma** (`axes:.*WONK`, un hex, un import), pero un grep no distingue
código de comentario: si el código nombra lo prohibido para declarar por qué está ausente
(`// WONK muerto, fuera del import`), el propio check dispara sobre su documentación. Pasó **tres
veces** en `numerologia` (Fase 2) con el mismo check antes de que se corrigiera: el comentario que
explicaba la ausencia de `WONK` hacía match contra la regla que verificaba su ausencia.

**La regla:** un check nuevo necesita su caso negativo **de verdad** — no solo "código correcto que
no dispara", sino específicamente "un comentario que nombra la palabra prohibida para explicar por
qué no está" (`grep -v` de líneas `//`/`>`/markdown, o anclar el patrón a la forma real del código —
`axes:\s*\[` con la lista de valores, no la palabra suelta). Si el `--selftest` no incluye ese caso,
el check va a fallar contra su propia prosa la primera vez que alguien documente una decisión.

---

### [testing] MutationObserver + gap discriminator para testear `gsap.set` vs `gsap.fromTo` sin depender de timing

- Contexto: Suite Playwright que debe verificar si una animación GSAP fue saltada (`gsap.set` — instantáneo) vs ejecutada (`gsap.fromTo` — tween con duration). Los métodos basados en timing absoluto (ej. "¿es opacity > 0.9 dentro de N ms de carga?") son frágiles: dependen de compile time del dev server, velocidad de hydration y overhead de CI.
- Causa probable: N/A (patrón de testing).
- Pista: Inyectar via `page.addInitScript` un `MutationObserver` que registre (a) el tiempo de la primera mutación de `style` en el elemento (`firstMutationTime`) y (b) el tiempo en que `opacity >= 0.999` (`resolvedTime`). El gap `resolvedTime - firstMutationTime` discrimina: gap ≈ 0ms → `gsap.set` (una sola escritura); gap ≈ duration completa → `gsap.fromTo`. El threshold entre ambos valores (ej. 500ms) es independiente del tiempo de carga del servidor. El observer debe iniciarse con `requestAnimationFrame(attachObserver)` para capturar la primera mutación GSAP (que ocurre al montar el componente) antes de que React pinte el frame. Exponer el resultado como `window.__navAnimMs` y esperar con `waitForFunction`.
- Confianza: conjetura (primera aparición — INC-001 / gp5 S-02)
- ⚠ Validar contra código actual.

---

### [testing] `waitUntil:'load'` no captura comportamiento ocurrido antes del evento `load`

- Contexto: Tests Playwright que intentan observar el estado visual del DOM durante el intervalo entre `DOMContentLoaded` y la hidratación de React / ejecución de efectos GSAP. El comportamiento que ocurre antes de `load` (auto-scroll nativo del browser al hash, instalación de pin-spacer por GSAP en `useEffect`) es invisible a un test que usa `waitUntil:'load'` como punto de entrada.
- Causa probable: `waitUntil:'load'` espera el evento `load`; cuando el test empieza a medir, los efectos pre-load ya ocurrieron. Para el caso de RC-9 (INC-001 Etapa 3): State 1 (~50–200ms, browser en `#proyectos`) y State 2 (~400ms, viewport en Blockchain tras pin-spacer) terminan antes de que cualquier `page.evaluate` pueda correr después de `waitUntil:'load'`.
- Pista: Para testear comportamiento pre-load, considerar `page.addInitScript` que registra `scrollY` a ~16ms desde el primer render, o escuchar `page.on('domcontentloaded', ...)`. `waitUntil:'load'` es una barrera de entrada para el test, no una ventana de observación del ciclo de vida completo. Si el síntoma es "el test nunca ve el estado intermedio esperado", preguntarse si ese estado ya terminó antes de que el test empezara a mirar.
- Confianza: conjetura (INC-001 Etapa 3 — investigación RC-9, primera aparición)
- ⚠ Validar contra código actual.

---

### [testing] Verificar presencia de elementos en browser real antes de escribir análisis o tests basados en code-reading

- Contexto: INC-001 Etapa 3 — GP-10B fue diseñado asumiendo que `#contacto` no existe en `/certificados`. ROOT_CAUSE_ANALYSIS afirmaba que `app/certificados/page.tsx` no incluye `ContactV2` y por tanto `id="contacto"` no está en el DOM. Sin embargo, `FooterV2.tsx:79` tiene `id="contacto"` en su root element y FooterV2 se renderiza en todas las páginas. El análisis de código puro buscó `ContactV2` (el componente específico) en lugar de buscar el atributo `id="contacto"` en todos los componentes — detectó correctamente la ausencia de ContactV2, pero no detectó que FooterV2 también porta ese ID.
- Causa probable: code-reading produce análisis de intención (¿qué componentes se incluyen?); browser real produce análisis de comportamiento (¿qué existe en el DOM?). Son preguntas distintas para casos donde múltiples componentes pueden definir el mismo ID.
- Pista: antes de escribir una aserción Playwright sobre "este elemento no existe en /X" (o "este elemento existe"), navegar a `/X` en un browser real y ejecutar `document.getElementById(id)` o `document.querySelectorAll('[id="X"]')`. Un grep de `id="contacto"` en `components/v2/**` (en lugar de grep de `ContactV2` en `page.tsx`) habría detectado FooterV2 en segundos.
- Confianza: confirmado (INC-001 Etapa 3 — detectado al intentar demostrar RED en GP-10B; bug no pudo mostrarse RED porque no existe)
- ⚠ Patrón general: para cualquier aserción de presencia/ausencia de ID en el DOM, siempre verificar en browser. Especialmente cuando hay componentes de layout (header, footer, nav) que se renderizan en todas las páginas vía root layout.

---

### [testing] El dev server de Next reenvía `console.warn`/`console.error` del browser al terminal — es el canal de diagnóstico sin Playwright

- Contexto: el área valida a mano, sin Playwright: el usuario prueba en su browser y reporta lo que ve. Diagnosticar un bug de interacción (scroll, navegación, timing) a ciegas cuesta varias iteraciones de ida y vuelta, y cada una gasta la paciencia del usuario.
- Causa probable: en dev, Next reenvía la consola del browser al terminal del server con prefijo `[browser]`, pero **solo `console.warn` y `console.error`** — un `console.log` no aparece (comprobado: la primera instrumentación se perdió entera por usar `log`).
- Pista: instrumentar con `console.warn` y leer el output del dev server directamente (si corre en background, su archivo de log). El usuario solo tiene que **hacer el flujo y decir "listo"**: no abre DevTools, no copia nada, no interpreta nada. Convierte un reporte subjetivo ("me lleva al footer") en una traza con números. Quitar la instrumentación antes de commitear, y dejar constancia con un marcador greppable (`// TEMPORAL`) mientras vive.
- Confianza: confirmado (blockchain-lab-uai INC-004, 2026-07-25)
- ⚠ Validar contra código actual.

---

### [testing] Ante un bug de navegación, instrumentar la secuencia entera antes de proponer una sola fix

- Contexto: bug reportado en términos de experiencia ("hago atrás y me lleva al footer"). La tentación es deducir el mecanismo leyendo el código y proponer la fix en la misma respuesta.
- Causa probable: la reconstrucción mental del flujo del usuario **es una hipótesis**, y en navegación se apoya en supuestos que el runtime rompe: que el click del navbar no toca el historial, que un Atrás re-renderiza React, que el `pathname` cambia, que la ida fue soft nav. Tres hipótesis seguidas fallaron por esto en un solo incidente, y una de las "fixes" rompió la navegación del navbar en producción local.
- Pista: instrumentar de una vez **toda la secuencia**, no el punto que se sospecha: un `t0 = performance.now()` y un log por cada `click` (en fase capture, con el `href`), `popstate`, `hashchange`, `pageshow`/`pagehide` (con `persisted`, delata BFCache), el efecto de ruta, más un `setInterval` de 1s con `scrollY` para ver el aterrizaje y si algo lo pisa después. Cada línea con `ms`, URL y `y=`. Esa traza única contestó, de golpe, qué evento dispara qué, si React corre, y dónde acaba el scroll — lo que tres rondas de deducción no habían acertado. Regla: **si vas a pedirle al usuario que pruebe, que esa prueba devuelva datos**, no un sí/no.
- Confianza: confirmado (blockchain-lab-uai INC-004, 2026-07-25)
- ⚠ Validar contra código actual.

---

### [testing] El pre-flight solo exime comentarios en la regla `raya`: documentar por qué quitaste un patrón prohibido lo vuelve a encender

- Contexto: se limpia una violación del gate y se deja un comentario explicando la decisión (`// antes usaba gsap.from(): pintaba antes de esconder`, `// reemplaza al startsWith('✅')`, `// ScrollTrigger en vez de addEventListener('scroll')`). El gate, que acababa de pasar a verde, vuelve a fallar señalando **el propio comentario**.
- Causa probable: el filtro de ruido de `preflight.mjs` (`soloVisible` → `sinComentarios()`) está puesto **solo en la regla `raya`**, porque nació de ese caso (72 violaciones en `enma`, casi todas rayas en comentarios). Las demás reglas (`gsap-from`, `emoji-icono`, `scroll-listener`, `h-screen`) escanean la línea entera. Es el mismo fenómeno que la pista de arriba ("un check greppable puede coincidir con su propio comentario"), pero visto desde el lado de quien **escribe el código**, no de quien escribe el check: la lección se aplicó a una regla y no se generalizó.
- Pista: al documentar la ausencia de un patrón prohibido, describirlo **sin escribirlo** ("animando solo desde JS", "el `startsWith()` con el que el render adivinaba el color", "un listener de scroll propio"). El comentario explica igual y el gate no lo ve. La alternativa de fondo es añadir `soloVisible: true` a las reglas cuyo patrón, dentro de un comentario, **no llega al navegador** (`gsap-from`, `emoji-icono`, `scroll-listener`): un emoji en un comentario no se pinta y un `gsap.from(` comentado no corre, así que ahí el match es un falso positivo por definición. Decisión pendiente del área: mientras no se toque el script, gana la primera vía.
- Confianza: confirmado (`blockchain-lab-uai`, limpieza del gate de 41 a 0, 2026-07-25)
- ⚠ Validar contra código actual.

---

### [testing] Un grep prueba la ausencia de un patrón; nunca prueba velocidad — «carga rápido» sin medición es una conclusión fabricada

- Contexto: se audita un sitio contra una lista de costos conocidos de pintura y carga (la pista de portabilidad en [animation.md](animation.md)), los patrones no aparecen, el pre-flight sale verde y el build compila. La pregunta que sigue —«entonces podemos decir que carga rápido y sin repintado?»— llega con la respuesta ya insinuada, y firmarla cuesta una línea.
- Causa probable: cada evidencia prueba exactamente una cosa y la tentación es estirarla. Un **grep** prueba que un patrón no está en el código, y nada más. El **pre-flight** cobra leyes greppables: no mide, y su verde no es un veredicto de rendimiento. El **build** entrega bytes —805 KB de JS sin comprimir en `numerologia`, con Next + React + GSAP— y los bytes no son tiempo. Ninguno de los tres produce un LCP, un TTFB ni un INP. El error se agrava porque el área **prohíbe Playwright a propósito**: no hay herramienta automática que mida, así que el hueco no se nota como un paso que faltó correr, sino como un paso que no existe. Y el absoluto se cuela por el lado ("sin repintado" cuando sí hay uno acotado y deliberado: un `filter: blur()` animado de 0,95 s en el Hero).
- Pista: separar siempre **ausencia verificada** de **velocidad medida**, y decirlo en la frase. Lo que la auditoría estática sí sostiene: *«no tiene ninguno de los costos conocidos, y sirve la landing como estático»*. Lo que exige un número: *rápido, fluido, ligero* —todo lo que nombra lo que el usuario percibe—. El número lo produce el humano, que es quien valida en esta área: `npm run build && npm start`, y Lighthouse en móvil con throttling sobre `localhost`. Mientras ese número no exista, la frase honesta es **«su velocidad percibida no está medida»**, dicha sin que la pregunten. Y ningún absoluto de pintura sin haber buscado antes los repintados acotados: `filter:`, `blur(`, `box-shadow` animados.
- Confianza: confirmado (`numerologia`, auditoría contra `blockchain-lab-uai`, ago-2026)
- Frontera de validez: aplica a toda afirmación sobre **lo que el usuario percibe** —velocidad, fluidez, ligereza—, no a las de ausencia de un patrón concreto, que un grep sí prueba y que se pueden firmar tal cual. **No hereda la frontera de la pista de portabilidad de [animation.md](animation.md)**, aunque la cite: aquella acota *qué arreglos viajan entre sitios* (pintura no, carga sí) y esta acota *qué prueba cada evidencia* — son ejes distintos, y esta vale igual para pintura y para carga.
- ⚠ Validar contra código actual.
