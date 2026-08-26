# Lore Plugin – Encryption (experimental)

`create-bot` can seal a bot's criteria so it travels encrypted. It is **off by default** and
**recommended for testing only**: a bot without it is complete; for criteria that matters,
a private repository is today's serious answer.

## The law: encrypt in distribution, never at consultation

Payloads travel encrypted, decrypt on clone, rest as plain Markdown. Encrypting where the
agent consults does not forbid reading — it makes it **expensive**, and the expensive stops being
consulted.

## How it works

- AES-256-GCM, scrypt-derived key, Node stdlib only — nothing to install.
- The passphrase comes from *stdin*, never pasted in chat.
- The `.gitignore` follows the choice: encrypted excludes plaintext; without it the criteria
  **must** commit, or the repository travels empty, useless to whoever installs it.
- Missing `canon/` with `canon.enc` present means encrypted, not yet unlocked — the bot says so
  instead of working bare.

## What it does not protect

> **Not audited**: no key rotation, no revocation. It protects repository and transport, **not**
> against whoever holds the passphrase, nor what an AI tool does with the text once in its context.

## Credit

The question — *what protects a Lore that must be shared?* — was opened by **Mantra**,
by [LonelyAchemist](https://github.com/lonelyachemist-arch), which encrypted Lore at rest. The
answer here is inverted; the code is our own.

---

# Plugin Lore – Cifrado (experimental)

`create-bot` puede sellar el criterio de un bot para que viaje cifrado. Está **apagado por defecto**
y **se recomienda solo para pruebas**: un bot sin cifrado está completo; para criterio importante,
un repositorio privado es hoy la respuesta seria.

## La ley: se cifra en distribución, nunca en consulta

Las cargas viajan cifradas, se descifran al clonar y en reposo son Markdown plano. Cifrar
donde el agente consulta no prohíbe leer — la **encarece**, y lo caro deja de consultarse.

## Cómo funciona

- AES-256-GCM, clave por scrypt, solo stdlib de Node — nada que instalar.
- La passphrase viene por *stdin*, jamás pegada en el chat.
- El `.gitignore` sigue la decisión: cifrado excluye el texto plano; sin él el criterio
  **tiene** que commitearse, o el repositorio viaja vacío, inservible para quien lo instale.
- Falta `canon/` y existe `canon.enc`: canon cifrado, aún sin abrir — el bot lo dice, no trabaja
  trabajar sin su criterio.

## Qué no protege

> **No ha sido auditado**: sin rotación de claves ni revocación. Protege repositorio y tránsito,
> **no** contra quien tenga la passphrase, ni lo que una herramienta de IA haga con el texto ya en
> su contexto.

## Crédito

La pregunta —*¿qué protege a un Lore que debe compartirse?*— la abrió **Mantra**, de
[LonelyAchemist](https://github.com/lonelyachemist-arch), que cifraba el Lore en reposo. La respuesta
acá está invertida; el código es propio.
