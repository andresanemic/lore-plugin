# Release 2.3.1

Patch aditivo desde el lote 006 de ChatterPay. Sin cambios de contrato ni de arquitectura: siguen
siendo ocho skills.

## save-to-lore — fuente autoritativa antes de destilar un hecho

Antes de destilar un hecho desde lo que hay a la mano, la skill pregunta si existe una fuente
autoritativa — y si existe, toma el hecho de ahí. Muestrear salidas (piezas publicadas, imágenes
renderizadas) cuando la fuente existe produce un corpus internamente consistente y externamente
equivocado, y una nota de procedencia sobre los valores muestreados **aumenta** la confianza en el
dato malo. Origen: la paleta de ChatterPay muestreada de piezas publicadas (`#41D449`) contra el
manual de marca (`#00D856`), cuatro apariciones consistentes y equivocadas. Registro científico en
LUS v1.22 (aparición con giro propio en H11).

## save-to-lore — tercer disparador documentado

El disparador por **artefacto aprobado** — capturar junto con la traza de lo descartado, no el
resultado solo — ya vivía en la skill desde `78c143b`; ahora está documentado en README, USAGE y
REFERENCE (los dos idiomas), que era su deuda declarada.

## Tests

101/101. Nuevo test de consistencia: `save-to-lore pregunta por fuente autoritativa antes de
destilar un hecho`.
