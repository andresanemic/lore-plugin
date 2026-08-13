# lore/stripe.md — Suscripciones, webhooks, portal (Stripe + App Router)

> Pistas históricas / patrones probados, NO fuente de verdad. Leads a validar.
> ⚠ Validar contra código actual antes de actuar.
> Seed inicial: patrones documentados del stack. Confianza `conjetura` hasta
> confirmarlos en este proyecto; subir a `confirmado` cuando pasen por un caso real.

---

### [stripe] El webhook necesita el body CRUDO — no parsear JSON antes de verificar firma

- Contexto: `/app/api/stripe/webhook/route.ts` con `stripe.webhooks.constructEvent(body, sig, secret)`.
- Causa probable: la verificación de firma calcula un HMAC sobre los **bytes exactos** recibidos. Si Next parsea el JSON y lo re-serializa, los bytes cambian y la firma nunca cuadra (400 en todo evento legítimo).
- Pista: en un Route Handler del App Router, leer el cuerpo con `await req.text()` (string crudo) y pasar ese string a `constructEvent`. La firma viene en el header `stripe-signature`. No usar `await req.json()` en esta ruta. (El App Router no bufferiza como el Pages Router, así que no hace falta `bodyParser: false`, pero sí leer `.text()` una sola vez.)
- Confianza: conjetura
- ⚠ Validar contra código actual.

---

### [stripe] Verificar firma SIEMPRE — Golden Path: sin firma válida → 400

- Contexto: regla crítica del CLAUDE.md y de los Golden Paths.
- Causa probable: sin verificación, cualquiera puede POSTear un evento falso a la ruta pública del webhook y otorgarse premium.
- Pista: `constructEvent` va en un `try/catch`; si lanza, responder `400` inmediatamente sin tocar la base. Solo después de verificar se procesa el `event.type`. Nunca un `catch` que "deje pasar".
- Confianza: conjetura
- ⚠ Validar contra código actual.

---

### [stripe] Mapear `customer` ↔ usuario: guardar `stripe_customer_id` en Checkout

- Contexto: el webhook recibe eventos con `customer: cus_xxx`, pero necesita saber a qué `user_id` de Supabase pertenece para el upsert en `subscriptions`.
- Causa probable: Stripe no conoce el `user_id`; hay que tender el puente al crear el Checkout.
- Pista: al crear la Checkout Session (server-side), pasar `client_reference_id: user.id` y/o `metadata: { user_id }`, y reutilizar el `stripe_customer_id` si el usuario ya tiene uno (buscar en `subscriptions`/`profiles` antes de crear un customer nuevo, para no duplicar). El webhook lee ese id para el upsert. Guardar `stripe_customer_id` en la primera suscripción.
- Confianza: conjetura
- ⚠ Validar contra código actual.

---

### [stripe] Los eventos pueden llegar duplicados / fuera de orden → upsert idempotente

- Contexto: `subscriptions` sincronizada desde el webhook. Stripe reintenta entregas y no garantiza orden.
- Causa probable: procesar el mismo evento dos veces, o aplicar un `updated` viejo después de uno nuevo, deja el `status` inconsistente.
- Pista: hacer **upsert** por `stripe_subscription_id` (unique), no insert. Tratar el estado como "estado actual de la suscripción" (leer `subscription.status`, `current_period_end`, `cancel_at_period_end` del objeto del evento) en vez de mutaciones incrementales. Responder `200` rápido; el trabajo pesado que no afecte la respuesta puede diferirse.
- Confianza: conjetura
- ⚠ Validar contra código actual.

---

### [stripe] Cancelar ≠ perder acceso: respetar `cancel_at_period_end` / `current_period_end`

- Contexto: Golden Path — suscripción `canceled` mantiene acceso hasta el fin del período pagado.
- Causa probable: marcar `isPremium = false` apenas el usuario cancela le quita algo que ya pagó.
- Pista: `isPremium` = `status in ('active','trialing')` **o** (`cancel_at_period_end` y `current_period_end > now()`). La verdad de "¿tiene acceso?" vive en `lib/access.ts`, resuelta en servidor con los campos que sincroniza el webhook. El portal de cliente de Stripe (`/api/stripe/portal`) es quien gestiona cancelar/cambiar plan.
- Confianza: conjetura
- ⚠ Validar contra código actual.

---

### [stripe] Precios y claves desde variables de entorno — nunca hardcodear `price_xxx`

- Contexto: planes mensual/anual (`STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`) y claves.
- Causa probable: los IDs de precio difieren entre modo test y live; hardcodearlos rompe el paso a producción y filtra claves si se commitea.
- Pista: leer `price` desde `process.env`. Si falta una var, lanzar error descriptivo al arrancar (regla del CLAUDE.md), no fallar silenciosamente en el Checkout. En dev usar claves `pk_test_`/`sk_test_`; recrear precios y webhook al pasar a live (Fase 4.2).
- Confianza: conjetura
- ⚠ Validar contra código actual.
