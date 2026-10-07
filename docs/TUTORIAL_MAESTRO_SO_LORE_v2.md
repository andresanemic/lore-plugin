LORE PLUGIN · TUTORIAL MAESTRO DE SETUP

# SO LORE
# Tutorial maestro de configuración inicial

## De una máquina nueva al primer proyecto con criterio portable

**Windows x64 · macOS · Ubuntu LTS**

Andrés Peña Mellado · Telegram: @andresanemic · X: @andresanemic · a.leonardopm@gmail.com

---

> **La idea**
> No necesitas elegir un modelo para siempre. Necesitas un lugar donde distintos modelos puedan entrar al mismo trabajo sin llevarse el proyecto, su estado o su criterio cuando termina la sesión.

Ese lugar se llama **SO Lore**, y tiene dos piezas: el terreno (**Lore Plugin**) y el kernel (**Vespi**).

Empezarás con un modelo gratuito para montar la máquina. Después instalarás el sistema que conserva el criterio, y con él crearás tu primer Área, tu primer Proyecto y tu primer Bot. Al final tendrás dos motores de IA trabajando sobre los mismos archivos.

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

Lore Plugin conserva criterio ganado que puede seguir operando entre agentes y modelos. No es memoria encerrada en una conversación: es criterio en archivos que tú puedes leer y corregir.

---

# 0. Qué vas a instalar

| Pieza | Cuándo | Función |
|---|---|---|
| OpenCode Desktop | obligatorio | el host y motor bajo la interfaz |
| OpenChamber | obligatorio | la casa visual del recorrido; corre sobre OpenCode |
| Un modelo gratuito o Contributor | obligatorio al comenzar | modelo para montar la máquina |
| Git | obligatorio | historia verificable del trabajo |
| Node.js | obligatorio | corre el instalador del kit y su CLI local |
| Lore Plugin | obligatorio | criterio portable, Áreas, Proyectos y Bots |
| VS Code | recomendado | editor de texto, o portador de la extensión de OpenChamber |
| Superpowers | recomendado | diseño, specs, planes, ejecución disciplinada |
| Obsidian | recomendado | notas; el kit puede leerlas más adelante |
| Claude Code | al final, opcional | segundo host para probar el cambio de modelo |
| Vespi (kernel) | viene incluido | operaciones que sobreviven a la sesión |

> **Regla de recorrido**
> No instalaremos todo en una sola ráfaga. Cada tramo termina en una prueba. Si la prueba no queda verde, no seguimos.

Una instalación que no puedes repetir y comprobar todavía no cuenta como instalación portable.

## 0.1 Los tres sistemas

El recorrido se escribe **una sola vez**. Lo único que cambia entre sistemas es dónde vive la raíz, qué gestor de paquetes usas y qué paquete bajas de OpenCode y OpenChamber.

| | Windows x64 | macOS | Ubuntu LTS |
|---|---|---|---|
| Raíz de trabajo | `C:\IA` | `~/IA` | `~/IA` |
| Registro de instalación | `C:\IA\setup\SETUP-LOG.md` | `~/IA/setup/SETUP-LOG.md` | `~/IA/setup/SETUP-LOG.md` |
| Herramientas base | `winget install …` | `brew install …` | `sudo apt install …` |
| Clon del kit | `%USERPROFILE%\Tools\lore-plugin` | `~/Tools/lore-plugin` | `~/Tools/lore-plugin` |
| Config global de OpenCode | `%USERPROFILE%\.config\opencode\` | `~/.config/opencode/` | `~/.config/opencode/` |

Todo lo demás — los prompts, las pruebas y el criterio — es idéntico en las tres.

---

# 1. Bootstrap: instalar OpenCode a mano

Hay una única paradoja en la idea de «instalar todo desde OpenCode»:

> **Bootstrap**
> OpenCode no puede instalar OpenCode.

Éste es el único paso que hacemos fuera del agente.

**Windows x64.** OpenCode distribuye una aplicación Desktop nativa, separada de su TUI/CLI. Descárgala de la página oficial y descomprímela donde la quieras usar:

```text
https://opencode.ai/download
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

> **Prueba 1 — GREEN**
>
> ```text
> ✓ OpenCode abre
> ✓ puede crear/abrir una sesión
> ✓ muestra selector de modelos/proveedores
> ```

