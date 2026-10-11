# Arbitraje de cartas — 2.5.2

Regla de producto aprobada por el dueño el 2026-10-08. No constituye un resultado científico ni prueba de fertilidad.

## Oferta

`operation card offer` requiere una operación activa y decisión previa. Es elegible un muro de tres fallos normalizados con búsqueda registrada (también si no está disponible), o un punto material con dos opciones viables y consecuencias diferentes en alcance, secuencia, autoridad, artefacto, reversibilidad o compromiso. Una palabra de estancamiento no basta. No ofrecer por rutina en tareas mecánicas/repetitivas. Máximo una oferta no solicitada por operación; otra requiere una petición humana registrada por el coordinador.

`hooks/baraja-entry.mjs` solo prepara el prompt de una oferta ya persistida. Requiere root y operación, relee el recibo actual y guarda prompt_prepared_at antes de retornar el prompt y su cardId. Sin recibo o tras preparación/respuesta, devuelve null. No registra entrega real al host, respuesta ni efecto. El coordinador serializa estas escrituras; no se promete exclusión entre procesos concurrentes. La baraja tiene una sola fuente en `skills/vespi/core/card-deck.mjs`; `scripts/baraja.mjs` conserva la entrada compatible.

## Respuesta y evidencia

`operation card answer` conserva accepted, declined o ignored sin determinar la clase. El silencio no se registra como ignored sin observación. La oferta conserva carta, momento, elegibilidad y decisión previa; no el transcript entero.

`operation card arbitrate` registra evidencia posterior ligada al ID de oferta, fuente, observador, fecha y decisiones antes/después. Son atestaciones del coordinador: no autentican experiencia humana ni causalidad. Las observaciones insuficientes o contradictorias mantienen pending/null y quedan en el historial.

## Regla aprobada

- Germen: kind opening, opción/distinción explícita y cambio posterior trazado.
- Ruido: kind friction, desvío/fricción descrito y disposición reverted/discarded con motivo. Reverted debe volver a la decisión previa.
- Neutral: kind evaluation, evaluación descrita y decisión posterior igual a la previa.

La evidencia debe referir la carta exacta y la decisión previa registrada, tener fuente/observador/descripción y fecha posterior a la respuesta, no futura. Aceptar, declinar o ignorar no determina clase. Sin evidencia admisible la clasificación queda pending. Una clasificación puede revisarse ante nueva evidencia; el historial conserva lo anterior.

## Frontera de publicación

Los tests simulan conductas y verifican estos mecanismos; no acreditan yo-tú, fertilidad ni una experiencia humana general. Las tres clases requieren casos suficientes y negativos de la campaña integrada antes de cerrar Gate 9/C5. La oferta sola no satisface dato→instigación. Una carta no resuelve un permiso, amplía autoridad ni sustituye búsqueda o arbitraje del acuerdo.
