# lore/moodboard.md — El workflow del moodboard (Fase 2.1)

> **§0 es el orden** en que se arma el moodboard de cualquier proyecto del área: cuatro etapas.
> **§1 son las reglas duras** de obtención de imágenes. El checklist ejecutable vive en
> `_starter/FASES.md` (2.1); aquí vive el criterio.
>
> **El moodboard abre la Fase 2, antes de paleta y tipografías.** No arranca en blanco: consume los
> tokens del brandkit inicial (Fase 1), no los de la paleta definitiva — ver §2. Y es la dirección
> elegida la que **afina** esa paleta: en Introspection Solutions, la visión resolvió el tratamiento
> de imagen y el lenguaje de motion que el brandkit había dejado abiertos, y bajó el sorbet a casi
> cero en la dirección dominante. Elegir la paleta definitiva antes del moodboard es pintarla dos veces.
>
> Los archivos viven en `material-marca/02-direccion-diseno/moodboard/`. El tablero final se arma
> **a mano en Miro** — este workflow entrega la materia prima y su justificación, no el tablero.
>
> Destilado del pedido del constructor y **validado de punta a punta** en el moodboard de
> Introspection Solutions (`proyectos/numerologia`, Fase 2.1): las cuatro etapas se corrieron
> completas. Lo que la validación corrigió está en §3.

---

## 0. Las cuatro etapas

### Etapa 1 — Visión del diseñador: las direcciones conceptuales

Salida: `vision-disenador/vision-disenadora.md` con **4 a 5 direcciones conceptuales distintas**,
derivadas del brief (`que-es-<cliente>.txt` + brandkit inicial + benchmark).

Cada dirección lleva cinco campos fijos:

1. **Nombre corto** — un rótulo que se pueda decir en voz alta.
2. **La idea** — qué mundo propone.
3. **Paleta sugerida** — anclada en los tokens del brandkit, no inventada aparte.
4. **Referencias de tono y textura** — material, luz, grano, atmósfera.
5. **Por qué encaja con este proyecto** — el amarre al brief. Sin esto, es decoración.

**Distintas** significa *mutuamente excluyentes*: si dos direcciones se pueden fusionar sin perder
nada, son una sola. Y **específico** significa que un lector debería poder buscar imágenes de esa
dirección sin volver a preguntar qué quisiste decir. "Elegante y místico" no es una dirección.

> **Esta es la visión de diseñador del proyecto; no hay una segunda.** Las N direcciones se abren
> aquí para mirarlas juntas, y el diseñador elige una al validar. No existe una sub-fase posterior
> que vuelva a redactar la visión: sería el mismo documento escrito dos veces.

**Antes de cerrar la Etapa 1: buscar el elemento central del proyecto en la visión.** Aquello que el
sitio no puede evitar mostrar —el número en numerología, el producto en una tienda, la foto en un
estudio— **tiene que estar decidido y tiene que tener carpeta en el tablero.** El elemento central es
justo lo que el sesgo del constructor se salta, porque es el más cargado de cliché y evitarlo por
omisión se siente como buen gusto. No lo es: **lo que no se decide lo decide el default, y el default
es el cliché.** Ley completa en `investigacion.md` §0.3.

### Etapa 2 — Búsqueda y descarga de imágenes

Por cada dirección conceptual:

1. **WebSearch** → 4-6 páginas de imagen concretas en **Unsplash, Pexels, Pixabay, Kaboompics o
   StockSnap.io**.
2. **WebFetch** sobre cada página → confirmar la **URL de descarga directa del archivo original**
   (no el thumbnail). No adivinar URLs (ver §1.3).
3. **Descarga con `curl`/`wget`** — sin recomprimir, sin cambiar de formato, resolución original.
4. Archivo en `moodboard/<nombre-concepto>/`, con **nombre descriptivo** (`luz-rasante-marmol.jpg`),
   nunca el ID de la fuente.

Si un link falla o no expone descarga directa: **saltarlo y buscar otro**. Un moodboard con
placeholders rotos es peor que un moodboard con cuatro imágenes.

### Etapa 3 — Explicación del moodboard

Salida: `moodboard/explicacion-moodboard.md`. Por cada concepto:

- **Inventario** — nombre de archivo · fuente · link original.
- **Por qué esta selección comunica la dirección** — en profundidad, no una línea por imagen.
- **Cómo se amarra a la visión de la Etapa 1** — el hilo explícito de vuelta.
- **Jerarquía y composición sugeridas** — qué imagen es el ancla, cuáles son satélite, qué se
  agrupa con qué, para armar el tablero a mano en Miro.

