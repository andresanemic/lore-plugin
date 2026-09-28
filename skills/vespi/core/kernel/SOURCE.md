# Procedencia de la copia del kernel

Copia fija del kernel de Vespi **0.1.3 (candidato)** dentro de Lore Plugin 2.4.9-rc.4. Fuente canónica: `founder/proyectos/vespi/kernel/src/`, rama `rc4`, commit `cdf0fce`. Lore Plugin es la rama estable y lleva una versión fija del kernel; adoptar uno más nuevo lo decide Andrés (principio #22 del andamiaje).

Cada archivo es un encabezado de procedencia de tres líneas seguido de los bytes exactos de la fuente. Para verificar: quitar las tres primeras líneas y comparar el SHA-256 con esta tabla.

| Archivo | SHA-256 de los bytes de la fuente | Bytes |
|---|---|---|
| `authority.js` | `56ce8adf6f414fbbb419d64ea9f1f498d7dc4d798d5b20a318ed84336f0c9cc2` | 3809 |
| `operation.js` | `e93a305280c8169879d12ffc6cacbc73f36fee86859b72083d52d5a7870a188e` | 32335 |
| `receipt.js` | `6556752142a5fe324793d9f91c9e1a833a37c19fe5a57e4c0c27cf1b7b47c3f1` | 8244 |
| `continuity.js` | `cd26f2d34e0bc31f07bf8daec57f95a07a28491816042a467ed29f79b99a6334` | 4402 |
