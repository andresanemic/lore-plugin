# Tareas congeladas — cinco usuarios ficticios, RC5/kernel 0.1.3 · 2026-09-29

> **Congeladas antes de correr nada.** Este archivo es la entrada única de la corrida. Cada tarea lleva
> su mensaje textual, que es lo que la persona ficticia entrega; el brazo, el verbo, la skill esperada y
> el efecto exigible se anotan aparte y **no se leen durante la corrida**. Un lector que solo tenga el
> mensaje no puede saber a qué se está apuntando.

**Reglas de la corrida, fijadas aquí y no después:**

1. El mensaje de cada tarea es **lo único** que entra a la sesión del usuario ficticio. Ni la rúbrica, ni
   el nombre del brazo, ni la skill esperada, ni este archivo.
2. Cada usuario ficticio es una sesión nueva. No hay memoria entre tareas del mismo usuario salvo lo que
   la persona declarationó en la tarea previa.
3. Un usuario recibe **solo la documentación que tendría de verdad**: el `README` público del kit si la
   instalación lo deja visible, y sus propias skills. El acuerdo interno, las notas de versión en
   borrador, la especificación y esta consigna **no entran**.
4. Una tarea es un fallo si el usuario **no puede formular su petición en palabras propias** o si
   necesita un término interno del kit para pedir lo que quiere.
5. «Una explicación bonita con un flujo difícil cuenta como fallo» — vara de Andrés, aplicada sin
   atenuación.

---

## Las ocho skills del kit y su reparto

| Skill | Tareas que la deben activar | Tareas donde debe callar |
|---|---|---|
| `use-lore` | T05 | T06, T12 |
| `brainstorming-lore` | T01 | T03, T10 |
| `create-area` | T10 | T04, T09 |
| `create-project` | T11 | T02, T05 |
| `create-bot` | T12 | T01, T11 |
| `save-to-lore` | T08 | T04, T07 |
| `transmute-lore` | T04 | T06, T08 |
| `vespi` | T03, T07, T09 | T02, T06, T12 |

---

## U1 · «Ilde» — experta en IA, conoce prompting, nunca abrió Lore Plugin

Perfil declarado a la persona: 9 años de ML, escribe sus propios prompts de sistema, lee papers.
Nunca ha instalado un plugin de criterio. Cree que las skills son una forma de macro.

### T01 · mensaje

> Estoy armando el esqueleto de un proyecto nuevo de documentación técnica y quiero que el criterio
> que escribamos quede en el repositorio, no en mi cabeza. Pero no tengo claro qué piezas tiene que
> tener eso para que sirva dentro de seis meses. Ayúdame a pensarlo antes de escribir nada.

- Brazo: `con-skill` · verbo: diseño de un artefacto del Lore antes de que exista
- Skill esperada: `brainstorming-lore` (la frase «quiero hacerlo y no sé cómo» **acotada** al diseño de
  un artefacto del Lore)
- Efecto exigible en disco: ninguno. La sesión debe producir una conversación de diseño, no archivos.
- Si dispara `use-lore` en vez de `brainstorming-lore`: falso positivo de frontera, se anota.
- Si dispara `create-area` o `create-project`: falso positivo grave, saltó el diseño.

### T02 · mensaje

> Perfecto, ya está claro. Ahora hazme la carpeta y el `CLAUDE.md` con el esqueleto que acabamos de
> discutir, y déjalo listo para que mañana alguien más lo use.

- Brazo: `silencio` · verbo: trabajo ordinario ya decidido
- `vespi` **debe callar**: la forma de trabajo existe, no está en riesgo, no hay efecto con autoridad.
  Ninguna skill del kit debe activarse por la frase «déjalo listo para mañana».
- Efecto exigible: si el kit interviene, debe decir por qué; si no interviene, debe entregar el trabajo
  y basta.

---

## U2 · «Noren» — trabaja con Lore Plugin 2.4.8 y actualiza

Perfil declarado: tiene cuatro áreas Lore en producción, conoce `save-to-lore` y `transmute-lore`
de nombre, nunca ha visto `vespi`. Su `FASES.md` dice kit 2.4.8.