### Etapa 4 — Resumen al usuario

En el chat, no en un archivo: cuántas imágenes por concepto · qué fuentes se usaron más · **qué
conceptos quedaron flacos** en imágenes disponibles, para completarlos a mano. La Etapa 4 existe
para que el constructor sepa dónde el pozo estaba seco, no para celebrar el total descargado.

---

## 1. Reglas duras

### 1.1 Las imágenes no se tocan

**No optimizar, no comprimir, no convertir de formato, no redimensionar.** El moodboard es material
de referencia: se juzga la textura y el grano, y ambos mueren en una recompresión. La regla de
`principios.md` sobre imágenes (`public/`, bump `-vN`) **no aplica aquí** — son universos distintos:
esto no se sirve al navegador.

**Precisión: esta ley protege el archivo, no toda copia que salga de él.** El máster no se toca nunca.
Pero cuando el tablero **sí** se sirve a un navegador —la entrega web al cliente— se **deriva** una copia
(lado largo 1600 px, JPEG q82) y se sirve esa. Derivar no es optimizar el moodboard: es fabricar un
objeto distinto, con otro propósito, sin borrar el original. **Servir los másters es la otra forma de
romper la ley**, porque una entrega que tarda un minuto en cargar no se mira. Medido en Introspection
Solution: **69,9 MB de máster en 25 imágenes** (103 MB con los descartes) → **3,6 MB servidos**.
Herramienta: `.claude/skills/entrega-cliente/tools/derivar-imagenes.mjs`.

> **Dos trampas de plataforma, las dos comprobadas aquí (Windows):**
> 1. **No hay ImageMagick.** El `convert` que aparece en el `PATH` es el de Windows, el que convierte
>    FAT a NTFS. Nunca invocarlo.
> 2. **`npx --yes -p sharp node script.mjs` NO sirve.** Parece la vía limpia para usar `sharp` sin
>    ensuciar ningún repo, y no lo es: npx **no expone su instalación temporal al proceso hijo**, ni por
>    resolución de módulos ni por `NODE_PATH` (ambas verificadas: `require('sharp')` falla). La vía que
>    sí funciona es instalarlo **una vez en un caché del sistema**, fuera de todo repo, y resolverlo
>    desde ahí.

### 1.2 Licencia: libre para referencia interna, verificar antes de producción

Unsplash, Pexels y Pixabay son de uso libre. Kaboompics y StockSnap.io también, pero **confirmar en
la página** si declara licencia distinta. Todas sirven para un tablero interno.

**Pasar una imagen de moodboard a producción es otra decisión**, con su propia verificación de
licencia y de derechos de imagen sobre personas. El moodboard no autoriza nada aguas abajo.

### 1.3 No adivinar URLs de descarga

Los IDs de las fuentes no se deducen: inventar uno da 404, y en Unsplash `/photos/<id>/download`
responde 403. La ruta es **WebFetch a la página → leer el `og:image` → construir la URL del archivo
original** desde ahí. Ver la pista de `routing.md` (Unsplash: `images.unsplash.com/photo-<id>`).

### 1.4 Sin API keys

No usar ninguna API key salvo que el usuario la entregue explícitamente. Todo el workflow se resuelve
con WebSearch + WebFetch + `curl`. **Nunca Playwright** (ley de `principios.md`).

### 1.5 Si en producción ningún banco convence, se genera la imagen — y el prompt lo escribes tú

Ya construyendo el sitio (Fase 3, no el tablero), cuando una pieza necesita una imagen y **ningún
banco devuelve algo a la altura**, hay tres salidas y solo una es lícita:

- ~~Bajar el estándar~~ y poner "la menos mala". Es el camino por el que entra el stock genérico, y
  se ve.
- ~~Dejar el hueco~~ y seguir. La sección queda coja.
- **Proponer generar la imagen** (ChatGPT / modelo de imagen equivalente) **y entregar el prompt ya
  escrito.** El constructor no dice "genérala tú": la sugiere y **redacta el prompt completo**, listo
  para pegar. Escribirlo es parte del trabajo, no un extra.

**El prompt es hiperrealista y hereda la visión, no la reinventa.** Nombra, siempre y explícitamente:

1. **Registro fotográfico** — fotografía real, no ilustración ni render. Cámara, focal, apertura,
   distancia y altura del encuadre.
