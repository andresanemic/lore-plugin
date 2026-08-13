# Identidad — Estándar de web premium (área `desarrollo-web`)

> Qué somos y cuál es el norte de calidad de **todo** sitio que construimos en esta área.
> Es el **piso, no el techo**. Todo lo nuevo se mide contra esto.
> La base aplica a cualquier sitio web. La **Variante SaaS** (al final) añade lo suyo encima,
> y solo se lee/siembra cuando el sitio tiene login + suscripción + área privada.

---

## Tipo de sitio base: **Web sin login**

Sitio público de marketing/contenido: landing, informativo, blog, portfolio.
Sin sesión, sin backend de usuario, sin pagos. La superficie es **la marca y la
propuesta de valor**. (Cuando el sitio necesita cuentas/pagos/área privada, se
vuelve una **SaaS web** → ver la **Variante SaaS** más abajo.)

---

## Los 5 principios innegociables

1. **Una propuesta de valor muy clara en el primer pantallazo.**
2. **Navegación minimalista, legible y consistente en desktop y mobile.**
3. **Tipografía moderna, altamente legible, con escala tipográfica coherente.**
4. **Motion con intención (guiar, revelar, reforzar), sin efectos gratuitos.**
5. **Footer funcional que refuerce confianza, arquitectura del sitio y acceso rápido a contenido clave.**

Todo lo de abajo es cómo se cumplen estos cinco. Si un cambio no sirve a uno de
ellos, sobra.

---

## Estándar premium destilado (checklist accionable)

> Destilado de referencias curadas (ver abajo), no de documentación oficial.
> Son señales, no dogmas: se aplican con criterio, no como receta.

### Propuesta de valor / hero
- [ ] En el primer viewport se entiende **qué es**, **para quién** y **por qué importa** — sin scroll.
- [ ] Un solo mensaje dominante; un solo CTA primario claro (el secundario, subordinado).
- [ ] Titular concreto y específico, no eslogan vacío. Nada de eyebrows sobre el título.
- [ ] Jerarquía visual real: el ojo aterriza en el titular, luego CTA, luego apoyo.

### Navegación (desktop + mobile)
- [ ] Pocos ítems, etiquetas legibles, orden estable entre páginas.
- [ ] Estado activo/hover evidente; el CTA de conversión se distingue del resto.
- [ ] Contraste garantizado sobre cualquier sección (navbar transparente → contraste por sección, no por umbral de scroll).
- [ ] En móvil: patrón claro (menú accesible), sin trampas de tap, áreas táctiles cómodas.

### Dirección estética (una sola, comprometida)
- [ ] El sitio tiene **una** dirección conceptual explícita y **una cosa memorable**. Si nadie puede nombrar qué se recuerda del sitio, no hay dirección: hay decoración.
- [ ] La dirección se ejecuta con precisión, en cualquier extremo. Minimalismo refinado y maximalismo funcionan igual de bien; lo que no funciona es la timidez (paletas repartidas en partes iguales, motion "por si acaso").
- [ ] **La complejidad del código sigue a la dirección**, no al revés: una dirección maximalista pide código elaborado y efectos; una refinada pide restricción y precisión milimétrica en espaciado y tipografía. Cargar de efectos un diseño sobrio es tan fallo como un maximalismo tibio.
- [ ] Fondos con atmósfera y profundidad (grano, gradiente mesh, textura, capas), no color plano por defecto — cuando la dirección lo pide.

### Tipografía y escala
- [ ] Escala tipográfica coherente (una razón, no tamaños al azar); `clamp()` para fluidez.
- [ ] Máxima legibilidad: medida de línea (60-75 caracteres), interlineado (1.5-1.75 en cuerpo) y contraste cuidados.
- [ ] Display para titulares con carácter; cuerpo neutro y legible. **Nada de mono como cuerpo.**
- [ ] Pares de fuente con contraste de rol (título vs cuerpo), no dos fuentes que compiten.
- [ ] **Fuentes con carácter, elegidas.** Lista negra: Inter, Roboto, Arial, Helvetica, fuentes de sistema — y también los "defaults de diseñador" (Space Grotesk y compañía) cuando llegan por inercia y no por dirección. Una fuente entra porque la dirección la pide, no porque es la que siempre sale.

### Motion con intención
- [ ] Cada animación **guía, revela o refuerza** — nunca decora por decorar.
- [ ] Reveal al entrar en viewport + microinteracción hover en todo elemento interactivo.
- [ ] Respeta `prefers-reduced-motion` **siempre**.
- [ ] Coreografía completa en Hero y CTA/Footer; el resto, más sobrio. Motion variado, no un solo truco repetido.

### Footer funcional
- [ ] Refuerza confianza (marca, legal, contacto) y da el mapa del sitio.
- [ ] Acceso rápido al contenido clave y a la conversión (no es un basurero de links).
- [ ] Cierra la página con intención de diseño, no como pie por defecto.

---

## Referencias estéticas (anclas, no reglas)

Curaduría para calibrar el listón; se miran para inspirar el nivel, no para copiar
ni como "best practices oficiales":

- https://www.awwwards.com/
- https://www.awwwards.com/inspiration/landing-page
- https://www.awwwards.com/awwwards/collections/the-best-of-navigation/
- https://www.awwwards.com/websites/footer-design/
- https://www.siteinspire.com/
- Behance — búsquedas de "landing page" (×3, para amplitud de estilos)
- https://www.lapa.ninja/
- https://www.awwwards.com/inspiration/webflow-landing-page-template-clixr