Todavía no necesitamos que programe nada. Si eso ocurre, seguimos.

---

# 2. Instalar OpenChamber: la casa visual del recorrido

OpenCode solo vive en la terminal. OpenChamber es la pantalla alrededor: sesiones ramificadas, revisión de diffs, terminales, progreso de herramientas y el tablero completo mientras el agente trabaja. Corre **sobre** OpenCode, así que ya tienes lo que necesita.

Es la interfaz que recomendamos, y la que usamos en SO Lore. Si prefieres la terminal, puedes seguir el recorrido entero sin esto.

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

> **Prueba 2 — GREEN**
>
> ```text
> ✓ OpenChamber abre
> ✓ muestra tus sesiones de OpenCode
> ✓ puedes abrir una conversación
> ```

Si no instalaste OpenChamber, anota «omitido, opcional» y sigue por la terminal.

---

# 3. Conectar tu primera inteligencia

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

No lo uses para secretos, credenciales ni material confidencial.

## 3.1 Conectar

Abre la configuración del proveedor en OpenChamber; en la terminal, `/connect`. Autentícate, y después usa `/models` para ver el catálogo.

Elige un modelo gratuito o Contributor **y anota el nombre exacto que muestre tu selector junto con la fecha**. El catálogo rota, así que el nombre de hoy es el dato que vale; los de meses pasados no.

**Prueba:**

```text
Responde únicamente: SETUP READY; modelo: <nombre exacto del selector>
```

> **Prueba 3 — GREEN**
>
> ```text
> ✓ respuesta recibida
> ✓ identifica el modelo que estás usando
> ✓ el nombre quedó anotado en SETUP-LOG.md con la fecha
> ```

Desde este momento el modelo puede ayudarte a construir el resto de la máquina.

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

`<RAÍZ>` es `C:\IA` en Windows, `~/IA` en macOS y Ubuntu (§0.1). El resultado:

```text
<RAÍZ>/
└── setup/
    └── SETUP-LOG.md
```

> **Frontera**
> El registro cuenta qué hicimos. No gobierna qué debemos hacer después. Por eso no pertenece a `lore/`.

---

# 5. Instalar las herramientas base

Ahora podemos decirle:

```text
Vamos a preparar las herramientas base.
Instala y verifica UNA POR UNA:
  1. Git
  2. Visual Studio Code
  3. Node.js
  4. Obsidian

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
Ubuntu:   descarga el AppImage o el .deb del sitio oficial
```

Si el paquete de Obsidian no está disponible en tu gestor, ve al instalador oficial: es la ruta de procedencia más estricta.

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

> **Prueba 4 — GREEN**
>
> ```text
> ✓ git --version
> ✓ code --version
> ✓ node --version
> ✓ Obsidian abre
> ✓ SETUP-LOG.md actualizado
> ```

---

# 6. Darle capacidades a OpenCode

Ahora OpenCode deja de ser sólo un agente con un modelo. Le vamos a instalar su repertorio.

> **Regla de host**
> Una skill no se instala «en la IA». Se instala en un host concreto.

Cada host descubre capacidades desde rutas distintas. Declarar «lo copié en todos» no demuestra que todos estén cargando la misma capacidad.

## 6.1 Superpowers

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

OpenCode instala plugins declarados en configuración al iniciar. Reiniciamos y preguntamos:

```text
Tell me about your superpowers.
```

> **Prueba 5 — GREEN**
>
> ```text
> ✓ Superpowers descubierto
> ✓ brainstorming disponible
> ✓ planning disponible
> ✓ skills disponibles
> ```

Si más adelante quieres añadir otro complemento, se declara en esta **misma** configuración: no se crea un archivo aparte por plugin.

---

# 7. Instalar Lore Plugin

Ahora sí instalamos el sistema que va a conservar el criterio.

OpenCode busca globalmente skills en:

```text
~/.config/opencode/skills/
```

y también sabe descubrir formatos compatibles con `.claude/skills/` y `.agents/skills/`.

Para empezar no intentaremos compartir una sola copia entre hosts. Primero probamos el camino de cada uno.

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
no una lista fija de nombres.

