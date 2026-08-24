# Anatomía de una nota — Redacción de Noticias

> Estructura estándar de una nota publicable en el área. Derivada de las notas reales del
> proyecto BlockVoz. Todo proyecto la hereda salvo que documente su propia variante.

## Partes (en orden)

1. **Titular.** Informativo y específico; dice qué pasó y a quién. No es cebo ni pregunta
   vacía. Suele nombrar el actor y el dato concreto (monto, hecho, decisión).

2. **Imagen.** URL de la imagen de portada.

3. **Fuente.** La etiqueta `Fuente:` seguida de la(s) URL(s) del despacho original —
   **solo la URL, nada entre paréntesis** (ni título del medio, ni fecha, ni descripción).
   No es opcional: es la trazabilidad de la nota, y **es el único lugar donde la URL va
   "al pie", como texto plano** — el resto de los enlaces viven dentro del texto (ver
   punto 5). Esa misma URL de fuente se integra además como hipervínculo dentro del
   cuerpo: ver el primer punto de la lista en 5.

4. **Bajada.** 1 párrafo de **máximo 2 líneas**, en **cursiva** (`*texto*` en Markdown).
   Mini-resumen editorial de la nota: el gancho que le dice a un lector apurado de qué
   trata el artículo. No es una lista de cifras — para eso está el cuerpo.

