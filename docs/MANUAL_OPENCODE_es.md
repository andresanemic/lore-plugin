# LORE PLUGIN · SETUP MULTIPROVEEDOR

# De una máquina nueva al primer proyecto con criterio portable

**Versión de campo 0.2 · Windows x64 · Redacción: 2026-10-06**  
**Lore Plugin 2.5.2 (corte local, aún sin publicar) con el kernel de Vespi fijado en 0.1.6.** Las interfaces, los modelos gratuitos y los mecanismos de instalación cambian. Verifica las fuentes antes de seguir el recorrido.

## La idea

No necesitas elegir un modelo para siempre, sino un lugar donde distintos modelos compartan proyecto, estado y criterio entre sesiones. Aquí será OpenCode. En la segunda jornada sumaremos Claude Code, Codex si lo necesitas, y el primer Área, Proyecto y Bot.

Lore Plugin conserva criterio ganado entre agentes y modelos. El modelo cambia; archivos, estado y criterio permanecen en el proyecto.

## Mapa del sistema

```text
              MODELO GRATUITO DE OPENCODE ZEN
                            │
                            ▼
                         OpenCode ─────── Claude Code
                            │                    │
                            └────────┬───────────┘
                                     ▼
                                   C:\IA
                                     │
                       ┌─────────────┴─────────────┐
                       │                           │
                     ÁREAS                       BOTS
                       │                           │
                   PROYECTOS ◄────── federación ──┘
                       │
                      LORE
                       │
             criterio separado del estado
```

Codex puede sumarse como otro host. Vespi coordina operaciones acotadas bajo autoridad y verificación.

## 0. Qué vamos a instalar

| Pieza | En este recorrido | Función |
|---|---|---|
| OpenCode | Necesario | Primer host y casa visual del recorrido |
| Un modelo gratis o Contributor de OpenCode Zen | Necesario para el bootstrap | Ayudar a preparar el entorno |
| Git | Necesario | Control de versiones y descarga del kit |
| VS Code | Recomendado | Editor convencional complementario |
| Obsidian | Recomendado | Editor de notas opcional; no es requisito de Lore |
| Superpowers | Recomendado | Complemento comunitario para trabajo de software |
| Lore Plugin 2.5.2 | Necesario | Criterio portable, Áreas, Proyectos y Bots |
| Claude Code | Segunda jornada | Segundo host para el mismo proyecto |
| Codex | Opcional | Otro host, si ya forma parte de tu flujo |
| Node.js | Necesario para instalar desde el clon | Ejecutar el instalador del kit y su CLI local |

> **Regla de recorrido**  
> No instalaremos todo en una sola ráfaga. Cada tramo termina en una puerta con una prueba. Si no queda verde, no seguimos. Una instalación que no puedes repetir y comprobar todavía no cuenta como instalación portable.

## Primera jornada: llegar a Lore Plugin instalado y verificado

### 1. Bootstrap: instalar OpenCode

OpenCode no puede instalarse a sí mismo. Descárgalo para Windows desde el sitio oficial. El método depende de la edición; comprueba que la aplicación abre y puede iniciar una sesión.

> **Bootstrap**  
> El host se instala fuera del agente. Después el agente puede ayudarte a preparar el entorno dentro de los límites que tú apruebes.

**Le decimos al agente:**

```text
Ayúdame a comprobar que OpenCode está instalado y abre correctamente. No instales ni cambies nada; dime qué comprobarás y espera mi respuesta.
```

**Puerta 1 — GREEN**

OpenCode abre, puedes crear una conversación y ves dónde seleccionar proveedor y modelo. Si la aplicación no inicia o no puedes abrir una sesión, detente y resuelve eso antes de continuar.

### 2. Elegir un modelo de arranque

En OpenCode, usa `/connect`, elige OpenCode Zen y completa la autenticación; luego consulta `/models`. Escoge un modelo marcado gratuito o Contributor. El catálogo rota, así que anota en `SETUP-LOG.md` el nombre exacto que muestra el selector y la fecha.

Ejemplos vistos el 2026-09-15: Big Pickle, MiMo-V2.5 Free y Muse Spark 1.3 Contributor Free. Son referencias fechadas, no una lista vigente.

