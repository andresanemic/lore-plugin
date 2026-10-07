LORE PLUGIN · TUTORIAL MAESTRO DE SETUP

# SO LORE
# Tutorial maestro de configuración inicial

## De una máquina nueva al primer proyecto con criterio portable

**Versión de campo 0.2 · Windows x64 · macOS · Ubuntu LTS · Redacción: 2026-10-07**

Andrés Peña Mellado · Telegram: @andresanemic · X: @andresanemic · a.leonardopm@gmail.com

---

> **La idea**
> No necesitas elegir un modelo para siempre. Necesitas un lugar donde distintos modelos puedan entrar al mismo trabajo sin llevarse el proyecto, su estado o su criterio cuando termina la sesión.

En este recorrido, ese lugar se llama **SO Lore**: el terreno (**Lore Plugin**) y el kernel (**Vespi**).

Empezaremos con un modelo gratuito para hacer el bootstrap. Después añadiremos herramientas, skills y, si las quieres, otras inteligencias: Claude Code en la nube y más adelante Codex u otros hosts.

> **Estado de publicación**
> El kit es *candidato* 2.5.0-rc.1. El repositorio remoto tiene ramas `release/2.5-prep` y `release/0.1.5-prep`, pero **no hay tags publicados**. Todo lo que este tutorial marca **[verificar al publicar]** depende de que el remoto exponga 2.5. Verifica antes de prometer este manual a alguien.

> **Voz**
> En la versión 0.1 cada paso decía «Le damos a Muse», porque el modelo estaba fijado de antemano. Hoy el modelo lo eliges tú, así que decimos «Le damos al modelo». Si prefieres fijar uno para todo el tutorial, elige el del §3 y sustituye.

---

# Mapa del sistema

```text
                    TU INTERFAZ
        OpenChamber  ·  desktop, web/PWA o vista de VS Code
                             │
                             ▼
   MODELOS ──────────────►  OpenCode  ◄──────────  Claude Code
   el que tú elijas                       ◄──────────  Codex
                             │
                             └────────────┬────────────┘
                                          ▼
                                    RAÍZ DE TRABAJO
                                   C:\IA  ·  ~/IA
                                          │
   ┌──────────────────────────────────────┴──────────────────────────────────────┐
   │  VESPI · kernel de operación                                            │
   │  objetivo · autoridad acotada · verificación por separado · recibo        │
   │  No escribe criterio. No decide por ti. El trabajo ordinario no lo usa.  │
   └──────────────────────────────────────┬──────────────────────────────────────┘
                                          │
                       ┌──────────────────┴──────────────────┐
                       │                                     │
                     ÁREAS                                  BOTS
                       │                                     │
                   PROYECTOS  ◄────────  federación  ───────┘
                       │
                      LORE
                       │
           criterio separado del estado
```

> **Principio de continuidad**
> El modelo cambia. El trabajo no.

Lore Plugin busca conservar criterio ganado que pueda seguir operando entre agentes y modelos, no memoria encerrada en una conversación.

---

# 0. Qué vamos a instalar

Para este primer caso, distinguimos claramente el piso de lo opcional.

| Pieza | En este setup | Función |
|---|---|---|
| OpenChamber | obligatorio | la casa visual del recorrido; corre sobre OpenCode |
| OpenCode Desktop | obligatorio | el host y motor bajo la interfaz |
| Un modelo gratuito o Contributor | obligatorio al comenzar | modelo para hacer el bootstrap |
| Git | obligatorio | historia verificable del trabajo |
| Node.js | obligatorio | corre el instalador del kit y su CLI local |
| Lore Plugin 2.5.0-rc.1 | obligatorio | criterio portable, Áreas, Proyectos y Bots |
| Superpowers | recomendado | diseño, specs, planes, ejecución disciplinada |
| VS Code | recomendado | editor de texto complementario, o portador de la extensión de OpenChamber |
| Obsidian | recomendado | notas y futura fuente para `obsidian-lore` |
| Vespi (kernel) | recomendado | operaciones que sobreviven a la sesión; experimental |
| Claude Code | segunda jornada | segundo host, Claude en nube |
| Codex | no todavía | futuro host opcional |

> **Regla de recorrido**
> No instalaremos todo en una sola ráfaga. Cada tramo termina en una prueba. Si la prueba no queda verde, no seguimos.

Una instalación que no puede repetirse y comprobarse todavía no cuenta como instalación portable.

## 0.1 Los tres sistemas