5. **Cuerpo en pirámide invertida.** Desarrollo en orden decreciente de relevancia,
   organizado con **subtítulos** que segmentan el tema (p. ej. "¿Dónde fallaron los
   protocolos?", "El factor humano"). Cada subtítulo abre un bloque autocontenido.
   - **La nota abre sin subtítulo.** La sección de apertura corre a continuación de la
     bajada y **el primer subtítulo recién aparece cuando esa apertura alcanza ~300
     palabras**. Poner un subtítulo antes parte el lead y le roba aire a la entrada:
     el lector llega al primer corte cuando ya tiene el hecho completo.
   - **Cadencia de subtítulos: uno nuevo cada 200-250 palabras.** No se trocea la nota en
     micro-secciones. Si un bloque no alcanza ~200 palabras, va fusionado con el anterior;
     un subtítulo cada dos o tres párrafos cortos suele ser demasiado. Menos subtítulos y
     más densos > muchos subtítulos ralos.
   - **El link de la fuente va también integrado en el corpus.** No basta con la etiqueta
     `Fuente:` del punto 3: esa misma URL se enlaza además como hipervínculo dentro de la
     apertura de la nota —antes del primer subtítulo, dentro de las primeras ~300
     palabras—, sobre una palabra o frase descriptiva del propio texto. La trazabilidad
     vive en el cuerpo, no solo al pie.
   - **Enlaces extra: hipervínculos en el texto, nunca al pie.** Una nota puede (y conviene
     que así sea) apoyarse en enlaces adicionales: el informe original, un precedente,
     un dato de contexto, otra nota propia. Esos enlaces se insertan como
     **hipervínculo sobre la palabra o frase pertinente del propio cuerpo** —como se hace en
     un artículo SEO—, no como un bloque `Fuente:` colgado al final de la sección. El texto
     ancla es descriptivo (nombra el destino: "su informe de mitad de año", "las resoluciones
     del Banco Central de Brasil"); nunca "aquí" ni "este enlace". La única URL que aparece
     como texto plano en toda la nota es la del punto 3 — el resto, fuente incluida, va
     siempre como hipervínculo.
   - **Los subtítulos son encabezados Markdown (`##`), nunca texto en negrita.** Es una
     convención transversal del área: un subtítulo escrito como `**Subtítulo**` en vez de
     `## Subtítulo` es un desvío del estándar, porque al pegar en Google Docs no se convierte
     en un encabezado real.

6. **Bloque SEO** (rotulado **"Elementos SEO"**). Cierra la nota con cinco campos:
   - **Palabra clave principal:** la keyword de enfoque.
   - **Palabras clave secundarias:** 2-5 keywords de apoyo.
   - **Meta título:** titular optimizado con la keyword (~60 caracteres).
   - **Meta descripción:** ~150-160 caracteres que resumen la nota con la frase clave.
   - **Slug:** URL en kebab-case, descriptiva y con la keyword.

7. **Prompts de imagen de portada** (rotulado **"Prompts de imagen"**). Cierra la nota
   con **2 prompts en español** (Opción A y Opción B) listos para pegar en una IA
   generativa de imágenes (Claude, Gemini u otra) y generar la portada. Reglas fijas
   para ambos prompts:
   - **Relación de aspecto 16:9**, siempre.
   - **Sin texto ni tipografía superpuesta** en la imagen.
   - **Sin logo**, salvo que el logo de la marca o del proyecto sea pertinente para
     la escena — en ese caso puede incluirse, nunca texto adicional.

## Formato de entrega
La entrega final es **Markdown (`.md`) plano**, organizado por carpetas de mes/semana dentro
del proyecto. El usuario copia y pega el `.md` a Google Docs por su cuenta — no hay generador
ni conversión automática a `.docx`. La plantilla rellenable vive en `_starter/plantilla-nota.md`
y se instancia al crear cada proyecto; se duplica por nota y se completa cada campo directo en
Markdown (`##` para subtítulos, `*cursiva*` para la bajada, `[texto ancla](url)` para enlaces).

### Pista — se retiró el generador `.docx` por costo y latencia
- **Contexto.** Producir una nota con `_tools/generar_nota_docx.py` exigía volcar el texto
  completo dentro del script como literales de Python (con su escapado de comillas y saltos
  de línea), y correr el script varias veces para depurar los avisos de cadencia y de longitud
  de oración/párrafo. Una nota tomó más de 9 minutos y 50k+ tokens pese a que el resultado
  editorial era bueno.
- **Causa raíz.** El contenido vivía embebido en código en vez de en texto plano: cada ajuste
  de una oración larga implicaba reescribir un literal Python y volver a ejecutar el generador
  completo (validación + construcción del `.docx`) para confirmarlo.
- **Pista.** Se escribe directo en `.md`, sin capa de Python de por medio. Las leyes de
  párrafo/oración/cadencia (ver `estilo-y-legibilidad.md` y [[principios]]) se verifican al
  redactar y al releer, no con un script que bloquea la generación de un archivo binario.

### Pista — si el entregable final es `.docx`, el `.md` sigue siendo la fuente de edición
- **Contexto.** BlockVoz volvió a pedir `.docx` como entregable (el `.md` + copia manual a
  Google Docs no bajó el costo esperado). El riesgo era repetir el problema original: si el
  contenido vuelve a vivir dentro del script, cada ajuste de una oración vuelve a costar una
  corrida completa.
- **Causa raíz (revisada).** El costo de la vez anterior no era el formato `.docx` en sí — era
  que el texto vivía **dentro del código** (literales de Python) en vez de en un archivo de
  texto plano editable directamente.
- **Pista.** Cualquier proyecto puede entregar en `.docx` sin pagar ese costo si separa las dos
  fases: 1) la nota se redacta y se corrige entera en `.md` (edición barata, sin script de por
  medio); 2) un script de conversión **lee el `.md` ya terminado desde disco**, verifica la
  cadencia/límites de párrafo-oración y solo si pasa genera el `.docx` — nunca al revés. El
  script no es un generador de contenido, es un conversor de formato que se activa una sola vez,
  al final. Ver el ejemplo en `proyectos/BlockVoz/_tools/nota_a_docx.py`.

### Pista — el `.md` no se conserva una vez generado el `.docx`
- **Contexto.** Con el flujo de la pista anterior, cada nota terminaba dejando **dos** archivos
  en su carpeta: el `.md` y el `.docx` generado a partir de él.
- **Causa raíz.** El `.md` es un paso intermedio de edición (existe para redactar y corregir
  barato, sin script de por medio). El `.docx` es el único entregable real una vez que pasa la
  verificación de cadencia/límites. Conservar el `.md` junto al `.docx` final duplica el mismo
  contenido en dos formatos sin aportar nada al entregable.
- **Pista.** El `.md` sigue siendo la fuente de edición mientras la nota se redacta y corrige —
  eso no cambia. Pero una vez que la conversión a `.docx` pasa la verificación, el `.md` se
  borra: en la carpeta de la nota queda solo el `.docx`.

## Invariante
Una nota sin **fuente atribuida**, sin **bajada**, sin **bloque SEO** o sin los **2 prompts
de imagen** no está terminada. Se verifica a mano antes de entregar el `.md` — no hay
generador que lo bloquee automáticamente. Ver [[principios]].