> **Límite**  
> Gratuito no significa local ni privado. Revisa las condiciones del proveedor antes de compartir material confidencial o credenciales.

**Le decimos al agente:**

```text
Ayúdame a conectar OpenCode Zen. Muéstrame los modelos que hoy aparezcan gratuitos o Contributor y espera mi elección. Anota el nombre exacto y la fecha en SETUP-LOG.md. No guardes credenciales.
```

**Puerta 2 — GREEN**

Abre una conversación nueva y pide: `Responde únicamente: SETUP READY; modelo: <nombre exacto del selector>`. La respuesta debe identificar el modelo seleccionado. Confirma que el mismo nombre quedó en `SETUP-LOG.md`. Si no puedes obtener respuesta, revisa autenticación y selección antes de seguir.

### 3. Crear la raíz y preparar herramientas base

Antes de crear Áreas o Lore, prepara `C:\IA\setup\SETUP-LOG.md`, fuera de `lore/`. Es un registro técnico de la instalación, no criterio.

**Le decimos al agente:**

```text
Prepara un plan para crear C:\IA, C:\IA\setup y SETUP-LOG.md con fecha, herramienta, método, versión y estado GREEN/RED. No crees Áreas, Proyectos, Bots o Lore ni instales nada. Muestra el plan y espera mi aprobación.
```

Instala Git, VS Code y, si te sirve, Obsidian, uno por uno. Usa sus sitios oficiales o confirma que el identificador actual de WinGet corresponde al producto. Aprueba cada cambio; después verifica la versión o abre la aplicación y registra el resultado.

**Le decimos al agente:**

```text
Instalemos Git, VS Code y, opcionalmente, Obsidian, una por una. Antes de cada cambio dime la fuente, el comando y su efecto; espera mi aprobación. Verifica cada herramienta antes de seguir y registra el resultado en C:\IA\setup\SETUP-LOG.md. No cambies otras configuraciones.
```

Configura el nombre y correo de Git solo después de que te los pregunte. El agente no debe inventarlos ni registrar datos personales en el log sin que se lo pidas.

**Puerta 3 — GREEN**

Git responde a `git --version`, VS Code abre, Obsidian abre si lo instalaste y `SETUP-LOG.md` contiene los resultados. Comprueba que el registro vive en `C:\IA\setup`, fuera de cualquier `lore/`.

### 4. Superpowers, complemento recomendado

Superpowers es una colección comunitaria de skills de desarrollo, opcional y ajena a Lore Plugin. Si la eliges, sigue sus instrucciones oficiales actuales para OpenCode, reinicia si lo piden y verifica que el host la reconoce. Si no, continúa.

**Le decimos al agente:**

```text
Instala Superpowers como complemento opcional siguiendo https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.opencode/INSTALL.md. Lee mi configuración, conserva lo existente y muéstrame el diff antes de guardar. Si la guía cambió o contradice una instalación previa, detente y explícame. Luego verificaremos sus skills.
```

**Puerta 4 — GREEN, si instalaste Superpowers**

Después del reinicio, pide al agente que describa qué skills de Superpowers detecta y comprueba la respuesta. Si no lo instalaste, deja anotado «omitido, opcional» y sigue.

### 5. Instalar Lore Plugin en OpenCode

En OpenCode, usa el instalador del kit desde un clon del repositorio. Necesitas Git y Node.js. El clon público usa la versión `v2.5.2`. Desde un clon local de esta rama:

```powershell
git clone https://github.com/andresanemic/lore-plugin.git "$env:USERPROFILE\Tools\lore-plugin"
Set-Location "$env:USERPROFILE\Tools\lore-plugin"
node scripts/lore-plugin.mjs install --target opencode
```

El instalador copia y verifica las skills, el hook, la marca TUI, `tui.json` y la CLI local. Reinicia OpenCode y revisa el resultado. No edites `opencode.jsonc` para descubrir el plugin local.

**Le decimos al agente:**

```text
Instala Lore Plugin desde mi clon local con node scripts/lore-plugin.mjs install --target opencode. Antes revisa la instalación y detecta duplicados. Conserva skills ajenas y no dejes copias de Lore duplicadas. No crees Lore todavía. Al terminar, informa qué instaló y verificó.
```