El recorrido se escribe **una sola vez**. Lo único que cambia entre sistemas es dónde vive la raíz, qué gestor de paquetes usas y qué paquete bajas de OpenCode y OpenChamber.

| | Windows x64 | macOS | Ubuntu LTS |
|---|---|---|---|
| Raíz de trabajo | `C:\IA` | `~/IA` | `~/IA` |
| Registro de instalación | `C:\IA\setup\SETUP-LOG.md` | `~/IA/setup/SETUP-LOG.md` | `~/IA/setup/SETUP-LOG.md` |
| Herramientas base | `winget install …` | `brew install …` | `sudo apt install …` |
| Clon del kit | `%USERPROFILE%\Tools\lore-plugin` | `~/Tools/lore-plugin` | `~/Tools/lore-plugin` |
| Config global de OpenCode | `%USERPROFILE%\.config\opencode\` | `~/.config/opencode/` | `~/.config/opencode/` |

Todo lo demás — los prompts, las puertas, el criterio y la prueba final — es idéntico en las tres.

---

# 1. Bootstrap: instalar OpenCode a mano

Hay una única paradoja en la idea de «instalar todo desde OpenCode»:

> **Bootstrap**
> OpenCode no puede instalar OpenCode.

Éste es el único bootstrap que haremos fuera del agente.

**Windows x64.** OpenCode distribuye una aplicación Desktop nativa, separada de su TUI/CLI:

```powershell
# Descarga el binario standalone y descomprímelo donde lo quieras usar.
# https://opencode.ai/download
```

**macOS**

```bash
brew install anomalyco/tap/opencode-v2
```

**Ubuntu LTS**

```bash
curl -fsSL https://opencode.ai/v2/install | bash
```

Después instala y abre la aplicación. En Windows también puedes seguir el recorrido dentro de WSL usando la vía de Ubuntu.

> **Puerta 1 — GREEN**

Todavía no necesitamos que programe nada. Sólo necesitamos:

```text
✓ OpenCode Desktop
✓ abre
✓ puede crear/abrir una sesión
✓ muestra selector de modelos/proveedores
```

Si eso ocurre, seguimos.

---

# 2. Instalar OpenChamber: la casa visual del recorrido

OpenCode solo vive en la terminal. OpenChamber es la pantalla alrededor: sesiones ramificadas, revisión de diffs, terminales, progreso de herramientas y el tablero completo mientras el agente trabaja. Corre **sobre** OpenCode, así que aquí ya lo tienes instalado.

Es la interfaz que recomendamos en este tutorial, y la que usamos en SO Lore. Si prefieres la terminal y el resto te sirve igual, puedes seguir el recorrido entero sin esto.

**Windows x64**

```text
Instala la extensión OpenChamber desde el marketplace de VS Code,
o usa la vía web + PWA:

  curl -fsSL https://raw.githubusercontent.com/openchamber/openchamber/main/scripts/install.sh | bash
  openchamber --ui-password 'tu-contraseña-segura'

