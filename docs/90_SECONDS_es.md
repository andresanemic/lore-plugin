# Lore en 90 segundos

> [← Volver al README](../README.md) · [English version](./90_SECONDS_en.md)

## El problema

Resuelves algo difícil con IA y la semana siguiente vuelves a explicarlo en un chat nuevo. La IA no
empeoró: le falta la lección anterior. Acumular notas no ayuda si no dicen qué debe cambiar en una
decisión futura. Una nota puede describir lo que pasó; un criterio conserva la lección que cambia lo
que harás después. Lore guarda esa lección, no la conversación completa.

## El mecanismo

Tres movimientos. El del medio es deliberado: expresas una lección, la apruebas y la escribes como criterio:

```text
experiencia (una fricción vivida)  →  destilación (un paso explícito, con puerta)  →  criterio (lore/)
```

La destilación vuelve una lección una regla. Nada entra solo: expresas la lección, revisas el cambio
y lo apruebas.

## Qué sale

Una **Pista Invariante** — `Contexto → Causa raíz → Pista → Confianza`. Una real:

> **Los elementos parpadean antes de que arranque la animación.** *Contexto:* animaciones de entrada
> en una página renderizada en servidor. *Causa raíz:* el estado inicial lo creaba la librería de
> animación, que corre después de la hidratación, así que el navegador pinta primero el estado final.
> *Pista:* **el estado inicial va en el markup; la librería lo confirma con `fromTo`, nunca lo crea.**
> *Confianza:* `confirmed`.

La Pista debe servir más allá del error original: conserva el contexto necesario para aplicar la regla, no el relato completo del incidente.

Conserva una lección solo si restringe una decisión futura. Si no, es descripción, no Lore. El
contexto ayuda a reconocer cuándo aplica la Pista; la confianza indica cuánto se ha comprobado.

## Dónde vive

El criterio persistente va en `lore/`; el estado que cambia, como la fase o el plan, va en `FASES.md`.
Separarlos evita que los cambios de estado entierren el criterio estable.

El criterio compartido vive una sola vez en el Área madre y sus proyectos lo heredan. El contrato del
agente —`CLAUDE.md` o `AGENTS.md`— es un puntero breve a los archivos que el host debe cargar al
abrir la sesión, así no tienes que copiar el criterio en cada conversación.

El criterio también puede quedar obsoleto. Revísalo y retira las reglas cuya validez terminó.

## Qué no es

Usa el README, changelog o documento de diseño para explicar el proyecto; usa Lore para reglas que
guíen decisiones futuras.

## Y ahora también ejecuta

Lore Plugin mantiene el criterio del proyecto disponible entre sesiones y puede ejecutar operaciones
acotadas con Vespi. Puedes empezar sin saber TDD ni spec-kit; la [referencia técnica](./REFERENCE_es.md)
explica las herramientas.

## Empezar

Instala el plugin y escribe **«quiero comenzar a usar Lore Plugin, ayúdame»**. El kit hace brainstorming para construir — no te va a entregar un
menú de comandos.

Más largo: [documento técnico](./REFERENCE_es.md) · [casos](./CASES_es.md)
