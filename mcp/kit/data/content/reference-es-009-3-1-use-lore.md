### 3.1 `use-lore`

**Rol:** Punto de entrada a Lore.

**Responsabilidades:**

- Explicar la arquitectura de Lore para el proyecto o Área actual.
- Mostrar qué artefactos existen y cómo están estructurados.
- Dirigirte al skill adecuado según tu intención.
- Para **entregables complejos**, fijar dueño, Lore enrutado, precedente, capacidades verificadas, lotes revisables y entrega comprobada; sugerir `/model` para el tramo mecánico en vez de un subagente — un subagente relee todo el árbol de Lore primero. Enrutar cada medio a su skill dueña en vez de convertirse en una novena skill de producción.
- **Enrutar una petición de bot, nunca contestarla con un Área** (2.1.1). En una máquina sin nada de
  Lore, quien pide bots ya nombró el entregable: las Áreas son **pasos**, `create-bot` corre al
  final, y la cadena se dice completa con su costo — un `create-area` más un `transmute-lore` por
  cada fuente antes de que el bot pueda enrutar a algo.
- **Ofrecer el acuerdo en el primer uso**, empezando por el porqué. El acuerdo se ofrece cuando el
  trabajo tiene que durar más de una sesión y **obliga solo si la persona lo acepta**; el kit nunca
  se niega a operar sin él. Existe solo si pasó tres puertas juntas: la IA lo recapitula completo,
  la persona lo aprueba explícitamente y queda escrito antes de construir. En ese primer acuerdo la
  persona elige la intensidad (`sobria`/`cercada`, por defecto `cercana`), el ritmo
  (`despacio`/`normal`/`rapido`, por defecto `normal`) y sus límites de uso **por familia de modelo
  y nivel, nunca por número de versión**. `create-area`, `create-project` y `create-bot` lo
  ofrecen en su propio umbral, no como un paso aparte.
- **Avisar una sola vez a quien actualiza desde una versión anterior**, en llano: llegó Vespi, qué
  puede hacer y la invitación a fijar límites. Mostrar ese aviso **no aprueba un acuerdo** ni crea
  ninguno.

**Artefactos que escribe el acuerdo:**

| Artefacto | Qué es | Dónde |
|---|---|---|
| `acuerdo.md` | El documento del acuerdo. **Empieza por el porqué**, luego la recapitulación completa, las perillas, los límites y las cuatro apuestas. Las enmiendas **se agregan al final**: nunca se sobrescribe. | raíz del árbol, junto a `FASES.md` y **fuera de `lore/`** |
| `.lore-acuerdo` | El estado legible por máquina. Es reescrito, y su campo `aprobado` es lo único que hace que exista un acuerdo: un recibo con esa forma pero sin ese campo —el estado que deja el aviso— **no cuenta**. | raíz del árbol, junto a `acuerdo.md` |

Las cuatro apuestas del acuerdo, y solo cuatro, son sobre el aparato: que las frases cotidianas
alcancen para repartir el trabajo entre las tres skills; que el recordatorio por hook sostenga el
registro turno a turno; que OpenCode permita avisar sin bloquear; y que cada host deje leer el uso
de la sesión, donde no, usando las señales contables y declarándolo por escrito. **Si cae una, se
sigue.** «El acuerdo nunca se impone» no es una apuesta: es una regla dura, y por eso no degrada
nunca. La guardia registra escrituras en el árbol de otra persona; el permiso del host decide si
avanzan y el coordinador respeta la gobernanza propietaria. Esta regla no detiene el trabajo.

**Interacciones típicas:**

- «Explícame la estructura de Lore de este repositorio.»
- «¿Qué artefactos existen para este proyecto?»
- «¿Qué skill debería usar para capturar una nueva pista invariante?»
- «Quiero crear un bot para X e Y.»
- «Construye este entregable complejo desde varias fuentes y entrégalo en el sistema destino.»

Usa `use-lore` siempre que no tengas claro dónde empezar.

---