2. **Luz** — dirección, dureza, temperatura. La del proyecto, en sus propias palabras (*"luz de
   ventana direccional, cálida, con grano"*), nunca "luz cinematográfica" o "iluminación premium".
3. **Materia y paleta** — los materiales de la visión y **los tokens del brandkit por su hex**. Un
   prompt que no nombra la paleta devuelve la paleta del modelo.
4. **Imperfección** — grano, polvo, desgaste, huella de uso. **Su ausencia es el tell #1 de imagen
   generada**: la superficie perfecta y el bokeh limpio delatan la máquina antes que cualquier dedo.
5. **Lo prohibido, en negativo** — los clichés del rubro, los tells que el proyecto ya tiene escritos
   y todo lo que la visión veta.

**Y las tres líneas que no se cruzan:**

- **Nunca generar a una persona real, ni a la clienta.** El retrato de quien firma el sitio sale de
  su sesión fotográfica. Una cara generada que se presenta como alguien es una falsificación, no una
  imagen.
- **Nunca generar prueba** — testimonios, resultados, escenas de clientes reales, documentos. La
  imagen puede ser atmósfera, materia u objeto; jamás evidencia de algo que no ocurrió.
- **La imagen generada obedece las mismas leyes que la fotografiada**: los candados, las reglas
  innegociables del proyecto y el piso de accesibilidad. Un modelo devolviendo algo hermoso no
  levanta ninguna prohibición.

**Se valida mirándola** (§3, el `alt text` miente — y un modelo miente más). Y se registra de dónde
salió: en el inventario, `generada · <modelo> · prompt en <archivo>`. El prompt se guarda; una imagen
cuyo prompt se perdió no se puede volver a producir ni corregir.

---

## 1.6 Cómo se le enseña al cliente: el formato es del área, no del proyecto

El tablero interno se arma en Miro; **lo que ve el cliente es una web de una página** (Fase 2.1.6,
skill `entrega-cliente`). Su **envoltorio y su layout son del área**, y viven **una sola vez** en
`_starter/entrega/index.html`: todo proyecto estampado del starter nace con él. Un envoltorio copiado
y retocado por proyecto son dos envoltorios que divergen, y el cliente acaba viendo el viejo.

El layout, validado de punta a punta en la entrega de Introspection Solutions, **es este orden y no
otro**:

1. **«Qué estás mirando»** — fija, del envoltorio, idéntica en todo proyecto. Ver abajo.
2. **La cita del cliente**, desnuda: sus palabras, sin rótulo y sin tarjeta.
3. **Los mundos**, uno por franja: nombre · lema · dos frases · imágenes con pie de una línea, y su
   veredicto (aprobado / con reparos / no es esto) **por mundo, nunca por imagen**.
4. **Qué sigue**: qué se le pide, y qué se le pide en firme.
5. **Sin pie de página.** Nadie lo lee, y la última palabra tiene que ser lo que se le pide.

### La ley: el moodboard se explica antes de pedir un juicio

**El cliente no sabe qué es un moodboard**, y nadie se lo ha dicho nunca: la palabra es del oficio.
Sin decírselo **juzga la cosa equivocada, y falla siempre por el mismo lado**: cree que está viendo
**el sitio** (*¿dónde está mi logo? ¿esa foto va en la portada?*), no su ambiente. Por eso la página
abre diciendo tres cosas, y las tres hacen falta:

- **qué es** — el acuerdo sobre el ambiente, antes de dibujar una sola pantalla;
- **que las imágenes son referencias, no material del sitio** — ninguna aparecerá en su web, y lo que
  aprueba es la luz, la textura y el tono, no la foto;
- **qué NO es** — aquí no hay menús, botones, logo, colores aplicados ni portada.

**Ese texto es del envoltorio, no del guion.** Es la única sección de la página que no sale del
cliente, porque **no habla de él: habla del método**. Reescribirla por proyecto es la vía por la que
se cuela la cocina y se pierde la neutralidad de la pared blanca.

> Lo demás que gobierna esa entrega —la pared de la galería es blanca, la respuesta vuelve como texto
> archivable, y la brevedad del guion— vive en la skill `entrega-cliente`, que es su ejecución.

---

## 2. Lo que el moodboard le debe a la Fase 1

Las direcciones conceptuales **no nacen del gusto del constructor**: nacen del brandkit inicial
(§1.5 del proyecto), que a su vez nació de la selección del cliente en el muestrario de estilos
(§1.3). Un moodboard cuyas paletas no se pueden nombrar con los tokens del brandkit es un moodboard
de otro proyecto. Ver `investigacion.md` §0.

---

## 3. Pistas

### [moodboard] El `alt text` de los bancos de imágenes miente — mirar cada imagen antes de inventariarla

- Contexto: Etapa 2 (búsqueda y descarga). Se cosechan páginas de foto desde las listas de Unsplash
  vía WebFetch, que devuelve la URL de cada foto **junto a su alt text**. La tentación es obvia:
  seleccionar por esa descripción, descargar en lote y pasar a la Etapa 3 sin abrir un solo archivo.
  En el moodboard de Introspection Solutions, **3 de las primeras 8 imágenes descargadas no eran lo
  que su descripción decía**: una "mano sobre textil" no tenía ninguna mano (era un pliegue de tela);
  una "maqueta en luz rasante" estaba en luz difusa; dos "papeles" eran flat-lays sobre fondo negro,
  justo lo contrario del mundo diurno para el que se habían buscado.

- Causa probable: los `alt text` de Unsplash son en buena parte autogenerados o escritos por el
  fotógrafo para SEO, no para describir con precisión. Nombran el **sujeto aparente** y son ciegos a
  todo lo que un moodboard juzga: la **clave tonal** (¿fondo negro o luz de día?), la **calidad de la
  luz** (¿rasante o difusa?), la **temperatura y saturación** de un color (un "gold" puede ser
  champagne o amarillo plástico) y la **presencia real** del sujeto que nombran.

- Pista: **abrir y mirar cada imagen antes de que entre al inventario.** No es opcional y no es caro:
  es la única forma de saber qué se descargó. Tres consecuencias operativas:
  1. **Nombrar el archivo por lo que la imagen realmente muestra**, no por lo que decía su alt text
     ni por lo que se fue a buscar. Un nombre mentiroso envenena la Etapa 3 y el tablero final: el
     lector confía en el rótulo y nunca vuelve a mirar el archivo.
  2. **Una imagen mal etiquetada suele estar en la carpeta equivocada, no ser un descarte.** Los dos
     "papeles" de fondo negro no eran basura: pertenecían a la dirección oscura. Reasignar antes de
     borrar.
  3. **La clave tonal es lo primero que hay que verificar**, porque es lo que decide a qué dirección
     pertenece la imagen — y es exactamente lo que el alt text nunca dice.

- Nota: emparentada con la pista de `routing.md` sobre descargar de Unsplash (el `og:image` y la URL
  del original). Aquélla resuelve **cómo bajar** el archivo; ésta, **si el archivo es el que se
  creía**. El sesgo del pozo también es información: si buscando "papel a la luz del día" el banco
  devuelve sobre todo flat-lays nocturnos, eso dice algo sobre qué dirección tendrá material propio y
  cuál habrá que fotografiar a mano — reportarlo en la Etapa 4, no forzar el cupo.

### [moodboard] Un banco que devuelve 403 no está caído: está mirando el User-Agent

- Contexto: Etapa 2, cavando el pozo de **Kaboompics** (el banco de papelería a luz de día). WebFetch
  devolvió **403 Forbidden** en todas sus URLs: la página de foto, la del photoshoot y la galería. La
  lectura fácil —y equivocada— es "el banco bloquea el acceso automatizado, saltarlo y buscar otro",
  que es justo lo que dice §0 Etapa 2 para links rotos. Aplicarla ahí habría dejado sin cavar el único
  pozo que tenía el material que se buscaba.

- Causa: no es un bloqueo de acceso, es un **filtro de User-Agent**. Kaboompics rechaza el UA de
  WebFetch y también un `Mozilla/5.0` pelado. Con un UA de navegador completo
  (`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/… Safari/…`)
  el mismo servidor responde **200** en las tres rutas. Verificado en las tres.

- Pista: **antes de descartar un banco por 403, reintentar con `curl` y un UA de navegador completo.**
  El 403 uniforme en todas las rutas de un dominio (incluida la home) es la señal: un link roto de
  verdad falla en una URL, no en el dominio entero. Y una vez dentro:
  1. El `og:image` de Kaboompics **no sirve**: es la tarjeta social de 1280×630, no el original.
  2. La página expone la URL real del original en **`/download/<hash>/original`** — se lee del HTML,
     no se adivina (§1.3 sigue en pie).
  3. La galería acepta búsqueda por query: `/gallery?search=<término>`.

- Nota: la regla de §0 Etapa 2 ("si un link falla, saltarlo y buscar otro") está pensada para una
  **foto** rota, no para un **banco** entero. Descartar un banco es descartar una parte del criterio
  —cada banco tiene su sesgo: Kaboompics es la luz de día, Unsplash es el flat-lay nocturno— y el
  moodboard de Introspection Solutions ya se había equivocado una vez por cavar un solo pozo.