Abre la URL que imprima el CLI y usa «Install» en el navegador
para dejarla a mano.
```

**macOS**

```text
Descarga la última build desktop desde la página de releases de OpenChamber,
o usa la misma vía web + PWA de arriba.
```

**Ubuntu LTS**

```bash
curl -fsSL https://raw.githubusercontent.com/openchamber/openchamber/main/scripts/install.sh | bash
openchamber --ui-password 'tu-contraseña-segura'
```

> **Contraseña de UI**
> Si planeas abrir OpenChamber a internet o entrar desde tu teléfono, usa una contraseña fuerte. Sin ella, cualquiera que alcance el puerto entra a tu sesión.

> **Puerta 2 — GREEN**

```text
✓ OpenChamber abre
✓ muestra tus sesiones de OpenCode
✓ puedes abrir una conversación
```

Si no instalaste OpenChamber, anota «omitido, opcional» y sigue por la terminal.

---

# 3. Darle una primera inteligencia

Aquí aparece una distinción que el tutorial oficial debería conservar.

> **Límite**
> Gratuito no significa local ni privado.

OpenCode Zen ofrece modelos gratuitos y Contributor con coste de tokens declarado como Free, pero **la oferta rota**. Además, la modalidad Contributor puede permitir el uso de prompts y completions para entrenamiento según las condiciones vigentes del proveedor.

Por eso un modelo gratuito de arranque sirve muy bien para:

- instalar herramientas
- crear carpetas
- configurar hosts
- hacer pruebas públicas
- aprender el flujo
- proyectos sin información sensible

No lo usarías para secretos, credenciales ni material confidencial.

> **Deuda documental visible**
> El catálogo de modelos gratuitos de OpenCode Zen cambia, y este tutorial no puede fijar uno sin volverse falso. Anota en `SETUP-LOG.md` el **nombre exacto que muestre hoy tu selector** y la fecha. Los ejemplos que había en la 0.1 (Muse Spark 1.3 Contributor Free, Big Pickle, MiMo-V2.5 Free) son referencias fechadas, no una lista vigente.

## 3.1 Conectar OpenCode Zen

En OpenChamber abre la configuración del proveedor; en la terminal, `/connect`. Documentación oficial: `/connect` autentica, obtiene la API key, y después `/models` deja escoger.

Después selecciona el modelo que anotaste.

**Prueba:**

```text
Responde únicamente: SETUP READY; modelo: <nombre exacto del selector>
```

Queremos ver una respuesta. Nada más.

> **Puerta 3 — GREEN**

```text
✓ respuesta recibida
✓ identifica el modelo que estás usando
✓ el mismo nombre quedó anotado en SETUP-LOG.md
```

Y desde este momento el modelo puede ayudarnos a construir el resto de la máquina.

---

# 4. Crear la raíz antes de crear proyectos

Todavía no crearemos un Área. Todavía no crearemos Lore. Primero necesitamos un terreno.

En la primera sesión:

```text
Quiero preparar este computador para trabajar con Lore Plugin.
Por ahora no crees ningún Área, Proyecto, Bot ni Lore. Crea solamente:

  <RAÍZ>/
  <RAÍZ>/setup/

Dentro de <RAÍZ>/setup crea SETUP-LOG.md.

Ese archivo es un registro técnico de instalación, NO es Lore.
Por cada herramienta que instalemos registra:
  - fecha
  - herramienta
  - método de instalación
  - versión verificada
  - estado GREEN/RED
  - cualquier problema encontrado

No instales nada todavía. Muéstrame primero lo que vas a hacer
y espera mi aprobación.
```

`<RAÍZ>` es `C:\IA` en Windows, `~/IA` en macOS y Ubuntu (§0.1).

Ésta será una pieza muy valiosa para nuestro caso de estudio:

```text
<RAÍZ>/
└── setup/
    └── SETUP-LOG.md
```

> **Frontera**
> El registro cuenta qué hicimos. No gobierna qué debemos hacer después. Por eso no pertenece a `lore/`.

---

# 5. Instalar las herramientas base desde el modelo

Ahora podemos decirle:

```text
Vamos a preparar las herramientas base.
Instala y verifica UNA POR UNA:
  1. Git
  2. Visual Studio Code
  3. Obsidian

No instales la siguiente hasta haber comprobado la anterior.

Antes de ejecutar cada instalación:
  - dime el comando
  - dime qué va a modificar
  - espera mi aprobación

Después:
  - verifica la versión o instalación
  - registra el resultado en <RAÍZ>/setup/SETUP-LOG.md