**Puerta 5 — GREEN: Lore instalado**

Reinicia OpenCode. Pide al host que enumere sus skills de Lore sin ejecutar ninguna. Las ocho skills de Lore que debe traer el kit son `use-lore`, `brainstorming-lore`, `create-area`, `create-project`, `save-to-lore`, `transmute-lore`, `create-bot` y `stale-lore`. Además, 2.5.2 incluye la skill experimental `vespi`, descrita en su sección. `obsidian-lore` no forma parte del kit. Comprueba las rutas, que no haya copias duplicadas y que la salida del instalador informe verificación correcta. Si aparece `obsidian-lore`, anota su ruta y confirma si es un residuo de otra instalación antes de quitarlo. Todavía no crees Lore: ése es el punto correcto para cerrar la primera jornada.

**Le decimos al agente:**

```text
Usa la herramienta de skills de OpenCode para enumerar las skills disponibles relacionadas con Lore Plugin. No cargues ni ejecutes ninguna todavía. Espero ver use-lore, brainstorming-lore, create-area, create-project, save-to-lore, transmute-lore, create-bot y stale-lore; confirma también que ves vespi como skill experimental. obsidian-lore no forma parte del kit: si aparece, informa su ruta y no la borres. Señala rutas duplicadas o faltantes y no cambies nada.
```

## Segunda jornada: los otros hosts y el primer trabajo

### 6. Instalar Claude Code y el plugin Lore

Claude Code es otro host y no hereda las skills de OpenCode. En Windows, usa el instalador nativo oficial desde PowerShell. En una terminal nueva, comprueba `claude --version` y `claude doctor`. Tú haces el login.

**Le decimos al agente:**

```text
Instala Claude Code en Windows con `irm https://claude.ai/install.ps1 | iex`. Explícame el comando y espera mi aprobación. No uses mis credenciales ni inicies sesión. Comprueba claude --version y claude doctor, registra el resultado y detente antes del login.
```

Desde el mismo clon `v2.5.2` que usaste para OpenCode, ejecuta el instalador de Claude. Este comando llama al marketplace oficial de Claude Code, instala la CLI local del kit y conecta el indicador de estado. Depende de que la versión `v2.5.2` esté disponible en el repositorio público:

```powershell
node scripts/lore-plugin.mjs install --target claude
```

**Le decimos al agente:**

```text
Ejecuta node scripts/lore-plugin.mjs install --target claude desde el clon `v2.5.2`. Antes de modificar nada, explica los comandos del marketplace y las rutas locales que tocarás. No uses mis credenciales. Abre una sesión nueva y confirma las ocho skills de Lore y vespi. No borres instalaciones existentes sin mostrarme sus rutas.
```

Abre una sesión nueva según indique Claude Code.

**Puerta 6 — GREEN**

Confirma que Claude Code inicia sesión y que el selector muestra las ocho skills de Lore y `vespi`. El marketplace carga el plugin; la CLI local y el indicador de estado son piezas aparte.

### 7. Codex, si lo necesitas

Codex es opcional. Desde un clon local, `node scripts/lore-plugin.mjs install --target codex` copia el paquete y prepara el marketplace personal. Después ejecuta `codex plugin add lore@personal` y habilítalo desde Codex. Los comandos públicos usan la versión `v2.5.2`.

**Le decimos al agente:**

```text
Prepara Codex como host opcional según el README de esta versión. Antes de cambiar configuración, muéstrame las rutas y el diff. Ejecuta node scripts/lore-plugin.mjs install --target codex y verifica los componentes. Después ejecuta codex plugin add lore@personal. No uses credenciales.
```

**Puerta 7 — GREEN, si instalaste Codex**

Abre Codex en un proyecto de prueba y confirma que detecta el plugin y sus skills. Si no usas Codex, marca esta etapa como omitida y continúa con Claude Code y OpenCode.

### 8. Un contrato para este piloto

Para este piloto proponemos un cuerpo de instrucciones en `AGENTS.md` y un adaptador `CLAUDE.md` que lo importe con `@AGENTS.md`. Es una **convención del piloto**, no canon de Lore Plugin. Comprueba que cada host lee el archivo esperado.

```text
AGENTS.md ───────────────► Codex y OpenCode
   ▲
   │ @AGENTS.md
