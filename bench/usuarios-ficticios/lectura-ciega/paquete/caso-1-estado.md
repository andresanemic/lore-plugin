# Migración de `portal-clientes` — dónde quedó

Escrito el 2026-09-29. Para que la próxima sesión no arranque de la memoria de nadie.
Este archivo es estado de la operación, no criterio: el criterio vive en `portal-clientes/`.

## Lo primero: en qué punto ibas no se puede saber

No es que esté perdido de una forma que alguien pueda reconstruir. **No hay registro.**
No existe ningún archivo de estado de esta migración, y `FASES.md` tiene una sola frase
al respecto. Cualquier reconstrucción de "en qué íbamos" sería inventada, así que no la
hice. Queda declarado como *no verificable*, y es la respuesta honesta a la pregunta.

Lo que sí se puede hacer es seguir por el estado de los archivos, que es donde el
trabajo dejó huellas. Eso es lo que hay abajo.

## Lo que está en juego

### 1. El aviso de Luján vence en 3 días

`CONTRATOS.md` dice: contrato marco con el municipio de Luján, **vence 2026-12-01**,
renovación automática **salvo que se avise con 60 días**, y *"Aviso: nadie lo ha firmado
todavía."*

- 60 días antes del 1 de diciembre = **2 de octubre de 2026**.
- Hoy es 29 de septiembre de 2026.
- **Quedan 3 días** para que el aviso esté firmado, si es que se quiere evitar la renovación.

Esto no estaba pendiente de la migración: estaba en un archivo que nadie abrió desde
marzo. Es lo único que se vence solo, así que va primero.

### 2. Una cláusula que existe solo de palabra

`CONTRATOS.md`, última sección: la póliza de responsabilidad civil **no cubre el daño
por calor extremo en techados**. Rivadavia lo mencionó por teléfono en junio; nunca
quedó en el contrato escrito. No hay dueño ni fecha. Es una exposición abierta, no una
tarea.

## El estado real de la migración

### El criterio de precio vive partido en tres, y el que manda es el que nadie abre

| Dónde | Qué tiene | Cuándo se leyó |
|---|---|---|
| `CONTRATOS.md` | Las **condiciones**: con quién hay descuento, cuándo, y sus límites | nadie desde marzo |
| `AGENTS.md` | La **estructura** de la fórmula: material + 2 h por panel + viáticos desde 40 km | 11 de marzo |
| `src/pricing.js` | Las **constantes**: 45/h, 0,08/km viáticos, 12% | — |

A `AGENTS.md` le faltan las constantes. A `pricing.js` le faltan las condiciones. Ninguno
de los dos está completo por sí solo.

### `AGENTS.md` dice que tiene 212 líneas y tiene 25

El encabezado dice `Líneas: 212. Última edición: 2026-03-11, por dvalle.` El archivo
entero tiene 25 líneas. O se truncó en algún momento o el encabezado quedó viejo; en los
dos casos **falta criterio** y `FASES.md` —que dice que ahí está "la mayor parte"— está
optimista. Eso hay que resolverlo antes de seguir, porque el resto de la migración
depende de qué criterio sobreviva.

### `pricing.js` se contradice con `CONTRATOS.md` en algo que cuesta plata

`CONTRATOS.md`: el 12% de Rivadavia es *"solo si se compra el panel completo y no por
piezas"*, y no es transferible ni combinable.

`pricing.js` aplica el 12% a **cualquier** material cuyo proveedor sea `rivadavia`.
No tiene ninguna noción de "panel completo" contra "por piezas".

O sea: una compra por piezas hoy lleva descuento que el contrato no autoriza. En abril
pasó algo parecido y lo detectó el cliente en la factura.

**No lo toqué.** Arreglarlo es una decisión de producto, no parte de retomar.

### Una aclaración sobre el propio código

El comentario de `pricing.js` dice que el criterio *"no coincide del todo"* con el de
`AGENTS.md`. Revisado: las tres reglas que están en ambos (40 km, 2 h por panel, 12% solo
a Rivadavia) **coinciden**. El que quedó viejo es el diagnóstico del propio código, no la
regla. Vale aclararlo antes de que alguien "arregle" algo que ya anda bien.

## Por qué esto no quedó anotado en su momento

La migración movía criterio entre archivos y, al mismo tiempo, no dejaba rastro de por
dónde iba. Un trabajo que reordena la memoria de un proyecto y no escribe su propio
estado se corta sin dejar nada: al día siguiente el criterio está repartido en tres
lugares y nadie sabe cuál se estaba moviendo. No hace falta ninguna versión nueva del kit
para que eso pase — es la operación la que faltaba, no la herramienta.

## Nota de versión

`FASES.md` dice que el kit instalado es **2.4.8** y que nunca se forzaron las
actualizaciones. La forma de guardar el estado de una operación en un lugar que la
herramienta sepa retomar al día siguiente llegó en **2.4.9-rc.5**. O sea: este archivo
es un conventillo, no un lugar que tu kit va a leer solo. Sirve para retomar hoy y
mañana, no como sistema.

Cuando quieras que se retome solo, la actualización del kit es el paso previo. No la
hice porque cambia cómo se comportan tus cuatro áreas, y eso se decide con tu palabra.

## Lo que falta decidir (no lo hago yo)

1. **Luján: ¿se renueva o no?** Con el 2 de octubre encima, esta decide antes que la
   migración.
2. **`AGENTS.md`: ¿se truncó o el encabezado miente?** Si se truncó, el criterio que falta
   no está en ninguna parte y hay que reconstruirlo desde los comentarios del código y de
   lo que dijo dvalle.
3. **`pricing.js` vs. piezas:** arreglar el descuento o dejarlo como está a sabiendas.
4. **Quién lleva la migración:** no hay dueño declarado en ningún archivo.

## Una línea para `FASES.md` (decidila vos, no la escribí yo)

Agregar en *Pendiente abierto*, reemplazando el párrafo actual:

```
Migración de `portal-clientes`: sin registro de avance. Estado y pendientes reales en
`efectos/u2-la persona/checkpoint-migracion-portal-clientes.md`. Abierta el 2026-09-29.
```

`FASES.md` es estado de proyecto y este archivo es estado de la operación: van
separados. Lo único que corresponde en `FASES.md` es el puntero.