Usa el gestor de paquetes nativo del sistema cuando haya un paquete
adecuado. No cambies otras configuraciones del sistema.
```

## Git

```text
Windows:  winget install --id Git.Git -e --source winget
macOS:    brew install git
Ubuntu:   sudo apt update && sudo apt install -y git
```

Comprobación:

```bash
git --version
```

## Visual Studio Code

```text
Windows:  winget install --id Microsoft.VisualStudioCode -e
macOS:    brew install --cask visual-studio-code
Ubuntu:   sudo apt install -y code   # o snap install code --classic
```

Verificación:

```bash
code --version
```

## Node.js

```text
Windows:  winget install --id OpenJS.NodeJS.LTS -e
macOS:    brew install node
Ubuntu:   sudo apt install -y nodejs npm
```

Verificación:

```bash
node --version
```

## Obsidian

```text
Windows:  winget install --id Obsidian.Obsidian -e
macOS:    brew install --cask obsidian
Ubuntu:   descarga el AppImage o .deb del sitio oficial
```

> **Deuda documental visible**
> El manifiesto WinGet de Obsidian puede no estar mantenido por el proyecto. La ruta de procedencia más estricta sigue siendo el instalador oficial.

## Configurar Git

El modelo debe preguntártelo a ti, no inventarlo:

```text
nombre para commits:
email para commits:
```

```bash
git config --global user.name "NOMBRE"
git config --global user.email "EMAIL"
```

Verificación:

```bash
git config --global user.name
git config --global user.email
```

> **Puerta 4 — GREEN**

```text
✓ git --version
✓ code --version
✓ node --version
✓ Obsidian abre
✓ SETUP-LOG.md actualizado
```

---

# 6. Darle capacidades a OpenCode

Ahora OpenCode deja de ser sólo un agente con un modelo. Le vamos a instalar su repertorio.

> **Regla de host**
> Una skill no se instala «en la IA». Se instala en un host concreto.

Superpowers advierte expresamente que, si utilizas más de un harness, debe instalarse por separado en cada uno. Lore conserva una cicatriz equivalente: cada host descubre capacidades desde rutas distintas; declarar «lo copié en todos» no demuestra que todos estén cargando la misma capacidad.

## 6.1 Superpowers en OpenCode

Abrimos la configuración global (`%USERPROFILE%\.config\opencode\opencode.json` en Windows, `~/.config/opencode/opencode.json` en macOS y Ubuntu).

No la sobreescribimos si existe. Le decimos al modelo:

```text
Lee primero mi configuración global de OpenCode.
No elimines ninguna configuración existente.
Añade Superpowers siguiendo su mecanismo oficial actual para OpenCode.
Después muéstrame el diff antes de guardar.
```

El estado deseado contiene:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git"
  ]
}
```

OpenCode instala plugins declarados en configuración al iniciar. Reiniciamos.

Después preguntamos:

```text
Tell me about your superpowers.
```

GREEN:

```text
✓ Superpowers descubierto
✓ brainstorming disponible
✓ planning disponible
✓ skills disponibles
```

## 6.2 Añadir otro plugin al mismo lugar

Ya tenemos un agente bastante serio. Si más adelante quieres añadir otro complemento, se declara en la **misma** configuración global: no se crea un archivo aparte por plugin.

> **Puerta 5 — GREEN**

```text
✓ Superpowers
✓ el modelo responde
```

---

# 7. Instalar Lore Plugin en OpenCode

Ahora sí instalamos el sistema que va a conservar el criterio.

OpenCode busca globalmente skills en:

```text
~/.config/opencode/skills/
```

y también sabe descubrir formatos compatibles con `.claude/skills/` y `.agents/skills/`.

Para este primer caso no intentaremos todavía compartir físicamente una sola copia entre hosts. Primero probamos el camino público de cada uno.

Le damos al modelo:

```text
Instala Lore Plugin para OpenCode siguiendo el README público vigente de:
  andresanemic/lore-plugin

Quiero una instalación global. Usa como clon fuente:
  <RAÍZ-TOOLS>/lore-plugin

Antes de modificar nada:
  - verifica si ya existe una instalación
  - no dejes skills duplicadas
  - muéstrame las rutas fuente y destino

Después copia todas las carpetas presentes dentro de skills/,
no una lista hardcodeada de nombres.

Reiniciaremos OpenCode después.
No crees todavía ningún Lore.
```

> **[verificar al publicar]**
> La instalación por `node scripts/lore-plugin.mjs install --target opencode` es la vía del candidato 2.5. El remoto debe exponer 2.5 para que la vía pública instale esta versión.

La adaptación equivalente para una máquina nueva sería:

```bash
mkdir -p ~/Tools
git clone https://github.com/andresanemic/lore-plugin.git ~/Tools/lore-plugin

mkdir -p ~/.config/opencode/skills
cp -r ~/Tools/lore-plugin/skills/* ~/.config/opencode/skills/
```

En Windows:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\Tools" | Out-Null
git clone https://github.com/andresanemic/lore-plugin.git `
  "$env:USERPROFILE\Tools\lore-plugin"

New-Item -ItemType Directory -Force `
  "$env:USERPROFILE\.config\opencode\skills" | Out-Null
Copy-Item `
  "$env:USERPROFILE\Tools\lore-plugin\skills\*" `
  "$env:USERPROFILE\.config\opencode\skills\" `
  -Recurse -Force