CLAUDE.md ───────────────► Claude Code
```

**Le decimos al agente:**

```text
Inspecciona los contratos y propone un solo cuerpo en AGENTS.md, con CLAUDE.md como adaptador @AGENTS.md. Es una convención del piloto, no canon. Muestra el diff y espera aprobación. Comprueba qué contrato lee cada host.
```

**Puerta 8 — GREEN**

OpenCode y Codex encuentran `AGENTS.md`; Claude Code encuentra `CLAUDE.md` y el contenido importado. Si no puedes comprobar una lectura, registra esa limitación y no afirmes que el contrato es compartido.

### 9. Crear el primer Área y Proyecto

Abre un host en `C:\IA` y usa la frase de inicio. El kit inspecciona el árbol y el criterio, pregunta de una cosa por vez y trabaja hacia un artefacto. No anticipes Áreas ni copies un sistema ajeno sin decidir qué territorio gobierna.

**Le decimos al agente:**

```text
Quiero comenzar a usar Lore Plugin, ayúdame. Revisa C:\IA y comprueba si hay contrato, lore/ o FASES.md. Pregúntame una cosa por vez y ayúdame a crear el primer artefacto necesario. Antes de escribir criterio, presenta la propuesta y espera mi aprobación.
```

Con un Área real, `create-project` crea cada Proyecto en `{Área}/proyectos/{slug}/`. Su Lore propio referencia el criterio del Área sin copiarlo. Lore persiste; `FASES.md` refleja estado y plan.

**Puerta 9 — GREEN**

El primer Área tiene su contrato, `lore/` y `FASES.md`; el Proyecto vive dentro de `proyectos/` y sus referencias al Área resuelven. Revisa el diff antes de aceptar cualquier criterio.

### 10. Diseñar el primer Bot

Un Bot permite abrir sesión y trabajar en varios Proyectos con criterio enrutado. `create-bot` define qué gobierna, qué deja fuera y a qué Áreas o Proyectos apunta. Federar es apuntar al Lore de origen, no copiarlo. Superpowers es opcional.

**Le decimos al agente:**

```text
Diseñemos mi primer Bot. Revisa Áreas y Proyectos; usa create-bot para decidir qué atenderá, qué queda fuera y a qué fuentes apuntará. Pregunta una cosa por vez. No copies Lore. Presenta el diseño y espera mi aprobación antes de escribir.
```

**Puerta 10 — GREEN**

El Bot tiene un propósito, un límite y una tabla de enrutamiento revisables. Cada ruta resuelve al árbol correcto y los criterios federados siguen viviendo en su origen.

## Vespi

### Qué es y cuándo se usa

Vespi es un kernel JavaScript integrado en la skill `vespi`. Úsalo cuando una operación acotada continúe entre sesiones, requiera autoridad o deba comprobarse antes de reanudar. Declara objetivo, responsable, efecto y autoridad humana acotada antes de actuar; verifica el efecto aparte y deja un recibo con lo observado, lo no comprobado y la siguiente acción acordada. El estado vive bajo `## Operaciones` en el `FASES.md` del proyecto. El recibo no concede permiso.

El trabajo ordinario no necesita Vespi. Una frase de tensión no la invoca: `use-lore` la enruta al coordinador. Solo `save-to-lore` arbitra escritura de criterio; Vespi no escribe Lore.

### Cómo se invoca en cada host

- **OpenCode:** las skills se cargan con la herramienta de skills. Pide al coordinador evaluar la operación e invocar `vespi` si corresponde.
- **Claude Code:** instala Lore por separado. Pide al coordinador usar `vespi` si corresponde y confirma que la skill aparece en una sesión nueva.
- **Codex:** instala y habilita Lore; confirma que descubrió `vespi` y pide al coordinador evaluarla.

En los tres hosts, «sigamos mañana» es una señal para el coordinador, no una autorización ni una invocación directa.

### Recorrido mínimo

