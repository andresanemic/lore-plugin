# Lore en 90 segundos

> [← Volver al README](../README.md) · [English version](./90_SECONDS_en.md)

## El problema

Resuelves algo difícil con una IA. A la semana siguiente, en un chat nuevo, se lo explicas otra vez.
La IA no empeoró: simplemente nunca recibió lo que aprendiste. La experiencia fue real y no dejó una
huella que restrinja nada.

Acumular notas no lo arregla. Una nota responde *qué pasó*. Lo que necesitas respondido es *qué
cambió en cómo decidimos, a raíz de lo que pasó*.

## El mecanismo

Tres movimientos, y el del medio es un acto, no una carpeta:

```text
experiencia (una fricción vivida)  →  destilación (un paso explícito, con puerta)  →  criterio (lore/)
```

La destilación es donde una cicatriz se vuelve regla. Es deliberada: algo tiene que decirse en voz
alta, aprobarse y escribirse. Nada entra solo — un contenedor que se llena a sí mismo satisface el
impulso de preservar sin producir nada que restrinja una decisión.

## Qué sale

Una **Pista Invariante** — `Contexto → Causa raíz → Pista → Confianza`. Una real:

> **Los elementos parpadean antes de que arranque la animación.** *Contexto:* animaciones de entrada
> en una página renderizada en servidor. *Causa raíz:* el estado inicial lo creaba la librería de
> animación, que corre después de la hidratación, así que el navegador pinta primero el estado final.
> *Pista:* **el estado inicial va en el markup; la librería lo confirma con `fromTo`, nunca lo crea.**
> *Confianza:* `confirmed`.

El examen de admisión es una sola pregunta: **¿esto restringe una decisión futura?** Si no, es
descripción y se queda fuera. Es la parte que la gente se salta, y saltársela es como un `lore/` se
convierte en una carpeta que nadie lee.

## Dónde vive

El criterio que persiste va en `lore/`. El estado que avanza —la fase actual, el plan— va en
`FASES.md`, fuera. Mezclarlos es la forma más común de que un Lore se pudra: el estado se agita, y la
agitación entierra el criterio.

El criterio genérico vive **una sola vez**, en el área madre, y todos los proyectos lo heredan.
Corriges una Pista en un lugar y lo ve todo.

Y una pieza carga antes que todas las demás. El contrato de tu agente —`CLAUDE.md` o `AGENTS.md`— es
el único archivo que los dos hosts leen sin que nadie se lo pida, así que el kit le estampa un bloque
delimitado que apunta a dónde vive el Lore. Ese bloque es la razón por la que algo de esto llega a la
sesión: sin un ancla que cargue siempre primero, un `lore/` es una carpeta que el agente nunca abre.

## Qué no es

No es un README, no es un changelog, no es un documento de diseño. Esos describen. Lore restringe.

Y la mayor parte de lo que pasa no sobrevive. Eso es el diseño: un Lore vale lo que cambia en
decisiones futuras, nunca lo que guarda.

## Empezar

Instala el plugin y di **«lore»**. El kit hace brainstorming para construir — no te va a entregar un
menú de comandos.

Más largo: [uso](./USAGE_es.md) · [referencia](./REFERENCE_es.md) · [casos](./CASES_es.md)