```

> **Deuda documental visible**
> El README público puede enumerar un número distinto de skills del que aparece en una frase histórica de instalación. Por eso este tutorial no hardcodea el número: copia `skills/*`, es decir, lo que realmente contiene la versión instalada. **Verificado en disco el 2026-10-07 sobre el candidato 2.5.0-rc.1: ocho skills más `vespi`. `obsidian-lore` ya no forma parte del kit**; si te aparece, es residuo de otra instalación.

Después reiniciamos OpenCode y pedimos:

```text
Usa tu herramienta de skills. Lista las skills disponibles relacionadas
con Lore Plugin. No cargues ni ejecutes ninguna todavía.
```

El repertorio esperado:

- `use-lore`
- `brainstorming-lore`
- `create-area`
- `create-project`
- `save-to-lore`
- `transmute-lore`
- `create-bot`
- `stale-lore`
- `vespi` — experimental

> **Puerta 6 — GREEN**

> **Estado correcto**
> Si aparecen las skills, Lore está instalado. Todavía no existe Lore tuyo. Eso es correcto.

Comprueba también que las rutas resuelven, que no hay copias duplicadas y que la salida del instalador informa verificación correcta.

---

# 8. Instalar Claude Code desde OpenCode

Ahora el modelo puede instalar el segundo host. Primero Git ya está listo, lo que ayuda a una instalación nativa limpia en Windows. Pedimos:

```text
Instala Claude Code usando el instalador nativo oficial de Anthropic.
No configures mis credenciales. No intentes iniciar sesión por mí.

Después:
  - verifica claude --version
  - ejecuta claude doctor
  - registra el resultado en SETUP-LOG.md

Detente antes del login.
```

Instalador en Windows:

```powershell
irm https://claude.ai/install.ps1 | iex
```

Después:

```bash
claude --version
claude doctor
```

## 8.1 Login: lo hace la persona

Abrimos:

```bash
claude
```

y autenticamos la cuenta correspondiente. Nada de copiar tokens al modelo.

## 8.2 Para trabajos de arquitectura exigentes

Nuestra recomendación inicial para este recorrido:

```text
/model opus
/effort high
```

No lo fijamos como ley universal de Lore Plugin. Será la recomendación de este recorrido para brainstormings, specs y planes maestros particularmente importantes.

---

# 9. Instalar el mismo repertorio en Claude Code

Éste es un segundo host. Por tanto:

```text
OpenCode tiene sus plugins        Claude Code tiene sus plugins
```

No asumimos que uno hereda del otro.

## Superpowers

```text
/plugin install superpowers@claude-plugins-official
```

## Lore Plugin

> **[verificar al publicar]** — requiere que el remoto exponga 2.5.

```text
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

> **Puerta 7 — GREEN**

En Claude Code podemos comprobar:

```text
/doctor
/skills
/help
```

Queremos confirmar:

```text
✓ Claude Code
✓ Superpowers
✓ Lore Plugin
```

Cada host es una instalación separada. Instalar una skill en un host no prueba que otro la cargó.

---

# 10. Un contrato, dos puertas

Aquí proponemos algo para este piloto, no todavía una regla publicada de Lore Plugin.

OpenCode carga `AGENTS.md`. Claude Code carga `CLAUDE.md`, pero puede importar `AGENTS.md` desde allí. Así que podemos ensayar:

```text
AGENTS.md ───────────────►  OpenCode · Codex
   ▲
   │ @AGENTS.md
CLAUDE.md ───────────────►  Claude Code
```

El cuerpo existe una vez. `CLAUDE.md` es un adaptador. No duplica criterio.

> **Estado epistemológico**
> CONVENCIÓN DEL PILOTO ≠ CANON ACTUAL DE LORE PLUGIN. Primero se prueba trabajando.

---

# 11. El kernel: Vespi y las operaciones que sobreviven a la sesión

Lore Plugin conserva criterio. **Vespi** coordina operaciones. Son dos cosas distintas y ninguna reemplaza a la otra.

Vespi es el kernel experimental del sistema. Declara el objetivo, el responsable, el efecto y la autoridad humana acotada **antes** de actuar; verifica el efecto por separado; y deja un recibo que dice qué se observó y qué no se comprobó.

> **Cuándo usar Vespi**
> El trabajo ordinario no necesita Vespi. Una frase de tensión no la invoca: `use-lore` la enruta al coordinador. Sólo `save-to-lore` arbitra escritura de criterio; Vespi no escribe Lore. Úsalo cuando una operación acotada deba continuar entre sesiones, requiera autoridad o deba comprobarse antes de reanudar.

> **Qué trae el kernel y qué no**
> El kit fija una copia congelada de Vespi con operaciones, autoridad concedida, decisiones humanas, recibos, delegaciones acotadas y reanudación. **No** incluye la referencia criptográfica experimental, **ni** el puente de pagos x402 con el SDK real. Esas superficies están declaradas pero no conectadas, y siguen en validación de campo. La documentación incluye evidencia histórica de testnet; este recorrido no ejecuta transacciones y esa evidencia no es una auditoría. El digest protege integridad: no autentica aprobaciones ni prueba efectos externos.

## 11.1 Recorrido mínimo

Practica con una nota local y reversible. Define quién autoriza, el archivo exacto y una comprobación aparte. No uses pagos, red ni efectos irreversibles para aprender.

```text
Quiero crear <ruta-del-proyecto>/vespi-demo.md y continuar después
de esta sesión.

Revisa el contrato y FASES.md. Si corresponde, usa vespi para declarar
objetivo, responsable, efecto, autoridad y verificación.

Espera mi aprobación antes de escribir. Comprueba el archivo por separado,
deja estado y recibo donde indica el kit, y di qué quedó verificado.
No contactes servicios externos.
```

> **Puerta Vespi — GREEN**

El bloque de operaciones aparece en `FASES.md`; el permiso corresponde al efecto declarado; la comprobación observó el archivo; y el recibo separa cobertura de límites. Cierra la sesión, vuelve al proyecto y pide continuar. Antes de seguir, el coordinador vuelve a leer contrato, `FASES.md`, recibo y autoridad. Si una premisa material cambió o la evidencia no alcanza, se detiene y pide la decisión que falta.

Un recibo no concede permiso por sí solo.

## 11.2 El campo `ejercido` y las capacidades sin ejercicio

El recibo del kernel incluye un campo `ejercido` con tres valores:

| Valor | Significado |
|---|---|
| `ejercido` | El recibo existe y la capacidad se ejerció dentro del umbral |
| `no-ejercido` | El recibo existe pero un humano decidió que la capacidad no se ejercía |
| `stale` | No hay recibo dentro del umbral, o no hay recibo jamás |

La skill `stale-lore` retira con rastro declarativo aquellas capacidades que cruzan el umbral de inactividad — siete días por defecto — y escribe la entrada en `CHANGELOG.md`. El retiro no borra la skill del kit: declara que la capacidad sin ejercicio carece de mantenimiento y deja la decisión al usuario.

## 11.3 Verificación de cobertura

Desde 2.5, verificar una operación ya no basta con que el runner termine sin errores. El kit verifica que el runner **cubra la obligación encargada**. Si un runner Node no accede a las fuentes declaradas en el encargo, la verificación rechaza el resultado aunque el código de salida sea 0. Esta comprobación es mecánica: analiza el cuerpo del runner, no ejecuta las fuentes.

---

# 12. Ahora sí: comenzar Lore

Ya tenemos la máquina. No inventamos cinco Áreas de antemano. No copiamos tu sistema.

Abrimos OpenCode (u OpenChamber) en:

```text
<RAÍZ>
```

y escribimos:

```text
Quiero comenzar a usar Lore Plugin, ayúdame.
```

El kit debe mirar primero el árbol, preguntar de una cosa por vez y terminar creando el primer artefacto en vez de entregar un menú de recomendaciones.

Ahora sí puede aparecer algo como:

```text
<RAÍZ>/
├── <area>/
│   ├── lore/
│   ├── AGENTS.md
│   ├── CLAUDE.md
│   ├── FASES.md
│   └── proyectos/
└── ...
```

> **La arquitectura está disponible.**
> La taxonomía todavía tiene que ganarse.

---

# 13. Primer proyecto

Cuando exista un Área real:

```text
<RAÍZ>/<area>
```

el proyecto nuevo nace dentro de:

```text
<RAÍZ>/<area>/proyectos/
```

`create-project` está pensado para que el proyecto conserve criterio propio y herede el criterio del Área **por referencia** en lugar de copiarlo.

```text
<area>/
├── lore/                        ← criterio transversal
└── proyectos/
    └── proyecto-a/
        ├── lore/                ← criterio específico
        ├── FASES.md             ← estado
        └── producto...
```

> **Separación**
> Lore persiste. `FASES.md` avanza.

> **Puerta 8 — GREEN**
> El primer Área tiene su contrato, `lore/` y `FASES.md`; el Proyecto vive dentro de `proyectos/` y sus referencias al Área resuelven. Revisa el diff antes de aceptar cualquier criterio.

---

# 14. Primer Bot

Aquí separamos dos conversaciones que será fácil mezclar.

> **Dos responsabilidades**
> Lore Plugin diseña qué es el Bot. Superpowers diseña el trabajo complejo que ese Bot realizará.

`brainstorming-lore` existe para conversar sobre Lore, Bots, Áreas, proyectos y fases sin chocar con skills generales de brainstorming. Por eso recomendamos esta secuencia:

```text
create-bot / brainstorming-lore
  ↓ qué es este Bot
    qué gobierna · qué queda fuera · qué Áreas/Proyectos federa
  ↓
BOT EXISTE
  ↓
Superpowers brainstorming
  ↓
design / spec
  ↓
plan maestro
  ↓
implementación
```

Para un Bot especialmente importante puede tener mucho sentido cambiar temporalmente a:

```text
Claude Code Opus High
```

para la conversación de producto y el plan maestro. Después vuelves al modelo del día a día para ejecutar tramos más mecánicos.

**El criterio no pertenece al modelo que lo ejecuta.**

> **Puerta 9 — GREEN**
> El Bot tiene un propósito, un límite y una tabla de enrutamiento revisables. Cada ruta resuelve al árbol correcto y los criterios federados siguen viviendo en su origen.

---

# 15. Bot de Área y Bot transversal

Cuando llegue el momento podremos tener:

```text
<RAÍZ>/
├── <area>/
│   ├── proyectos/
│   │   ├── portfolio/
│   │   └── ecommerce/
│   └── ...
├── bots/
│   ├── bot-<area>/
│   │   └── portfolio · ecommerce
└── ...
```

No copia los Lore federados. Los apunta.

> **Federación**
> Federar es apuntar, no copiar.

---

# 16. Continuidad ante la compactación

Tras compactar o reanudar, `use-lore` exige releer el contrato, el Lore conectado y `FASES.md`, comprobar enlaces y reconstruir el trabajo desde archivos.

Claude Code y Codex tienen hooks que dejan una marca antes de compactar y avisan al reanudar. OpenCode no ofrece al plugin el mismo evento de compactación: ahí hay que guardar el estado antes de llegar al límite y aplicar la regla al reabrir la sesión o recibir el siguiente pedido.

**Ningún host recupera datos nunca escritos.**

Vespi revalida autoridad, premisas y recibo antes de seguir. Reanudar no autoriza efectos.

---

# 17. La prueba final

El setup no está terminado cuando hay siete iconos nuevos en tu sistema.

Está terminado cuando podemos cerrar todo y hacer esta prueba desde cero:

1. Abrir OpenChamber.
2. Entrar a un Proyecto.
3. Elegir el modelo gratuito.
4. Preguntar qué Lore gobierna.
5. Cambiar a otro modelo disponible en el mismo selector.
6. Continuar sobre los mismos archivos.
7. Cerrar OpenChamber.
8. Abrir Claude Code en esa misma carpeta.
9. Confirmar que recibe el mismo contrato.
10. Continuar el trabajo sin reconstruir verbalmente el proyecto.
11. Resolver una fricción real.
12. Escribir: «guarda en lore».
13. Cerrar la sesión y volver con una operación que deba continuar mañana.

Si ocurre eso:

```text
MODELO A ──►  TRABAJO  ──►  CRITERIO  ──►  MODELO B  ──►  MISMO TRABAJO
```

> **Primera victoria**
> No habremos instalado solamente varias IAs. Habremos construido un medio donde pueden cambiar sin que el criterio cambie de dueño.

> **Puerta final — GREEN**
> Un segundo modelo y otro host pueden continuar el trabajo desde los mismos artefactos sin que tengas que reconstruir el proyecto verbalmente. El criterio sigue en archivos del proyecto, los cambios quedan verificables y ninguna skill escribió Lore sin tu aprobación.

---

# Cómo recorrerlo con calma

No ejecutes todo el documento de una.

**Nuestra primera jornada termina en la Puerta 6:**

```text
OpenCode + OpenChamber + modelo gratuito + Git + VS Code + Node.js
+ Obsidian + Superpowers + Lore Plugin
```

Sin Claude todavía. Sin Codex. Sin primer Área.

Cerramos, volvemos a abrir y comprobamos que alguien que partió de cero ya tiene un agente, un editor, control de versiones y las skills de Lore funcionando.

Después hacemos la segunda jornada:

```text
Claude Code + skills en Claude + contrato compartido
+ <RAÍZ> + primer Área + primer Proyecto + primer Bot + una operación Vespi
```

Esto nos permite saber dónde estuvo la primera fricción real del onboarding, en vez de perdernos en una instalación de veinte cosas.

> **Vara del taller**
> Empiezas con un solo modelo gratuito. Terminas con un entorno donde puedes cambiar de inteligencia sin cambiar de proyecto.

Ahí hay un tutorial de Lore Plugin, pero también una puerta de entrada práctica al trabajo agentic multiproveedor.

---

# Qué no hace Lore Plugin ni Vespi

- No garantiza respuestas correctas.
- No añade criterio sin tu aprobación.
- No sustituye tu juicio.
- `FASES.md` registra estado y plan; no es criterio.
- Instalar una skill en un host no prueba que otro la cargó.
- Vespi no es agente permanente, scheduler ni motor universal de persistencia.
- Un recibo no concede autoridad ni prueba por sí solo un efecto externo.
- Los permisos del host siguen decidiendo qué puede ejecutar el modelo.

---

# Fuentes técnicas verificadas

**Estado consultado para esta versión: 7 de octubre de 2026.** Las interfaces, los modelos gratuitos y los mecanismos de instalación pueden cambiar; verificar antes de publicar una versión oficial.

- OpenCode — descarga — https://opencode.ai/download
- OpenCode — docs — https://opencode.ai/docs/
- OpenCode — proveedores — https://opencode.ai/docs/providers
- OpenCode — skills — https://opencode.ai/docs/skills
- OpenCode — Windows / WSL — https://opencode.ai/docs/windows-wsl
- OpenCode Zen — modelos y condiciones — https://opencode.ai/docs/zen
- OpenChamber — https://docs.openchamber.dev/
- Git for Windows — https://git-scm.com/install/windows
- Microsoft WinGet — https://learn.microsoft.com/windows/package-manager/winget/install
- GitHub CLI / Node.js — https://nodejs.org
- Obsidian — sitio oficial — https://obsidian.md/download
- Superpowers — repositorio e instalación — https://github.com/obra/superpowers
- Lore Plugin — repositorio — https://github.com/andresanemic/lore-plugin
  · skills verificadas en disco el 2026-10-07 sobre `2.5.0-rc.1`
- Vespi — kernel — `skills/vespi/SKILL.md`, `skills/vespi/capabilities.md`, `docs/RELEASE_2.5.0-rc.1.md` de este kit, y el `README.md`, `docs/CAPABILITIES.md`, `docs/RELEASE_0.1.5_KERNEL.md` y `docs/WALKTHROUGH.md` del repositorio del kernel
- Claude Code — setup — https://code.claude.com/docs/en/setup
- Claude Code — plugins — https://code.claude.com/docs/en/plugins
- Claude Code — memory / `CLAUDE.md` — https://code.claude.com/docs/en/memory

---

> **Nota de procedencia**
> Actualiza el tutorial maestro 0.1 del 14 de septiembre de 2026. No es un documento nuevo: es el mismo recorrido, con el mismo sistema de puertas, prompts y recuadros, llevado al estado de hoy. Cambios: el sistema se llama **SO Lore** y se nombra su segunda pieza, el kernel Vespi, con recorrido mínimo y puerta propia; **OpenChamber** entra como casa visual del recorrido y VS Code queda como editor complementario o portador de la extensión; el recorrido pasa de Windows-only a Windows, macOS y Ubuntu LTS **escrito una sola vez**, con §0.1 como tabla de deltas; el capítulo de modelos deja de fijar Muse Spark y pasa a la regla de «anota el nombre exacto que muestre hoy el selector»; el repertorio de skills se verificó contra el kit en disco (ocho más `vespi`; `obsidian-lore` ya no está); Superpowers pasa de «obligatorio» a «recomendado»; se retiran Ponytail y el módulo de Ollama + Qwen, que en la 0.1 sostenían la mitad de la prueba final pero no aplican a este recorrido — la segunda mitad de esa prueba la sostiene Claude Code como segundo host; se conservan todas las puertas, los prompts «Le damos al modelo», la tabla de inventario, el mapa con Áreas/Bots/federación, el contrato de dos puertas, la prueba final y la sección «Qué no hace». Se eliminan las notas internas «nota para el tutorial definitivo», que ahora son deudas documentales declaradas.

---

Andrés Peña Mellado — @andresanemic — a.leonardopm@gmail.com
SO LORE · Tutorial Maestro de Setup · campo 0.2 · 2026-10-07