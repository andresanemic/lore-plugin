// Adaptador de OpenCode — el hook del kit en el tercer host.
//
// OpenCode v1.18.33 no tiene el archivo de hooks de Claude: se llega a lo mismo con un plugin
// local. Tres eventos del kit y sus equivalentes reales, leídos del binario instalado, no de
// la documentación (la adenda L5 lo exige: la rama v2 tiene otra API y no es la que corre acá).
//
//   kit / codex-guard.mjs        OpenCode v1.18.33
//   ─────────────────────────    ────────────────────────────────────────────────
//   session_start                el cuerpo de la fábrica del plugin: corre una vez
//                                al cargar, que es lo más cerca que hay de una apertura.
//                                No existe hook `session.start` en la v1.
//   pre_tool_use                 `tool.execute.before`; el bloqueo es `throw`: el cuerpo
//                                de la herramienta no llega a ejecutarse y la parte queda
//                                en estado error con ese mensaje. Equivale al
//                                `permissionDecision: "deny"` de Claude.
//   post_tool_use                `tool.execute.after` para decidir, y
//                                `experimental.chat.system.transform` para que el texto
//                                llegue al modelo en la petición siguiente. No hay canal
//                                de `additionalContext` en la v1.
//
// LO QUE ESTE ARCHIVO NO HACE, Y POR QUÉ:
//
//   · No copia el payload de otro host. Traduce el vocabulario de OpenCode (`write`/`edit`
//     con `filePath`, `apply_patch` con `patchText`) al que el núcleo ya entiende
//     (`Write`/`Edit` con `file_path`, `apply_patch` con `command`). Sin ese mapa,
//     `structuredWritePaths` devuelve `[]` para toda escritura de OpenCode y la guardia
//     entera pasa en silencio —el caso ciego que abre L5.
//   · No falla cerrado. El encabezado de `codex-guard.mjs` dice "Fails open on any error"
//     y el acuerdo RC4 no nombra ningún punto donde la guardia cierre; cerrar solo en
//     OpenCode haría que el mismo host bloqueara escrituras que Claude y Codex dejan pasar.
//   · No repite la línea federada de `session_start`. Esa comprobación es estática y OpenCode
//     v1 no tiene canal de apertura para ella; empujarla al prompt sería un impuesto permanente
//     por una comprobación que se hace una vez. Plan B declarado (C3): `lore-plugin mycelium
//     federated`, la misma comprobación, a demanda, en cualquier host. Lo que SÍ hace es abrir
//     cada sesión por `session.created`, que no es la línea federada sino el anclaje del
//     `session_start` de los otros dos hosts.
//
// Exporta UNA sola función. El runtime de OpenCode recorre `Object.values(módulo)` y tira
// `TypeError("Plugin export is not a function")` ante cualquier export que no sea función o
// un objeto con `server`: un `export const VERSION` tumba el plugin entero.

import {
  anotarDesconocidos,
  evaluateState,
  formatIntervention,
  jurisdictionBlock,
  unknownWrites,
} from "./lore-guard.mjs";
import {
  loreDeparted,
  nextTurn,
  readReceipt,
  readSessionBaseline,
  readSessionRoot,
  snapshot,
  writeReceipt,
  writeSessionBaseline,
  writeSessionRoot,
} from "./lore-state.mjs";
import { inyeccion, nivel } from "./lore-turno.mjs";

// Vocabulario de OpenCode v1 -> el que `hooks/lore-guard.mjs` ya sabe. `de` lista los campos
// que el host puede usar para el destino: v1 dice `filePath`, y la pila v2 del mismo binario
// dice `path`. Aceptar los dos evita que un cambio de generación abra un agujero silencioso.
const HERRAMIENTAS = {
  write: { nombre: "Write", campo: "file_path", de: ["filePath", "path"] },
  edit: { nombre: "Edit", campo: "file_path", de: ["filePath", "path"] },
  apply_patch: { nombre: "apply_patch", campo: "command", de: ["patchText"] },
};