Reiniciaremos OpenCode después.
No crees todavía ningún Lore.
```

Equivalente a mano:

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
- `vespi`

Comprueba además que las rutas resuelven, que no hay copias duplicadas y que la salida del instalador informa verificación correcta.

> **Prueba 6 — GREEN**
>
> ```text
> ✓ las skills aparecen listadas
> ✓ las rutas resuelven
> ✓ no hay copias duplicadas
> ```
>
> **Estado correcto**
> Si aparecen las skills, Lore está instalado. Todavía no existe Lore tuyo. Eso es correcto.

---

# 8. Instalar Claude Code: el segundo host

Con la máquina lista, el modelo puede instalar un segundo host. Git ya está, lo que ayuda a una instalación limpia en Windows.

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

## 8.1 El login lo haces tú

Abrimos:

```bash
claude
```

y autenticamos la cuenta correspondiente. Nada de copiar tokens al modelo.

## 8.2 Para trabajos de arquitectura exigentes

Cuando el trabajo sea un brainstorming importante, un spec o un plan maestro, recomendamos subir el esfuerzo:

```text
/model opus
/effort high
```

No es una regla del sistema: es una recomendación para cuando el costo de equivocarse es alto.

---

# 9. El mismo repertorio en Claude Code

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

```text
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

> **Prueba 7 — GREEN**
>
> En Claude Code podemos comprobar con `/doctor`, `/skills` y `/help`. Queremos ver:
>
> ```text
> ✓ Claude Code
> ✓ Superpowers
> ✓ Lore Plugin
> ```

Cada host es una instalación separada. Instalar una skill en un host no prueba que otro la cargó.

---

# 10. Un contrato, dos puertas

OpenCode carga `AGENTS.md`. Claude Code carga `CLAUDE.md`, pero puede importar `AGENTS.md` desde allí. Así que podemos ensayar:

```text
AGENTS.md ───────────────►  OpenCode · Codex
   ▲
   │ @AGENTS.md
CLAUDE.md ───────────────►  Claude Code
```

El cuerpo del criterio existe una vez. `CLAUDE.md` es un adaptador: no duplica criterio.

> **Decisión tuya**
> Este es un contrato de trabajo, no una regla del kit. Puedes adoptarlo tal cual o escribir el tuyo. Lo que sí conviene es que **exista un solo cuerpo** y que los demás archivos lo apunten.

---

# 11. El kernel: Vespi

Lore Plugin conserva criterio. **Vespi** coordina operaciones. Son dos cosas distintas y ninguna reemplaza a la otra.

Vespi es el kernel del sistema. Antes de actuar declara el objetivo, el responsable, el efecto y la autoridad humana acotada. Después verifica el efecto por separado y deja un recibo que dice qué se observó y qué quedó fuera.

> **Cuándo usar Vespi**
> El trabajo ordinario no necesita Vespi. Úsalo cuando una operación acotada deba continuar entre sesiones, requiera autoridad o deba comprobarse antes de reanudar. Sólo `save-to-lore` arbitra escritura de criterio: Vespi no escribe Lore.

> **Alcance**
> Vespi opera sobre archivos locales y trabajo declarable: objetivo, responsable, efecto, autoridad y recibo. Es la capa que coordina la operación; no sustituye al modelo ni al host, y no toca la red por su cuenta. El digest protege integridad; no autentica aprobaciones ni prueba efectos externos.

## 11.1 Recorrido mínimo

Practica con una nota local y reversible. No uses pagos, red ni efectos irreversibles para aprender.

```text
Quiero crear <ruta-del-proyecto>/vespi-demo.md y continuar después
de esta sesión.

Revisa el contrato y FASES.md. Si corresponde, usa vespi para declarar
objetivo, responsable, efecto, autoridad y verificación.

Espera mi aprobación antes de escribir. Comprueba el archivo por separado,
deja estado y recibo donde indica el kit, y di qué quedó verificado.
No contactes servicios externos.
```

> **Prueba Vespi — GREEN**
>
> El bloque de operaciones aparece en `FASES.md`; el permiso corresponde al efecto declarado; la comprobación observó el archivo; y el recibo separa lo cubierto de lo no cubierto. Cierra la sesión, vuelve al proyecto y pide continuar. Antes de seguir, el coordinador relee contrato, `FASES.md`, recibo y autoridad. Si una premisa material cambió o la evidencia no alcanza, se detiene y pide la decisión que falta.

Un recibo no concede permiso por sí solo.

## 11.2 El campo `ejercido`

