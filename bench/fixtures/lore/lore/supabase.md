# lore/supabase.md — Auth, DB, RLS (Supabase + @supabase/ssr en App Router)

> Pistas históricas / patrones probados, NO fuente de verdad. Leads a validar.
> ⚠ Validar contra código actual antes de actuar.
> Seed inicial: patrones documentados del stack. Confianza `conjetura` hasta
> confirmarlos en este proyecto; subir a `confirmado` cuando pasen por un caso real.

---

### [supabase] Client vs Server: dos clientes distintos, nunca mezclar

- Contexto: App Router con `@supabase/ssr`. Hay un cliente para Client Components y otro para Server Components / API Routes.
- Causa probable: el cliente de navegador usa cookies del documento; el de servidor lee/escribe cookies vía la API de `cookies()` de Next. Importar el de servidor en `'use client'` (o al revés) rompe la sesión o filtra credenciales.
- Pista: `lib/supabase/client.ts` con `createBrowserClient` → **solo** en componentes `'use client'`. `lib/supabase/server.ts` con `createServerClient` (recibe el store de `cookies()`) → **solo** en Server Components, Route Handlers y `layout.tsx`. Nunca importar uno donde va el otro.
- Confianza: conjetura
- ⚠ Validar contra código actual.

---

### [supabase] `getUser()` en servidor, no `getSession()`, para decisiones de acceso

- Contexto: verificar en el servidor si hay usuario autenticado antes de renderizar área privada (`lib/access.ts`, `layout.tsx` del dashboard).
- Causa probable: `getSession()` lee la cookie sin revalidar — un atacante podría manipularla. `getUser()` hace un round-trip al Auth server de Supabase y devuelve un usuario verificado.
- Pista: para gating (redirect a `/login`, resolver rol/suscripción) usar siempre `const { data: { user } } = await supabase.auth.getUser()`. La regla del CLAUDE.md ("verificación siempre en servidor") depende de esto.
- Confianza: conjetura
- ⚠ Validar contra código actual.

---

### [supabase] Refrescar sesión en `middleware.ts` (cookies expiran entre requests)

- Contexto: sesiones server-side con cookies. Sin refresco, el token expira y el usuario "se desloguea" solo entre navegaciones.
- Causa probable: los Server Components no pueden **escribir** cookies (solo leerlas). El refresco del token debe ocurrir en un contexto que sí puede setear cookies: el middleware o un Route Handler.
- Pista: `middleware.ts` que crea el server client, llama `getUser()` y reescribe las cookies en la respuesta (patrón oficial `updateSession`). Sin este middleware, la sesión no persiste de forma fiable. El `matcher` debe excluir assets estáticos y `/_next`.
- Confianza: conjetura
- ⚠ Validar contra código actual.

---

### [supabase] RLS siempre activo; `service_role` solo en el servidor (webhook)

- Contexto: tablas `profiles`, `subscriptions`, `tools`, `calculations`. El webhook de Stripe necesita escribir en `subscriptions` saltándose las políticas del usuario.
- Causa probable: la `SUPABASE_SERVICE_ROLE_KEY` **ignora RLS** por completo. Si se expone al cliente (o se pone en una var `NEXT_PUBLIC_`), cualquiera puede leer/escribir toda la base.
- Pista: RLS `enable`d en toda tabla desde el minuto cero. La `service_role` key vive **solo** en variables sin prefijo `NEXT_PUBLIC_`, se usa **solo** en API Routes de servidor (el webhook upsert de `subscriptions`). El anon key + RLS cubre el resto. `subscriptions` no tiene policy de escritura para usuarios: solo el service_role escribe.
- Confianza: conjetura
- ⚠ Validar contra código actual.

---

### [supabase] `profiles` no se crea solo: trigger sobre `auth.users` o insert tras signUp

- Contexto: al registrarse, se espera una fila en `profiles` (con rol `registered`). Supabase solo crea el registro en `auth.users`.
- Causa probable: `profiles` es una tabla propia que extiende `auth.users`; nada la puebla automáticamente salvo que se configure.
- Pista: dos caminos: (a) trigger `on auth.users` `after insert` que hace `insert into profiles`; o (b) insertar en `profiles` desde el callback de registro en el servidor. Elegir uno y ser consistente, o el usuario queda autenticado pero sin perfil/rol y el gating falla.
- Confianza: conjetura
- ⚠ Validar contra código actual.
