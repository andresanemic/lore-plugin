# Procedencia del contraste Harness²

El runner `bench/meridian-contrast.mjs` porta solo la separación entre especificación y evaluador, el paquete de trabajo sin respuestas esperadas y la asignación de IDs ciegos. No copia ni ejecuta el harness o su sandbox.

Fuentes: `google-research/harness2`, commit `1cfe254e8d25b15f37048c3730134686abe60335`, licencia Apache-2.0: `harness2/core/spec.py` (separación de especificación), `harness2/core/context.py` (contexto y artefactos), `harness2/core/selection.py` (IDs anónimos) y `harness2/core/ledger.py` (registro de costos). La referencia de injerto está en `operations/2026-10-21-meridian-avance/l4-build/root/referencia/2026-10-20-injertos-orquestacion.md`.

Pruebas distintivas: `bench/meridian-contrast.test.mjs` comprueba que metadata adicional en fuentes no llegue al trabajador, que el identificador declarado por costo no reemplace el ID ciego, que una respuesta evaluadora incluida en el encargo se rechace y que costos sintéticos no se llamen observados ni produzcan un total de costo.