El recibo del kernel incluye un campo `ejercido`:

| Valor | Significado |
|---|---|
| `ejercido` | El recibo existe y la capacidad se ejerció dentro del umbral |
| `no-ejercido` | El recibo existe pero un humano decidió que la capacidad no se ejercía |
| `stale` | No hay recibo dentro del umbral, o no hay recibo jamás |

La skill `stale-lore` retira con rastro declarativo las capacidades que cruzan el umbral de inactividad — siete días por defecto — y escribe la entrada en `CHANGELOG.md`. El retiro no borra la skill: declara que la capacidad sin ejercicio carece de mantenimiento y deja la decisión al usuario.

---

# 12. Crear tu primer Área

Ya tenemos la máquina. Ahora empieza el trabajo de verdad.

Un **Área** es un territorio de trabajo: una familia de proyectos que comparten criterio. No inventamos cinco áreas de antemano; creamos la que corresponde a lo que quieres hacer.

Abrimos OpenCode (u OpenChamber) en:

```text
<RAÍZ>
```

y escribimos:

```text
Quiero comenzar a usar Lore Plugin, ayúdame.

Revisa el árbol y dime qué hay. Quiero crear mi primer Área
para el trabajo que te voy a describir.

Pregúntame una cosa por vez. Antes de escribir cualquier criterio,
preséntamelo y espera mi aprobación.
```

El kit inspecciona el árbol, pregunta de una cosa por vez y trabaja hacia un artefacto. No te devolverá un menú de recomendaciones: te irá construyendo el Área.

Cuando exista el Área, el árbol queda así:

```text
<RAÍZ>/
└── <area>/
    ├── lore/            ← criterio del Área
    ├── AGENTS.md        ← el contrato
    ├── CLAUDE.md        ← adaptador
    ├── FASES.md         ← estado y plan
    └── proyectos/
```

> **Prueba 8 — GREEN**
>
> ```text
> ✓ el Área tiene su contrato
> ✓ existe lore/ con criterio
> ✓ existe FASES.md
> ✓ el diff es revisable antes de aceptarlo
> ```

> **La arquitectura está disponible. La taxonomía todavía tiene que ganarse.**
> El kit puede darte la estructura. Lo que un Área significa es tuyo: eso lo decides tú, no la herramienta.

---

# 13. Crear tu primer Proyecto

Con un Área real, el proyecto nuevo nace dentro de:

```text
<RAÍZ>/<area>/proyectos/
```

Le decimos al modelo:

```text
Quiero crear mi primer Proyecto dentro de este Área.

Usa create-project. El proyecto debe conservar su propio lore/ y
heredar el criterio del Área por referencia, no copiándolo.

Dime primero el nombre que propones y por qué. Espera mi aprobación
antes de escribir nada.
```

El resultado:

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

> **Prueba 9 — GREEN**
>
> ```text
> ✓ el Proyecto vive dentro de proyectos/
> ✓ su lore/ resuelve al del Área sin duplicarlo
> ✓ FASES.md refleja el estado real
> ```

---

# 14. Crear tu primer Bot

Un **Bot** es un punto de entrada: una sesión que atiende varios Proyectos con criterio enrutado.

Aquí separamos dos conversaciones que es fácil mezclar:

> **Dos responsabilidades**
> Lore Plugin diseña qué es el Bot. Superpowers diseña el trabajo complejo que ese Bot realizará.

`brainstorming-lore` existe para conversar sobre Lore, Bots, Áreas, proyectos y fases sin chocar con las skills generales de brainstorming. Por eso la secuencia es:

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

En la práctica:

```text
Diseñemos mi primer Bot.

Revisa mis Áreas y Proyectos. Usa create-bot para decidir qué atenderá,
qué queda fuera y a qué fuentes apuntará. Pregunta una cosa por vez.

No copies Lore: fedéralo. Presenta el diseño y espera mi aprobación
antes de escribir.
```

> **Federación**
> Federar es apuntar, no copiar. El criterio federado sigue viviendo en su origen.

> **Prueba 10 — GREEN**
>
> ```text
> ✓ el Bot tiene propósito, límite y tabla de enrutamiento
> ✓ cada ruta resuelve al árbol correcto
> ✓ los criterios federados siguen en su origen
> ```

