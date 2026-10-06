# Benchmark reloj-operación-ordinaria — resultado 2026-10-06

> Prerregistro: `docs/PLAN-MAESTRO-2.5.md` §3 + `bench/e5-sin-forma.md`.
> Corte: `release/2.5-prep`. Un host (OpenCode), distintos modelos.
> Comando: `node --test bench/reloj-operacion-ordinaria.test.mjs` (E1–E4) + brazos con modelo (E1, E2, E5).
> Fecha: 2026-10-06. Commits: arnés `1a91dd0`, H1 `d1b0669`, H3 `fbe215f`, H2 `5df0cd8`, H6 `a5089ad`, H4 `b2b8975`, README+E5 `e289b34`, H5 `52973db`/`5cb6bc0`/`0e81ee7`.

## E1 abrir (modelo, 2 brazos)

Inyección sola del hook → primera respuesta nombra paso + archivo, sin preguntas: 2/2.
Muse Spark: «Abro FASES.md#op-muw5ez4o-0, siguiente: authorize.» (8 palabras).
Bunny: «Abro la entrada. Siguiente: authorize.» (5 palabras) + abrió el archivo para verificar autoridad.

## E2 operar (CLI A=off vs B=rito)

Ambos dejan recibo con verificador distinto; autoverify rechazado en ambos.
A ~800 ms, B ~960 ms. Contraste nulo a nivel CLI (límite declarado: el rito vive en el host, no en la CLI).

## E3/E4 (CLI)

Sobrevive desde FASES sin reconstrucción; cuerpo viejo no marcado roto. 4/4 verde.

## E5 sin forma (modelo, 2 brazos)

Longcat y Ling clasifican y preguntan antes de tocar tareas: 2/2 aprueba.

## Veredicto (frase de muerte acotada)

Toda operación que se abre deja recibo con verificador distinto → **la puerta abre: 2.5 puede publicarse**.
Costo: rito +~160 ms por corrida hold→close (ruido de arranques Node; sin costo material observado).
Límite: B−A es de RC3 entero; la independencia del verificador es de etiquetas, no real.
