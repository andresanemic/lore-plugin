# Feature Specification: Lore Plugin 2.1.3 — la cristalización se desarma

**Created**: 2026-08-18

**Status**: Approved — en publicación

**Repositorio de destino**: `plugins/proyectos/lore-plugin`

> **Principio III.** El spec se escribe aquí; la implementación aterriza en el repositorio del kit.

> **Número.** Es **2.1.3**, no 2.2. El 2.2 quedó suelto al descartar Graphify y se toma cuando haga
> falta una versión de ese tamaño. Esta salida corrige y completa un modo que ya existía.

## Por qué esta versión existe

El 2026-08-17 CRYSTALLIZE produjo fotografías que *enrutaban* a criterio que no traían. El dueño las
rechazó. El Caso 13 (Roble, Sauce, Laurel) es esa evidencia. Un día después, con el árbol enrutado
íntegro y la extracción a mini-raíz, el mismo juez aprobó el resultado.

## Capacidades que esta versión es

| | Qué |
|---|---|
| A | CRYSTALLIZE inlinea **todo** el árbol enrutado, incluido `lore-ecosistema/`. Una fotografía que solo apunta ha fallado el modo. |
| B | La fotografía es **extraíble**: marcadores `<!-- lore:extract path="..." owner="..." -->`, script que viaja con la skill, mini-raíz cuyo enrutamiento resuelve. El usuario no escribe el extractor. |
| C | El Caso 13 entra a los casos de estudio, con nombres de fantasía. |

No es un modo nuevo. No es 2.2.

## Requisitos

- **FR-A1** Default = árbol enrutado completo. Recortar un cuerpo exige nombrarlo como agujero.
- **FR-A2** Falla el pase si `enrutamiento.md` o `ecosistema.json` nombran un `lore/` que no viaja.
- **FR-B1** Cada archivo inlineado lleva el par de marcadores. `path` es relativo a `raiz`, nunca absoluto.
- **FR-B2** El extractor es `skills/transmute-lore/scripts/crystallize.mjs` (`pack` / `extract`). También `lore-plugin crystallize`.
- **FR-B3** Extraer reescribe `raiz` y falla si un puntero vivo no resuelve.
- **FR-C1** `CASES_{en,es}` y el README pasan a **trece** casos. El Caso 13 usa alias (Roble, Sauce, Laurel).

## Fuera de alcance

- Publicar 2.2.
- Reescribir notas de versiones ya publicadas (la 2.1.2 sigue diciendo que 2.2 estaba reservada: eso es lo que esa versión dijo).
- El benchmark grande, UPGRADE del ecosistema, integración con Graphify.