Para un Bot especialmente importante, cambia temporalmente a `Claude Code Opus High` para la conversación de producto y el plan maestro, y vuelve al modelo del día a día para los tramos mecánicos.

**El criterio no pertenece al modelo que lo ejecuta.**

---

# 15. Bot de Área y Bot transversal

Con varios proyectos encima, la estructura se vuelve así:

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

Un Bot de Área atiende lo que pasa dentro de un Área. Un Bot transversal atiende un mismo trabajo que atraviesa varias. Ninguno de los dos copia el Lore al que apunta.

---

# 16. Continuidad ante la compactación

Cuando una sesión se llena y se compacta, `use-lore` exige releer el contrato, el Lore conectado y `FASES.md`, comprobar enlaces y reconstruir el trabajo desde los archivos.

Claude Code y Codex dejan una marca antes de compactar y avisan al reanudar. En OpenCode hay que guardar el estado antes de llegar al límite.

**Ningún host recupera datos nunca escritos.**

Vespi revalida autoridad, premisas y recibo antes de seguir. Reanudar no autoriza efectos.

---

# 17. La prueba final

El setup no está terminado cuando hay iconos nuevos en tu sistema.

Está terminado cuando cierras todo y puedes hacer esto desde cero:

1. Abrir OpenChamber.
2. Entrar a tu Proyecto.
3. Elegir el modelo gratuito.
4. Preguntar qué Lore gobierna ese proyecto.
5. Cambiar a otro modelo del mismo selector.
6. Continuar sobre los mismos archivos.
7. Cerrar OpenChamber.
8. Abrir Claude Code en esa misma carpeta.
9. Confirmar que recibe el mismo contrato.
10. Continuar el trabajo sin reconstruir verbalmente el proyecto.
11. Resolver una fricción real.
12. Escribir: «guarda en lore».
13. Cerrar la sesión y volver mañana con una operación que deba continuar.

Si eso ocurre:

```text
MODELO A ──►  TRABAJO  ──►  CRITERIO  ──►  MODELO B  ──►  MISMO TRABAJO
```

> **Prueba final — GREEN**
>
> Un segundo modelo y otro host pueden continuar el trabajo desde los mismos artefactos sin que tengas que reconstruir el proyecto verbalmente. El criterio sigue en archivos del proyecto, los cambios quedan verificables y ninguna skill escribió Lore sin tu aprobación.

> **Primera victoria**
> No habrás instalado solamente varias IAs. Habrás construido un medio donde pueden cambiar sin que el criterio cambie de dueño.

---

# Qué no hace SO Lore

- No garantiza respuestas correctas.
- No añade criterio sin tu aprobación.
- No sustituye tu juicio.
- `FASES.md` registra estado y plan; no es criterio.
- Instalar una skill en un host no prueba que otro la cargó.
- Vespi no es agente permanente, scheduler ni motor universal de persistencia.
- Un recibo no concede autoridad ni prueba por sí solo un efecto externo.
- Los permisos del host siguen decidiendo qué puede ejecutar el modelo.

---

# Fuentes técnicas

Las interfaces, los modelos gratuitos y los mecanismos de instalación pueden cambiar. Verifica antes de seguir un paso que te falle.

- OpenCode — descarga — https://opencode.ai/download
- OpenCode — docs — https://opencode.ai/docs/
- OpenCode — proveedores — https://opencode.ai/docs/providers
- OpenCode — skills — https://opencode.ai/docs/skills
- OpenCode — Windows / WSL — https://opencode.ai/docs/windows-wsl
- OpenCode Zen — modelos y condiciones — https://opencode.ai/docs/zen
- OpenChamber — https://docs.openchamber.dev/
- Git for Windows — https://git-scm.com/install/windows
- Microsoft WinGet — https://learn.microsoft.com/windows/package-manager/winget/install
- Node.js — https://nodejs.org
- Obsidian — https://obsidian.md/download
- Superpowers — https://github.com/obra/superpowers
- Lore Plugin — https://github.com/andresanemic/lore-plugin
- Claude Code — setup — https://code.claude.com/docs/en/setup
- Claude Code — plugins — https://code.claude.com/docs/en/plugins
- Claude Code — memory / `CLAUDE.md` — https://code.claude.com/docs/en/memory

---

Andrés Peña Mellado — @andresanemic — a.leonardopm@gmail.com