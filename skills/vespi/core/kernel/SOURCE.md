# Procedencia de la copia del kernel

Copia fija del kernel de Vespi **0.1.3 (candidato)** dentro de Lore Plugin 2.4.9-rc.5. Fuente canónica: `founder/proyectos/vespi/kernel/src/`, rama `codex/rc5`, commit `54c20c7`. Lore Plugin es la rama estable y lleva una versión fija del kernel; adoptar uno más nuevo lo decide Andrés (principio #22 del andamiaje).

Cada archivo es un encabezado de procedencia de tres líneas seguido de los bytes exactos de la fuente. Para verificar: quitar las tres primeras líneas y comparar el SHA-256 con esta tabla. La tabla no se autoprotege: `bench/vespi-kernel-provenance.test.mjs` compara estos bytes contra `git show 54c20c7:src/<archivo>` leído de la fuente, no contra esta página.

| Archivo | SHA-256 de los bytes de la fuente | Bytes |
|---|---|---|
| `authority.js` | `56ce8adf6f414fbbb419d64ea9f1f498d7dc4d798d5b20a318ed84336f0c9cc2` | 3809 |
| `continuity.js` | `ceba712aa3d9300a83382b90dd5ab97bb5809fe1a3f779c99f0984bf6305e73e` | 6400 |
| `delegation.js` | `677249e761f29091fc57920345e5019e8cd796bdb4ffe75c7a371ce1db551ab3` | 10562 |
| `operation.js` | `20a465e1f583755467c3fe579e69c90676cdff0e47f5d3f2fc676a4a198b4ee6` | 34204 |
| `receipt.js` | `adc5cabcf31d5ca77ab5fbef904287c3a1662a98c6b3e0ddf9c4265d4bfad8a6` | 13147 |