Practica con una nota local y reversible. Define quién autoriza, el archivo exacto y una comprobación aparte. No uses pagos, red ni efectos irreversibles para aprender.

**Le decimos al agente:**

```text
Quiero crear <ruta-del-proyecto>/vespi-demo.md y continuar después de esta sesión. Revisa contrato y FASES.md. Si corresponde, usa vespi para declarar objetivo, responsable, efecto, autoridad y verificación. Espera mi aprobación antes de escribir. Comprueba el archivo por separado, deja estado y recibo donde indica el kit, y di qué quedó verificado. No contactes servicios externos.
```

**Puerta Vespi — GREEN**

El bloque bajo `## Operaciones` aparece en `FASES.md`; el permiso corresponde al efecto declarado; la comprobación observó el archivo; y el recibo separa cobertura de límites. Cierra la sesión, vuelve al proyecto y pide continuar. Antes de seguir, el coordinador vuelve a leer contrato, `FASES.md`, recibo y autoridad. Si una premisa material cambió o la evidencia no alcanza, se detiene y pide la decisión que falta.

### Qué trae 0.1.6 y qué no

El kit fija la copia congelada de Vespi 0.1.6 del commit `7767daa369e464b486ddf16b08b8985e59ec107d`, con operaciones, autoridad concedida, decisiones humanas, recibos, delegaciones acotadas y reanudación. La fachada `skills/vespi/core/vespi.mjs` declara, desde la copia vendorizada, las cuatro superficies opcionales presentes (`capabilities.md` solo las describe): permisos de emergencia, procedencia de skills, pagos x402 y verificación ZK. No se incluye `zk-bn254-reference.js`, una referencia criptográfica experimental, ni el puente x402 con el SDK real; las superficies no se conectan automáticamente y siguen en validación de campo.

La documentación del kernel incluye evidencia histórica de testnet; este recorrido no ejecuta transacciones y esa evidencia no es una auditoría. 0.1.6 no incluye recibos encadenados con `prev`, intención previa al efecto, presupuestos acumulados, `narrow(parent, child)` ni época de reanudación. El host aporta el reloj; los puertos son código confiable, no un sandbox. El digest protege integridad, no autentica aprobaciones ni prueba efectos externos.

### Verificación de cobertura

Antes de 2.5, la verificación de una operación bastaba con que el runner ejecutara sin errores. Desde 2.5, el kit aplica un criterio de adecuación: verifica que el runner **cubra la obligación encargada**, no solo que corra. Si un runner Node no accede a las fuentes declaradas en el encargo (`p.sources`, `packet.sources` o por referencia explícita), la verificación rechaza el resultado aunque el runner haya terminado con código 0. Esta comprobación es mecánica — analiza el cuerpo del runner, no ejecuta las fuentes — y solo aplica a las fuentes declaradas explícitamente en `task.sources`, no a las resueltas automáticamente del criterio propietario.

La integración y el cierre recogen esta cobertura: la evidencia aún debe corresponder al resultado y sus entradas; el trabajo descubierto se registra como parcial.

### El campo `ejercido`

El recibo del kernel incluye ahora un campo `ejercido` con tres valores posibles:

| Valor | Significado |
|---|---|
| `ejercido` | El recibo existe y la capacidad se ejerció dentro del umbral |
| `no-ejercido` | El recibo existe pero un humano decidió que la capacidad no se ejercía |
| `stale` | No hay recibo dentro del umbral, o no hay recibo jamás |

La skill `stale-lore` retira con rastro declarativo aquellas capacidades que cruzan el umbral de inactividad — siete días por defecto — y escribe la entrada en `CHANGELOG.md`. El retiro no borra la skill del kit: declara que la capacidad sin ejercicio carece de mantenimiento y deja la decisión al usuario.

## Continuidad ante la compactación

Tras compactar o reanudar, `use-lore` exige releer el contrato, Lore conectado y `FASES.md`, comprobar enlaces y reconstruir el trabajo desde archivos. Claude Code y Codex tienen hooks que dejan una marca antes de compactar y avisan al reanudar. OpenCode no ofrece al plugin el mismo evento de compactación; ahí guarda el estado antes de llegar al límite y aplica la regla al reabrir la sesión o recibir el siguiente pedido. Ningún host recupera datos nunca escritos. Vespi revalida autoridad, premisas y recibo antes de seguir; reanudar no autoriza efectos.

