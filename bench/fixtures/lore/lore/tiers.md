# lore/tiers.md — Tiers de sitio (dificultad, alcance y precio)

> **Qué es esto.** El eje de dificultad de un encargo web. Sirve a la vez de contrato **hacia el
> cliente** (precio) y **hacia adentro** (qué se construye, qué fases corre, dónde termina).
> El tier se decide en **Fase 1** y se escribe en el `FASES.md` del proyecto.
>
> Tabla de precios vigente al **2026-07-12**. Los precios son estado y se revisan; **el criterio
> de clasificación es lo invariante**.

---

## Los tres tiers

### Tier 1 · Landing — $250

- **1 plantilla** de página (una sola, con sus secciones).
- **La marca la trae el cliente.** Paleta y tipografías salen de su selección en el muestrario
  (Fase 1.3). No se crea logo ni sistema de identidad.
- Contenido estático, entregado por el cliente.
- **Sin estado de servidor.** El formulario de contacto sale por servicio externo.
- Corre: Fase 1 ligera → Fase 2 → build.

### Tier 2 · Sitio — $800

*Referencia: `proyectos/enma` (6 rutas: home, servicios, proyectos, nosotros, blog, artículo).*

- **3 a 8 plantillas** únicas.
- **Identidad creada desde cero**: logo, isotipo, paleta, tipografías, moodboard.
- Contenido dinámico con rutas `[slug]` (blog o portafolio).
- Sigue **sin estado de servidor de usuario**.
- Corre las fases completas, incluida la **Fase 2.3 (moodboard)**.

### Tier 3 · SaaS — $1500

*Referencia: `proyectos/numerologia` (Introspection Solutions).*

- Todo lo del Tier 2, **más estado de servidor**: cuentas (auth), Postgres con RLS, pagos
  (Stripe), área privada / dashboard, contenido bloqueado.
- Aplica la **Variante SaaS** de `identidad.md` y `principios.md`.
- Golden Paths obligatorios.

---

## Catálogo de desbordes (precio de lista)

| Desborde | Precio |
|---|---|
| Plantilla de página adicional | $70 |
| Contenido dinámico / blog (si no estaba en el tier) | $150 |
| Identidad de marca desde cero (si un Tier 1 la pide) | $250 |
| Idioma adicional (i18n) | $150 |
| CMS para que el cliente cargue contenido solo | $200 |

### Fuera del tier: lo que no es web

Brochure, merch, isotipos para imprenta, sistema de íconos, papelería. Son piezas de **diseño
gráfico**: otro encargo, otro presupuesto. `enma` las contiene dentro de un presupuesto de sitio
(`merch/`, `brochure/`, `isotipos/`, `íconos/`); eso no se repite.

---

## Las cinco leyes

### 1. La puerta dura

**Estado de servidor = Tier 3, sin importar cuántas páginas tenga.** Una cuenta, un pago, o
contenido que hay que proteger: cualquiera de los tres cruza la puerta.

`numerologia` es **una sola ruta** y es el tier más caro. Esa es la prueba: el precio no sale del
número de páginas, sale de la **clase de riesgo**. Con estado de servidor hay dinero, hay datos de
usuario, hay superficie de seguridad, y el sitio ya no se puede validar solo mirándolo. Una landing
preciosa de una página es Tier 1; un SaaS feo de una página es Tier 3. **No se negocia hacia abajo.**

### 2. El tier se decide en Fase 1 y se escribe

Queda en el `FASES.md` del proyecto y en la columna `Tier` del registro del área. Un proyecto sin
tier declarado es un proyecto que se va a desbordar sin que nadie lo note.

### 3. El desborde se nombra cuando aparece, no cuando duele

En cuanto el cliente pide algo fuera del paquete, se dice el **precio de lista en ese momento** y
se registra en `FASES.md`. Trabajo absorbido en silencio es margen regalado. `enma`, con su `web`
**y** su `web2`, es la prueba de que pasa.

### 4. El tier limita el alcance, jamás el nivel

Un Tier 1 de $250 cumple `identidad.md` **entera**: los cinco principios innegociables, el piso de
accesibilidad de `principios.md`, los tres candados de `composicion.md`, cero *tells* de `copy.md`.

**Barato significa menos superficie, nunca peor oficio.** Una landing de una página mal hecha no
es un Tier 1: es un Tier 1 fallado.

### 5. Los precios son estado; el criterio es Lore

La tabla lleva fecha y se revisa. Lo que no cambia es **cómo se clasifica** un encargo.