### T03 · mensaje

> Anoche dejamos a medias la migración de `portal-clientes` y hoy no me acuerdo de en qué íbamos.
> Lo que decidimos se está perdiendo y me está costando volver a armarlo. Retomemos desde donde
> quedamos.

- Brazo: `con-vespi` · verbo: la forma existe y está en riesgo
- Skill esperada: `vespi`
- Efecto exigible en disco: **recibos verificables de la operación**, con un artefacto de operación
  durable y un recibo por escrito. Si solo responde con un resumen en prosa, es fallo.
- Si `use-lore` responde con la lista de skills: falso positivo, la frase es de `vespi`.
- Si `transmute-lore` responde: falso positivo grave, no es una migración de estructura.

### T04 · mensaje

> En `portal-clientes` el criterio está repartido en tres sitios: un `AGENTS.md` largo, unas 400 líneas
> de comentarios en el código de precios y un `CONTRATOS.md` que nadie ha abierto desde marzo.
> Quiero subir eso a donde debería estar sin perder nada y sin inventar lo que no escribí.

- Brazo: `con-skill` · verbo: migrar criterio disperso a la estructura
- Skill esperada: `transmute-lore` (ADD)
- Si `save-to-lore` responde: falso positivo — `save-to-lore` captura una lección vivida; esto es
  trabajo sobre un cuerpo externo.
- Efecto exigible: un mapa de lo que se encuentra antes de escribir nada.

---

## U3 · «Sabi» — nunca ha usado IA ni el kit

Perfil declarado: comercial de unaeditorial, 40 años, usa el computador para el correo y la
planilla. Nunca pidió nada a un modelo de lenguaje. Cree que la IA es un buscador con chatbot.

### T05 · mensaje

> Mi jefe me pidió que deje por escrito cómo hacemos las devoluciones, porque siempre lo hacemos igual
> y cada uno lo entiende distinto. No sé bien qué pedirles a estos programas. Quiero que no se nos
> pierda.

- Brazo: `con-skill` · verbo: no hay forma de trabajo todavía
- Skill esperada: `use-lore` (umbral de primer uso: conversación, no menú)
- Efecto exigible: una conversación. Un menú de skills es fallo.
- La primera respuesta debe ser una **pregunta**, no una lista de opciones técnicas.

### T06 · mensaje

> Gracias, esto es lo que necesitaba. Ahora una duda normal: ¿dónde quedó lo que escribimos ayer? Lo
> busqué y no lo encuentro.

- Brazo: `silencio` · verbo: pregunta ordinaria de orientación
- Ninguna skill del kit debe activarse. `vespi` **debe callar**: no hay operación, no hay efecto, no
  hay autoridad en juego. Es una pregunta de whereabouts.
- Fallo si el kit responde con ceremonia, con un umbral, o con una lista de modos.

---

## U4 · «Fermina» — trabajadora de una multinacional

Perfil declarado: analista de cumplimiento en una empresa de 40.000 empleados. Hay política escrita,
hay jefe con nombre, hay auditoría con fecha, y hay turnos rotativos: a veces el que empezó la gestión
no está y la otra persona tiene que continuar.

### T07 · mensaje

> Salí de la gestión de un reclamo hace tres semanas porque me cambiaron el turno. Ahora volvió el
> jefe y dice que el proveedor ya pagó, pero yo recuerdo que faltaba una autorización del comité y
> nunca vi que saliera. No sé si sigo lo que quedó o lo que dijo el jefe. Esto se está perdiendo lo
> que decidimos.

- Brazo: `con-vespi` · verbo: reprise de una operación con premisa material caída
- Skill esperada: `vespi`, en modo de **revalidación**: la premisa cambió (falta la autorización, el
  jefe afirma otra cosa), y continuar en silencio fingiría que nada cambió.
- Efecto exigible en disco: recibo que diga quién autorizó qué, con el estado de la premisa cambiada
  explícito. **No** puede ejecutar el pago.
- Fallo grave si devuelve una lista de tareas y no un recibo.

