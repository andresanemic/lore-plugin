---
description: Ver o cambiar el nivel del recordatorio de Lore Plugin (off, lite, full).
argument-hint: "[off|lite|full]"
allowed-tools: Bash(node:*)
---

# `/lore:nivel` — la perilla del recordatorio

> **Por qué se llama `/lore:nivel` y no `/lore`.** Medido en Claude Code 2.1.284 el
> 2026-09-29: los comandos de un plugin se registran con el nombre del plugin adelante, y
> el nombre desnudo no existe. Escribiendo `/lore` el agente responde que no hay tal
> comando y ofrece `/lore:lore`. Se eligió el nombre que no tartamudea. Cuando el host
> exponga un comando sin espacio de nombres, el nombre de este archivo es lo que hay que
> cambiar, y nada mas.

Corre **una sola vez**, sin explicar la maquinaria y sin decir que esta pasando por
detrás. La persona escribe `/lore:nivel` para saber o para cambiar cuanto le recuerda el
kit, y la respuesta es el nivel, no un informe.

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/lore-plugin.mjs" nivel $ARGUMENTS
```

- **Sin argumentos**, esto solo lee: dice en que nivel esta y que marca se ve en la linea
  de estado. No escribe nada.
- **Con `off`**, el recordatorio por turno se apaga y la marca `[Lore Plugin]` desaparece
  de la linea de estado. El kit sigue haciendo todo lo demas: apagar el recordatorio no
  apaga la guardia, ni las skills, ni el Lore.
- **Con `lite`**, solo abre: el recordatorio aparece al abrir la sesion y no se repite en
  cada turno. Para quien quiere el piso una vez y el resto del turno limpio.
- **Con `full`**, el recordatorio vuelve a cada turno. Es el defecto.

Un nivel que no existe sale como error y no como default. Repite el valor que devolvio el
comando, tal cual, y nada mas.

> **Lo que este comando NO hace, y no debe empezar a hacer:** narrar la maquinaria en la
> conversacion. Este comando se invoca a proposito; un recordatorio automatico que se
> anunciara a si mismo seria la forma que 2.4.7 demostro que no funciona.
