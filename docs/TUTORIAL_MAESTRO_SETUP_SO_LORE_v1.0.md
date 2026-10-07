# SO LORE — TUTORIAL MAESTRO DE CONFIGURACIÓN

## Lore Plugin + Kernel Vespi

**Windows · macOS · Ubuntu LTS**

Andrés Peña Mellado
Telegram: @andresanemic · X: @andresanemic · a.leonardopm@gmail.com

Versión 1.0 · Octubre 2026

---

## Contenido

**Núcleo común**
1. Qué es el sistema conjunto SO Lore
2. Mapa del sistema
3. Requisitos y preparación segura
4. OpenChamber + OpenCode: instalar y conectar
5. Instalar Lore Plugin
6. Añadir el kernel Vespi
7. Primera operación verificable
8. Solución de problemas

**Recorridos por plataforma**
- Windows x64
- macOS
- Linux — Ubuntu LTS

**Apéndices**
- Otros hosts opcionales
- Tabla de compatibilidad
- Contacto y fuentes

---

## 1. Qué es el sistema conjunto SO Lore

SO Lore es el sistema operativo para trabajar con IA creado por Andrés Peña Mellado. No es un sistema operativo de computadora: es un sistema de trabajo que prepara el terreno para que distintas inteligencias artificiales puedan colaborar con criterio, continuidad y verificación.

El sistema tiene dos piezas principales:

- **Lore Plugin** — el kit que conserva criterio ganado, enruta hacia el criterio pertinente y guía cómo se ejecuta una tarea. Vive en archivos de texto plano que puedes leer y corregir.
- **Vespi** — el kernel experimental que coordina operaciones acotadas bajo autoridad, verifica efectos por separado y deja recibos que permiten continuar entre sesiones.

La analogía GNU/Linux es útil: Lore Plugin aporta el terreno (criterio, enrutamiento, método) y Vespi aporta el kernel (operación, autoridad, verificación, continuidad). Son dos piezas distintas que hacen posible el sistema conjunto.

> **LUS no es parte del runtime.** LUS (Lore User System) es el programa de investigación que estudia las condiciones bajo las cuales la continuidad funciona, falla o cambia. El corpus LUS y sus hipótesis viven fuera del runtime: no se cargan en cada sesión ni sustituyen el criterio del proyecto.

---

## 2. Mapa del sistema

```
MODELO (IA)
    │
    ▼
OPENCODE (host / runtime)
    │
    ▼
OPENCHAMBER (interfaz visual recomendada)
    │
    ▼
LORE PLUGIN (criterio, enrutamiento, método)
    │
    ▼
VESPI (kernel: operación, autoridad, verificación, recibos)
    │
    ▼
TU PROYECTO (archivos, estado, criterio)
```

El modelo cambia. El trabajo no. Lore Plugin busca conservar criterio ganado que pueda seguir operando entre agentes y modelos, no memoria encerrada en una conversación.

---

## 3. Requisitos y preparación segura

### 3.1 Cuentas y credenciales

Necesitarás al menos una cuenta con un proveedor de modelos de IA. OpenCode Zen ofrece modelos gratuitos y de pago; el catálogo rota, así que verifica las condiciones vigentes antes de elegir.

- Gratuito no significa local ni privado. Revisa las condiciones del proveedor antes de compartir material confidencial o credenciales.
- Nunca copies tokens, claves API ni credenciales en archivos de proyecto, logs o capturas de pantalla.
- Si un proveedor ofrece autenticación de dos factores, actívala.

### 3.2 Herramientas base

- Git — control de versiones y descarga del kit
- Node.js — runtime para instalar Lore Plugin y ejecutar su CLI local
- Un editor de texto — VS Code es una opción común, pero cualquier editor sirve

> **Regla de recorrido**
> No instales todo en una sola ráfaga. Cada tramo termina en una prueba. Si la prueba no queda verde, no seguimos. Una instalación que no puedes repetir y comprobar todavía no cuenta como instalación portable.

---

## 4. OpenChamber + OpenCode: instalar y conectar

### Qué es OpenChamber

OpenChamber es el espacio visual alrededor de OpenCode. En lugar de vivir en la línea de comandos, tienes una pantalla para observar y dirigir el trabajo: sesiones ramificadas, revisión de diffs, gestión de terminales, progreso de herramientas y el tablero completo mientras el agente trabaja.

OpenChamber corre sobre OpenCode. La experiencia de Andrés con OpenChamber ha sido la mejor que ha tenido con un IDE para vibecoding, y por eso es la interfaz recomendada en este tutorial.

### Instalar OpenCode

OpenCode es el agente de IA de código abierto que corre en tu terminal. Está disponible como interfaz de terminal, aplicación de escritorio o aplicación web.

#### Windows

Windows no tiene gestor de paquetes soportado por OpenCode. Descarga el binario standalone para tu arquitectura:

