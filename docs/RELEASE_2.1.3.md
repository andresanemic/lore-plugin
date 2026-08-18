# Lore Plugin 2.1.3 — The snapshot unpacks

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español)

A crystallization that only *points* at criterion it does not contain is not a crystallization. 2.1.3 makes `crystallize` carry the whole routed tree, and makes that file **extractable** back into a folder whose routing table resolves.

This is [Case 13](./CASES_en.md). 2.2 is not this version: that number is free and will be used when a release of that size is needed.

## What 2.1.3 changes

### The snapshot has to work alone

CRYSTALLIZE inlines every routed `lore/` — the bot's, the areas', `lore-ecosistema/` when that is what the machine has. "Without the ecosystem" is a failure of the mode, not a scope. A smaller export is allowed only when each dropped body is named as a hole.

### The snapshot unpacks

Each inlined file carries:

```markdown
<!-- lore:extract path="…" owner="…" -->
```

The extractor ships with the skill. Nobody has to write it.

```text
node skills/transmute-lore/scripts/crystallize.mjs pack --bot <dir> --out lore-cristalizado.md
node skills/transmute-lore/scripts/crystallize.mjs extract --from lore-cristalizado.md --out extraido
```

`lore-plugin crystallize pack|extract` does the same. Unpack rebuilds a mini-root that mirrors `raiz`, rewrites `ecosistema.json`, and **fails** if a live routing pointer is missing.

### Case 13

On 2026-08-17 three live crystallizations were rejected: they routed to bodies they did not carry. A day later two bots — **Roble** and **Laurel** — were packed and extracted; every pointer resolved. The owner judged that result as what crystallize was for.

## What this is not

Not a new mode. Not 2.2. Private material stays out. The derivative is still not authority.

---

<a name="español"></a>

# Lore Plugin 2.1.3 — La fotografía se desarma

> [README](https://github.com/andresanemic/lore-plugin/blob/main/README.md#español)

Una cristalización que solo *apunta* a criterio que no trae no es una cristalización. La 2.1.3 hace que `crystallize` lleve el árbol enrutado entero, y que ese archivo se pueda **extraer** a una carpeta cuyo enrutamiento resuelve.

Es el [Caso 13](./CASES_es.md). La 2.2 no es esta versión: ese número está suelto y se usa cuando haga falta una salida de ese tamaño.

## Qué cambia en la 2.1.3

### La fotografía tiene que servir sola

CRYSTALLIZE inlinea cada `lore/` enrutado —el del bot, el de las áreas, `lore-ecosistema/` cuando es lo que hay en la máquina—. «Sin el ecosistema» es falla del modo, no un alcance. Un recorte solo vale si cada cuerpo omitido se nombra como agujero.

### La fotografía se desarma

Cada archivo lleva:

```markdown
<!-- lore:extract path="…" owner="…" -->
```

El extractor viaja con la skill. Nadie tiene que escribirlo.

```text
node skills/transmute-lore/scripts/crystallize.mjs pack --bot <dir> --out lore-cristalizado.md
node skills/transmute-lore/scripts/crystallize.mjs extract --from lore-cristalizado.md --out extraido
```

`lore-plugin crystallize pack|extract` hace lo mismo. Extraer reconstruye una mini-raíz que espeja `raiz`, reescribe `ecosistema.json` y **falla** si falta un puntero vivo.

### Caso 13

El 2026-08-17 se rechazaron tres cristalizaciones vivas: enrutaban a cuerpos que no traían. Un día después se empaquetaron y se extrajeron dos bots — **Roble** y **Laurel**—; cada puntero resolvió. El dueño juzgó ese resultado como lo que buscábamos con cristalizar.

## Qué no es esto

No es un modo nuevo. No es la 2.2. El material privado sigue fuera. El derivado sigue sin ser autoridad.
