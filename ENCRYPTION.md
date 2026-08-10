# Lore Plugin – Encryption (experimental)

`create-bot` can seal a bot's criteria so it travels encrypted. It is **off by default** and
**recommended for testing only**: a bot without encryption is complete, and for criteria that
matters, a private repository is today's serious answer.

## The law: encrypt in distribution, never at consultation

Payloads travel encrypted and are decrypted once on clone; at rest they are plain Markdown.
Encrypting where the agent consults does not forbid reading, it makes reading **expensive**, and
what is expensive stops being consulted.

## How it works

- AES-256-GCM with a scrypt-derived key, using only the Node stdlib, so there is nothing to install.
- The passphrase is read from *stdin*, never pasted into the chat.
- The `.gitignore` follows the choice: with encryption the plaintext is excluded; without it the
  criteria **must** be committed, or the repository travels empty and the bot is useless to whoever
  installs it.
- If `canon/` is missing but `canon.enc` exists, the canon is encrypted and not yet unlocked. The
  bot says so instead of working without its criteria.

## What it does not protect

> [!CAUTION]
> It has **not been audited**, has no key rotation and no revocation. It protects the repository and
> the transport, **not** against someone holding the passphrase, and it does not cover what an AI
> tool does with the text once loaded into its context.

## Credit

The question — *what protects a Lore that has to be shared?* — was opened by **Mantra**, by
[LonelyAchemist](https://github.com/lonelyachemist-arch), which encrypted the Lore at rest. The
answer here is inverted, and the code is our own.

---

# Plugin Lore – Cifrado (experimental)

`create-bot` puede sellar el criterio de un bot para que viaje cifrado. Está **apagado por defecto**
y **se recomienda solo para pruebas**: un bot sin cifrado está completo, y para criterio que importa,
un repositorio privado es hoy la respuesta seria.

## La ley: se cifra en distribución, nunca en consulta

Las cargas viajan cifradas y se descifran una vez al clonar; en reposo son Markdown plano. Cifrar
donde el agente consulta no prohíbe leer, **encarece** leer, y lo caro deja de consultarse.

## Cómo funciona

- AES-256-GCM con clave derivada por scrypt, solo con la stdlib de Node, así que no hay nada que instalar.
- La passphrase se pide por *stdin*, nunca pegada en el chat.
- El `.gitignore` sigue la decisión: con cifrado se excluye el texto plano; sin cifrado el criterio
  **tiene** que commitearse, o el repositorio viaja vacío y el bot no le sirve a quien lo instale.
- Si falta `canon/` pero existe `canon.enc`, el canon está cifrado y todavía sin abrir. El bot lo
  dice en vez de trabajar sin su criterio.

## Qué no protege

> [!CAUTION]
> **No ha sido auditado**, no tiene rotación de claves ni revocación. Protege el repositorio y el
> tránsito, **no** contra quien tiene la passphrase, y no cubre lo que una herramienta de IA hace con
> el texto una vez cargado en su contexto.

## Crédito

La pregunta —*¿qué protege a un Lore que tiene que compartirse?*— la abrió **Mantra**, de
[LonelyAchemist](https://github.com/lonelyachemist-arch), que cifraba el Lore en reposo. La respuesta
acá está invertida, y el código es propio.