- x64: https://opencode.ai/files/bin/2.0.6/opencode-windows-x64.zip
- ARM64: https://opencode.ai/files/bin/2.0.6/opencode-windows-arm64.zip

También puedes usar WSL (Windows Subsystem for Linux) y seguir el recorrido Linux dentro de WSL.

#### macOS

```bash
brew install anomalyco/tap/opencode-v2
```

O descarga el binario standalone:
- Apple Silicon: https://opencode.ai/files/bin/2.0.6/opencode-darwin-arm64.zip
- Intel: https://opencode.ai/files/bin/2.0.6/opencode-darwin-x64.zip

#### Linux

```bash
curl -fsSL https://opencode.ai/v2/install | bash
```

### Instalar OpenChamber

OpenChamber requiere OpenCode instalado primero. Hay tres formas de usarlo:

#### Desktop (macOS)

Descarga la última build desktop desde la página de releases de GitHub o la página de descargas de OpenChamber. Ábrela e inicia sesión con tu flujo habitual de OpenCode.

#### Web + PWA

```bash
curl -fsSL https://raw.githubusercontent.com/openchamber/openchamber/main/scripts/install.sh | bash
openchamber --ui-password 'tu-contraseña-segura'
```

Abre la URL que imprime el CLI (normalmente http://localhost:3000). Para tenerla a mano, usa la opción "Install" de tu navegador.

#### VS Code

Instala la extensión OpenChamber desde el marketplace de VS Code e inicia sesión con tu flujo habitual de OpenCode. La vista de OpenChamber se abre en la barra lateral.

> **Contraseña de UI**
> Si planeas abrir OpenChamber a internet o acceder desde tu teléfono, usa una contraseña fuerte para la UI.

---

## 5. Instalar Lore Plugin

### Qué es Lore Plugin

Lore Plugin es el kit que conserva criterio ganado entre agentes y modelos. El modelo cambia; los archivos, el estado y el criterio permanecen en el proyecto. Lore Plugin organiza ese criterio en archivos de texto plano que puedes leer y corregir.

El kit incluye skills para crear áreas, proyectos y bots; destilar criterio; transformar Lore; y usar Lore en cada sesión. La skill vespi está incluida como skill experimental.

### Instalación recomendada: clonar el repositorio

```bash
git clone https://github.com/andresanemic/lore-plugin.git
cd lore-plugin
node scripts/lore-plugin.mjs install --target opencode
```

Para instalar en todos los hosts soportados, reemplaza `opencode` por `all`. Para instalar solo en Claude Code o Codex, usa `--target claude` o `--target codex`.

### Verificar la instalación

Reinicia OpenCode (o abre una sesión nueva). Pide al host que enumere sus skills disponibles relacionadas con Lore Plugin. Deberías ver:

- use-lore
- brainstorming-lore
- create-area
- create-project
- save-to-lore
- transmute-lore
- create-bot
- stale-lore
- vespi (skill experimental)

Comprueba las rutas, que no haya copias duplicadas y que la salida del instalador informe verificación correcta.

---

## 6. Añadir el kernel Vespi

### Qué es Vespi y por qué es un kernel

Vespi es el kernel experimental de SO Lore. Coordina una operación acotada: declara el objetivo, efecto, dueño y autoridad; deja que el host aplique sus permisos; pide una decisión humana cuando corresponde; verifica el efecto por separado; registra un recibo y conserva el estado reanudable.

El recibo informa qué se observó y qué quedó sin cubrir. No demuestra por sí mismo quién autorizó ni convierte una afirmación en evidencia.

> **Cuándo usar Vespi**
> El trabajo ordinario no necesita Vespi. Una frase de tensión no la invoca: use-lore la enruta al coordinador. Solo save-to-lore arbitra escritura de criterio; Vespi no escribe Lore. Usa Vespi cuando una operación acotada deba continuar entre sesiones, requiera autoridad o deba comprobarse antes de reanudar.

### Cómo se invoca

En OpenCode, las skills se cargan con la herramienta de skills. Pide al coordinador evaluar la operación e invocar vespi si corresponde. En Claude Code y Codex, instala Lore por separado y confirma que descubrió vespi.

### Recorrido mínimo

Practica con una nota local y reversible. Define quién autoriza, el archivo exacto y una comprobación aparte. No uses pagos, red ni efectos irreversibles para aprender.

---

## 7. Primera operación verificable

El setup no está terminado cuando hay iconos nuevos. Está terminado cuando puedes cerrar todo y hacer una prueba desde cero:

1. Abrir OpenChamber.
2. Entrar a un proyecto.
3. Elegir un modelo.
4. Preguntar qué Lore gobierna.
5. Cambiar de modelo y continuar sobre los mismos archivos.
6. Resolver una fricción real.
7. Escribir "guarda en lore".

Si ocurre eso, has construido un medio donde puedes cambiar de inteligencia sin que el criterio cambie de dueño.

---

## 8. Solución de problemas

### OpenChamber no carga
- Verifica que OpenCode esté instalado y responda.
- Ejecuta `openchamber status` para ver el estado del servidor.
- Si el servidor está atascado, reinicia con `openchamber restart`.
- Revisa los logs con `openchamber logs`.

### Las skills de Lore no aparecen
- Confirma que el instalador terminó sin errores.
- Verifica que no haya skills duplicadas en rutas distintas.
- Reinicia el host y abre una sesión nueva.
- Pide al host que enumere las skills de Lore sin ejecutarlas.

### El modelo no responde
- Verifica la autenticación del proveedor.
- Revisa que el modelo seleccionado esté disponible en el catálogo vigente.
- Gratuito no significa local ni privado: revisa las condiciones del proveedor.

---

## Recorrido Windows x64

1. **Instalar OpenCode:** descarga `opencode-windows-x64.zip` de opencode.ai/bin y extrae.
2. **Instalar OpenChamber:** extensión VS Code desde el marketplace, o versión web/PWA.
3. **Conectar modelo:** `/connect` → OpenCode Zen → elige modelo gratuito/Contributor.
4. **Herramientas base:** `winget install Git.Git`, `winget install OpenJS.NodeJS.LTS`, VS Code opcional.
5. **Instalar Lore Plugin:**
   ```
   git clone https://github.com/andresanemic/lore-plugin.git %USERPROFILE%\Tools\lore-plugin
   cd %USERPROFILE%\Tools\lore-plugin
   node scripts/lore-plugin.mjs install --target opencode
   ```
6. **Verificar Vespi:** pide al coordinador una operación simple reversible.
7. **Prueba final:** la lista del §7.

---

## Recorrido macOS

1. **Instalar OpenCode:** `brew install anomalyco/tap/opencode-v2`
2. **Instalar OpenChamber:** desktop build o web/PWA.
3. **Conectar modelo:** `/connect` → OpenCode Zen.
4. **Herramientas base:** `brew install git node`, VS Code opcional.
5. **Instalar Lore Plugin:**
   ```
   git clone https://github.com/andresanemic/lore-plugin.git ~/Tools/lore-plugin
   cd ~/Tools/lore-plugin
   node scripts/lore-plugin.mjs install --target opencode
   ```
6. **Verificar Vespi:** operación simple reversible.
7. **Prueba final:** la lista del §7.

---

## Recorrido Linux — Ubuntu LTS

1. **Instalar OpenCode:** `curl -fsSL https://opencode.ai/v2/install | bash`
2. **Instalar OpenChamber:**
   ```
   curl -fsSL https://raw.githubusercontent.com/openchamber/openchamber/main/scripts/install.sh | bash
   openchamber --ui-password 'tu-contraseña-segura'
   ```
3. **Conectar modelo:** `/connect` → OpenCode Zen.
4. **Herramientas base:** `sudo apt update && sudo apt install -y git nodejs npm`
5. **Instalar Lore Plugin:**
   ```
   git clone https://github.com/andresanemic/lore-plugin.git ~/Tools/lore-plugin
   cd ~/Tools/lore-plugin
   node scripts/lore-plugin.mjs install --target opencode
   ```
6. **Verificar Vespi:** operación simple reversible.
7. **Prueba final:** la lista del §7.

---

## Apéndice A: Otros hosts opcionales

### Claude Code
```
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```
O desde terminal:
```
claude plugin marketplace add andresanemic/lore-plugin
claude plugin install lore@lore-plugin
```

### Codex CLI
```
codex plugin marketplace add andresanemic/lore-plugin
codex plugin add lore@lore-plugin
```

Cada host es una instalación separada.

---

## Apéndice B: Tabla de compatibilidad

| Componente | Windows | macOS | Ubuntu LTS |
|---|---|---|---|
| OpenCode | Binario standalone / WSL | Homebrew / binario | curl / binario |
| OpenChamber | VS Code / web | Desktop / web | Web / PWA |
| Lore Plugin | Clon + Node.js | Clon + Node.js | Clon + Node.js |
| Vespi | Skill experimental | Skill experimental | Skill experimental |

---

## Apéndice C: Contacto y fuentes

**Andrés Peña Mellado**
- Telegram: @andresanemic
- X: @andresanemic
- Correo: a.leonardopm@gmail.com

**Fuentes técnicas**
- OpenCode: https://opencode.ai/docs/
- OpenChamber: https://docs.openchamber.dev/
- Lore Plugin: https://github.com/andresanemic/lore-plugin
- Vespi: https://github.com/andresanemic/vespi

Las interfaces, los modelos gratuitos y los mecanismos de instalación pueden cambiar; vuelve a verificar antes de publicar una versión oficial.

---

SO Lore — Tutorial Maestro de Configuración
Lore Plugin + Kernel Vespi
Telegram: @andresanemic · X: @andresanemic · a.leonardopm@gmail.com