function alVocabularioDelKit(tool, args) {
  const regla = HERRAMIENTAS[tool];
  if (!regla || !args || typeof args !== "object") return null;
  for (const campo of regla.de) {
    const valor = args[campo];
    if (typeof valor === "string" && valor !== "") {
      return { tool: regla.nombre, input: { [regla.campo]: valor } };
    }
  }
  return null;
}


export const LorePlugin = async ({ directory, worktree } = {}) => {
  const raiz = typeof directory === "string" && directory ? directory : process.cwd();

  // SessionStart: la fábrica del plugin es lo más cerca de una apertura que la v1 ofrece.
  // Se fija en silencio y no se evalúa nada — nadie revisa si algo está roto en el primer
  // segundo de una sesión, se empieza a trabajar.
  let apertura = null;
  try {
    const estado = snapshot(raiz);
    if (estado.fileCount > 0) {
      apertura = { root: raiz, estado };
      if (readReceipt(raiz) === null) writeReceipt(raiz, estado);
    }
  } catch {
    /* árbol de solo lectura: abierto */
  }

  // Una línea, una vez. El aviso de lo desconocido y la intervención del Lore no tienen
  // canal propio en la v1, y el prompt es el que el modelo lee de verdad.
  let pendiente = null;
  const encolar = (texto) => {
    if (typeof texto !== "string" || texto === "") return;
    pendiente = pendiente === null ? texto : `${pendiente}\n${texto}`;
  };

  // La jurisdicción se ancla donde abrió la sesión, no en el cwd: en OpenCode el directorio
  // de instancia es el que se le pasó al host. Sin session.start se learns en el primer
  // evento de la sesión, que llega con su sessionID.
  function ancla(sessionID) {
    if (typeof sessionID !== "string" || sessionID === "") return raiz;
    const registrada = readSessionRoot(sessionID);
    if (!registrada) writeSessionRoot(sessionID, raiz);
    return registrada ?? raiz;
  }

  function armar(sessionID, raizSesion) {
    if (typeof sessionID !== "string" || sessionID === "") return;
    if (readSessionBaseline(sessionID, raizSesion)) return;
    // El estado se toma AQUÍ, en el momento de la apertura, y no del snapshot de la carga del
    // host: entre que el host cargó y que esta sesión abrió, otro dueño puede haber escrito.
    // Copiar el de la carga metería ese cambio del lado de la sesión, y el kit lo contaría como
    // suyo — justo lo que la postergación de `PostToolUse` existe para que no pase.
    let estado = null;
    try {
      estado = snapshot(raizSesion);
    } catch {
      estado = apertura && apertura.root === raizSesion ? apertura.estado : null;
    }
    if (estado && estado.fileCount > 0) writeSessionBaseline(sessionID, raizSesion, estado);
  }

  const turnosHumanos = new Map();

  return {
    "chat.message"(input, output) {
      try {
        const sessionID = input?.sessionID;
        if (!sessionID || output?.message?.role !== "user") return;
        const previous = turnosHumanos.get(sessionID);
        if (input?.messageID && previous?.messageID === input.messageID) return;
        const raizSesion = ancla(sessionID);
        const turno = nextTurn(sessionID, raizSesion);
        turnosHumanos.set(sessionID, { turno, messageID: input?.messageID });
      } catch {}
    },
    // Apertura de una sesión en un host que ya estaba cargado. La v1 no tiene hook
    // `session.start` — eso sí es cierto — pero el bus publica `session.created` y el runtime lo
    // entrega a `event` en cada plugin del directorio de la instancia. Es la única apertura POR
    // SESIÓN que hay: el cuerpo de la fábrica corre una vez, al cargar, y alcanza para la
    // primera. Sin esto, la segunda sesión de un mismo proceso no tendría apertura en ninguna
    // parte, y su base se fijaría en el primer evento de herramienta, ya con dentro cualquier
    // cambio de otro dueño — el desfase quedaría tragado y en silencio.
    event(carga) {
      try {
        const ev = carga && carga.event;
        if (!ev || ev.type !== "session.created") return;
        const id = ev.properties && ev.properties.info && ev.properties.info.id;
        if (typeof id !== "string" || id === "") return;
        const raizSesion = ancla(id);
        armar(id, raizSesion);
      } catch {
        // El bus es del host y el runtime llama a `event` sin try: un manejador que revienta
        // se lleva por delante el bus entero, que es la parte compartida. Fallo abierto, siempre.
      }
    },

    "tool.execute.before"(input, output) {
      let carga;
      let jurisdiccion;
      try {
        const sessionID = input && input.sessionID;
        jurisdiccion = ancla(sessionID);
        armar(sessionID, jurisdiccion);
        carga = alVocabularioDelKit(input && input.tool, output && output.args);
      } catch {
        return;
      }
      if (!carga) return;

      let bloquea = null;
      let desconocidos = [];
      try {
        bloquea = jurisdictionBlock(jurisdiccion, carga.tool, carga.input);
        if (!bloquea) desconocidos = unknownWrites(jurisdiccion, carga.tool, carga.input);
      } catch {
        // Un payload que el núcleo no sabe leer, o un disco que no responde, deja pasar.
        // El bloqueo no vive dentro de este try: sale después, con su motivo a la vista.
        return;
      }

      if (bloquea) throw new Error(bloquea);
      if (desconocidos.length === 0) return;
      anotarDesconocidos(jurisdiccion, carga.tool, desconocidos);
      encolar(`Lore Plugin: escritura fuera de un árbol con Lore, permitida y anotada: ${desconocidos.join(", ")}`);
    },

    "tool.execute.after"(input) {
      try {
        const sessionID = input && input.sessionID;
        const jurisdiccion = readSessionRoot(sessionID) ?? raiz;
        const actual = snapshot(jurisdiccion);
        if (actual.fileCount === 0) return;

        // Postergación: sin base, el primer avistamiento la fija y no interviene. Con base,
        // solo evalúa cuando ESTA sesión se apartó de ella.
        let base = readSessionBaseline(sessionID, jurisdiccion);
        if (!base) {
          writeSessionBaseline(sessionID, jurisdiccion, apertura?.root === jurisdiccion ? apertura.estado : actual);
          return;
        }
        if (!loreDeparted(base, actual)) return;

        const registrado = readReceipt(jurisdiccion);
        if (registrado === null) {
          writeReceipt(jurisdiccion, actual);
          return;
        }
        const resultado = evaluateState(actual, registrado);
        if (!resultado.pendingLore && !resultado.requiresApproval) {
          if (registrado.version === 1) writeReceipt(jurisdiccion, actual);
          return;
        }
        encolar(formatIntervention(resultado));
      } catch {
        /* abierto: un guard que se cae no puede ser el que frena el trabajo */
      }
    },

    "experimental.chat.system.transform"(input, output) {
      if (!output || !Array.isArray(output.system)) return;
      const aviso = pendiente;
      pendiente = null;
      // El registro del turno viaja por el MISMO canal que el aviso de la guardia, y en la
      // misma petición: son las dos cosas que el sistema tiene que saber antes de que el
      // modelo responda, y separarlas costaría un disparo del hook por cada una.
      try {
        const sessionID = input && input.sessionID;
        const raizSesion = (typeof sessionID === "string" ? readSessionRoot(sessionID) : null) ?? raiz;
        // Solo chat.message cuenta a la persona. Las peticiones auxiliares y los ciclos
        // internos del modelo no crean turnos ni consumen la apertura.
        const turno = turnosHumanos.get(sessionID)?.turno;
        if (!turno) { if (aviso) output.system.push(aviso); return; }
        const r = inyeccion({
          raiz: raizSesion,
          turno: turno === 1 ? null : turno,
          nivel: nivel(),
        });
        if (r.inyectar && r.texto) output.system.push(r.texto);
      } catch {
        /* un disco que no responde deja pasar el turno: el techo es que nada se rompa */
      }
      if (aviso) output.system.push(aviso);
    },
  };
};