---

## Qué NO construimos

- Landing corporativa genérica sin punto de vista.
- Efectos gratuitos / motion sin propósito.
- Eyebrows sobre los títulos. Mono como cuerpo de texto.
- Hero sin propuesta de valor clara en el primer pantallazo.
- Navegación inconsistente entre desktop y mobile.
- Footer-basurero (pie por defecto sin jerarquía ni confianza).

### Estética de IA por defecto (la firma que nos delata)

Lo que sale solo cuando nadie decidió nada. Si aparece, es señal de que falta dirección:

- **Fuentes por defecto**: Inter, Roboto, Arial, system-ui.
- **El gradiente violeta sobre blanco** (y su familia: pasteles saturados sin razón, glow morado detrás de todo).
- **Emoji como iconos** (🚀 ⚙️ ✨). Los iconos son SVG de una sola familia, trazo fino y tamaños tokenizados.
- Layouts predecibles: tres cards iguales, todo centrado, cero asimetría, cero quiebre de grilla.
- Paletas repartidas en partes iguales (nada domina, nada acentúa).
- Negro puro (`#000000`) y blanco puro (`#ffffff`): matan la profundidad. Off-black y off-white.

**La paleta "premium" por defecto — la que más nos toca.** Ante cualquier encargo de marca
premium (artesanal, bienestar, gastronomía, lujo, DTC de hogar) el reflejo automático de un
modelo es **crema/beige + latón/arcilla/ocre + espresso**: fondos `#f5f1ea`, `#faf7f1`, `#efeae0`;
acentos `#b08947`, `#b6553a`, `#9a2436`; texto `#1a1714`. Es *nuestra* familia Warm Atelier
(mocha `#A47864` + parchment). La consecuencia no es que esté prohibida: es que **si esa paleta
no vino del cliente, vino del reflejo**, y entonces la marca se vuelve invisible porque se ve
igual que todas las demás. La prueba está en Fase 1: si la paleta salió de la selección del
cliente en el muestrario, es legítima y se defiende. Si la elegimos nosotros "porque es un
encargo cálido", es la firma. Alternativas para rotar: lujo frío (plata + cromo + humo),
bosque (verde profundo + hueso + ámbar), negro y tabaco, cobalto + crema, terracota + pizarra,
monocromo + un acento saturado.

**La disciplina del serif.** "Es una marca creativa / premium, entonces serif" es el reflejo más
testeado y más delator. El serif entra **solo** si el encargo lo nombra, o si la familia estética
es genuinamente editorial / lujo / patrimonio **y se puede argumentar por qué ese serif y esa
marca**. Para todo lo demás (agencia, estudio, portfolio, consumo premium) el default es un
**sans display con carácter**. Y dentro de un titular, para enfatizar una palabra: **cursiva o
negrita de la misma familia**, jamás inyectar una palabra en serif dentro de un titular sans.
Mezclar familias para "dar interés" es de aficionado.

---
---

# Variante SaaS — Estándar premium para producto por suscripción

> Lo que **añade** un sitio con backend sobre el estándar base de arriba. Se lee
> **después** de la identidad base, no en su lugar. Solo aplica si el sitio es una SaaS web.

## Tipo de sitio: **SaaS web**

Sobre la Web sin login se suma: **login, suscripción, área privada y contenido
gated**. La superficie ya no es solo la marca — es un producto: hay que convertir,
cobrar y retener sin traicionar el nivel premium de la landing.

## Principios adicionales

1. **El paywall se siente como valor, no como muro hostil.** El bloqueo comunica lo que se gana al suscribir, no castiga por no hacerlo.
2. **Confianza y seguridad visibles.** Pago, datos y estados de cuenta se muestran claros; el usuario siempre sabe qué pagó, hasta cuándo y qué puede hacer.
3. **Onboarding y estados legibles.** Registro sin fricción; estados de suscripción (activa / cancelada / vencida / en prueba) siempre claros y accionables.

## Estándar premium para superficies SaaS

### Pricing
- [ ] Planes comparables de un vistazo (mensual / anual, con el ahorro anual explícito).
- [ ] Un plan recomendado destacado sin ocultar los demás. CTA por plan inequívoco.
- [ ] Qué incluye cada nivel, en lenguaje de beneficio, no de features sueltas.

### Auth (registro / login)
- [ ] Fricción mínima: pedir lo indispensable, errores claros, recuperación simple.
- [ ] El nivel visual de la landing se mantiene — auth no es una pantalla "de sistema" fea.

### Dashboard / área privada
- [ ] Orientación inmediata: qué puede hacer el usuario ahora y qué desbloquea el premium.
- [ ] Estado de la cuenta y de la suscripción siempre a mano.

### PremiumGate (contenido bloqueado)
- [ ] Muestra el valor detrás del muro y un CTA claro a upgrade. Nunca dark pattern.
- [ ] La verificación de acceso ya viene resuelta del servidor (ver **Variante SaaS** en `principios.md`).

## Qué NO construimos (SaaS)

- **Dark patterns**: cancelación laberíntica, cobros sorpresa, opt-outs escondidos.
- **Bloqueo de acceso en el cliente** (la verificación real es del servidor, siempre).
- Fricción innecesaria en registro o en la gestión del plan.
- Pantallas de producto (auth, dashboard, pricing) por debajo del nivel de la landing.