## Prueba final: cambiar de modelo sin cambiar de trabajo

Comprueba el recorrido en el mismo Proyecto:

1. Abre el Proyecto en OpenCode y pregunta qué Lore, contrato y `FASES.md` lo gobiernan.
2. Cambia de modelo y continúa sobre los mismos archivos.
3. Abre la carpeta con Claude Code y confirma que lee contrato y estado. Repite en Codex si lo instalaste.
4. Resuelve una fricción. Si revela criterio, pide «guarda esto en Lore» y revisa el diff.

**Puerta final — GREEN**

Un segundo modelo y otro host pueden continuar el trabajo desde los mismos artefactos sin que tengas que reconstruir el proyecto verbalmente. El criterio sigue en archivos del proyecto, los cambios quedan verificables y ninguna skill escribió Lore sin tu aprobación.

## Qué no hace Lore Plugin ni Vespi

Lore Plugin no garantiza respuestas correctas, no añade criterio sin aprobación y no sustituye tu juicio. `FASES.md` registra estado y plan. Instalar una skill en un host no prueba que otro la cargó. Vespi no es agente permanente, scheduler ni motor universal de persistencia. Un recibo no concede autoridad ni prueba por sí solo un efecto externo. Los permisos del host siguen decidiendo qué puede ejecutar el agente.

## Fuentes técnicas y estado

Versión de campo redactada el 2026-10-06. Las interfaces, los modelos gratuitos y los mecanismos de instalación pueden cambiar; vuelve a verificar antes de publicar este manual.

- OpenCode: https://opencode.ai/docs/, https://opencode.ai/download/, https://opencode.ai/docs/windows-wsl, https://opencode.ai/docs/providers, https://opencode.ai/docs/skills y https://opencode.ai/docs/zen (consultado 2026-10-05; la oferta gratuita rota).
- Claude Code, instalación, verificación y plugins: https://code.claude.com/docs/en/setup y https://code.claude.com/docs/en/plugins (consultado 2026-10-05).
- Codex, plugins y marketplaces: https://developers.openai.com/plugins/build/plugins (consultado 2026-10-05).
- Superpowers, instalación por host y guía OpenCode: https://github.com/obra/superpowers y https://github.com/obra/superpowers/blob/main/docs/README.opencode.md (consultado 2026-10-05).
- Git for Windows, WinGet, Visual Studio Code y Obsidian: https://git-scm.com/install/windows, https://learn.microsoft.com/windows/package-manager/winget/install, https://code.visualstudio.com/Download y https://obsidian.md/help/Getting%2Bstarted/Download%2Band%2Binstall%2BObsidian (consultado 2026-10-05).
- Lore Plugin, fuente de instalación, comandos y ocho skills: `README.md`, `scripts/installer.mjs`, `scripts/lore-plugin.mjs` y `skills/` de este kit. Usa la versión `v2.5.2` para los comandos públicos de instalación. La octava skill, `stale-lore`, se describe en `skills/stale-lore/SKILL.md`.
- Vespi 0.1.6 y evidencia: `skills/vespi/SKILL.md`, `skills/vespi/capabilities.md`, `docs/RELEASE_2.5.2.md` de este kit y el `README.md`, `docs/CAPABILITIES.md`, `docs/RELEASE_0.1.5_KERNEL.md`, `docs/WALKTHROUGH.md` y `docs/TESTNET_EVIDENCE.md` del repositorio del kernel. No implica una conexión en vivo desde el kit.

## Nota de procedencia

Adapta estructura y tono del tutorial maestro v0.1 de Andrés: mapa, puertas, recuadros, dos jornadas y prueba final. Quita Ollama, Qwen, Ponytail y modelos locales; Superpowers queda recomendado. Actualiza skills (ahora ocho, con `stale-lore`) e instalación por host; añade Vespi 0.1.6, verificación de cobertura y el campo `ejercido` en el recibo. Continuidad tras compactar. Aplica correcciones del 2026-10-06.