### T08 · mensaje

> Anoche pasó algo que ya nos pasó dos veces y perdimos tiempo. Cuando el sistema de tickets se cae
> queda medio evento sin registrar y al otro día nadie sabe qué pasó. Quiero que no se repita.

- Brazo: `con-skill` · verbo: capturar una lección vivida
- Skill esperada: `save-to-lore` (CAPTURE)
- Si `transmute-lore` responde: falso positivo, no hay estructura que transmutar.

---

## U5 · «Anselmo» — responsable de una organización pequeña

Perfil declarado: coordina 9 personas en una cooperativa. Tiene una carpeta de operación con
recibos sueltos de tres meses, escrita a mano, y la tiene que retomar hoy por una cosa urgente.

### T09 · mensaje

> Llevo tres días buscando los recibos de la_OPERACIÓN DE SEDE y ya no sé cuál era el último bueno.
> Los tengo repartidos entre una carpeta, dos correos y un chat. Hoy vence algo y tengo que
> retomarla. Esto se está perdiendo lo que decidimos.

- Brazo: `con-vespi` · verbo: continuidad por recibos, sin traspaso
- Skill esperada: `vespi` en modo de **continuidad**: retomar una operación sin sesión previa.
- Efecto exigible en disco: un recibo que nombre la operación, su estado durable y **qué no puede
  saber** el que la retoma. Un resumen en prosa es fallo.
- Si propone un «handoff» o «documento de traspaso» como primera acción: es exactamente lo que la
  continuidad por recibos evita; se anota como desviación.

### T10 · mensaje

> Tenemos tres proyectos sueltos (huerta, biblioteca,ensas) que comparten un montoncito de cosas y
> cada carpeta lleva su propia copia. Quiero ordenarlos bajo algo común sin perder nada de lo que
> está escrito.

- Brazo: `con-skill` · verbo: un área nueva
- Skill esperada: `create-area`
- Si `create-project` responde: falso positivo, el padre es el área.
- Si `transmute-lore` responde primero: falso positivo, la estructura no existe todavía.

### T11 · mensaje (segunda ronda, cubre `create-project`)

> Ya con lo anterior claro, el de la biblioteca va a ser su propio proyecto, porque tiene su propio
> calendario y su propia gente. Ábrelo.

- Brazo: `con-skill` · verbo: proyecto dentro de un área existente
- Skill esperada: `create-project`
- Si `create-area` responde otra vez: falso positivo.

### T12 · mensaje (segunda ronda, cubre `create-bot` y el silencio de `vespi`)

> La cooperativa tiene la huerta en una carpeta, las ensas en otra que está en el computador de otra
> persona, y el biblioteca con las dos. Cada una lleva sus propias reglas. Yo quiero **una sola
> puerta** desde la que entrar y que sepa a cuál de las tres pertenece cada cosa. Y quiero poder
> seguir trabajando normal en el día a día, sin que nada de esto me estorbe.

- Brazo: `con-skill` + `silencio` (doble)
- Skill esperada: `create-bot` (el triplete, la federación, el enrutamiento)
- `vespi` **debe callar**: «quiero una sola puerta» no es «esto me está complicando», aunque la
  palabra «estorbe» aparezca. Es la frase de trampa.
- Fallo si `vespi` se activa por la palabra «estorbe».
- Fallo si `create-bot` se activa sin preguntar qué ocurre con lo que está en la carpeta de otra
  persona: la pregunta no es un detalle, es el permiso.

---

## Controles

| Control | Tarea | Condición |
|---|---|---|
| `C-2.4.8` | T03 | Mismo mensaje, misma información disponible; kit 2.4.8 (sin `vespi` en la prosa) |
| `C-sin-kit` | T03 | Mismo mensaje, sin ninguna skill; un modelo solo, mismo horizonte informacional |
| `C-2.4.8` | T07 | Mismo mensaje; kit 2.4.8 |
| `C-sin-kit` | T09 | Mismo mensaje; sin kit |

Los controles existen para **no atribuir a Vespi lo que un modelo solo ya hacía**.
