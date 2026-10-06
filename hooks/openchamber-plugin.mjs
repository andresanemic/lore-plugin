// Adaptador de OpenChamber — el hook del kit en el cuarto host.
//
// OpenChamber embebe OpenCode v2.0.22, cuya API de plugins es V2:
//   ctx.event.subscribe()          → stream /api/event (session.created, etc.)
//   ctx.session.hook("prompt")     → turno humano (equivalente a chat.message)
//   ctx.session.hook("context")    → inyección al prompt (equivalente a
//                                    experimental.chat.system.transform)
//   ctx.tool.hook("execute.before"/"execute.after") → guardia de escrituras
//
// El núcleo (lore-turno, lore-state, lore-guard, opencode-input) se importa
// sin cambios: operationEntry es puro y el vocabulario write/edit/apply_patch
// de OpenCode v1 es el de v2.
//
// LO QUE ESTE ARCHIVO NO HACE (mismos techos que el adaptador V1):
//   · No copia el payload de otro host.
//   · No falla cerrado: fails open on any error.
//   · No repite la línea federada de session_start.

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
import { inyeccion, nivel, semillaDePuerta } from "./lore-turno.mjs";
import { alVocabularioDelKit } from "./opencode-input.mjs";

const MAX_DATO = 200;
const comoDato = (valor) => String(valor ?? "")
  .replace(/[\r\n\t\v\f\0]+/g, " ")
  // eslint-disable-next-line no-control-regexp -- quitar los controles es el punto
  .replace(/[\u0000-\u001f\u007f-\u009f]/g, "")
  .replace(/\s{2,}/g, " ")
  .trim()
  .slice(0, MAX_DATO);

const listaDeDatos = (valores) => (Array.isArray(valores) ? valores : []).map(comoDato).filter(Boolean).join(", ");
const motivoDe = (error) => comoDato(error?.message ?? error);

export default {
  id: "lore-plugin-openchamber",

  async setup(ctx) {
    const raiz = process.cwd();

    // Apertura: ancla jurisdicción y fija baseline por sesión
    let apertura = null;
    try {
      const estado = snapshot(raiz);
      if (estado.fileCount > 0) {
        apertura = { root: raiz, estado };
        if (readReceipt(raiz) === null) writeReceipt(raiz, estado);
      }
    } catch { /* árbol de solo lectura: abierto */ }

    let veredictoSemilla = null;
    try {
      veredictoSemilla = semillaDePuerta({ raiz });
    } catch { /* el techo no se cambia */ }

    const pendiente = [];
    const encolar = (texto) => {
      if (typeof texto !== "string" || texto === "") return;
      pendiente.push(texto);
    };

    if (veredictoSemilla) encolar(veredictoSemilla);

    function ancla(sessionID) {
      if (typeof sessionID !== "string" || sessionID === "") return raiz;
      const registrada = readSessionRoot(sessionID);
      if (!registrada) writeSessionRoot(sessionID, raiz);
      return registrada ?? raiz;
    }

    function armar(sessionID, raizSesion) {
      if (typeof sessionID !== "string" || sessionID === "") return;
      if (readSessionBaseline(sessionID, raizSesion)) return;
      let estado = null;
      try { estado = snapshot(raizSesion); } catch { estado = null; }
      if (estado && estado.fileCount > 0) writeSessionBaseline(sessionID, raizSesion, estado);
    }

    const turnosHumanos = new Map();

    // 1. Apertura de sesión
    ctx.event.subscribe((carga) => {
      try {
        const ev = carga && carga.event;
        if (!ev || ev.type !== "session.created") return;
        const id = ev.properties && ev.properties.info && ev.properties.info.id;
        if (typeof id !== "string" || id === "") return;
        const raizSesion = ancla(id);
        armar(id, raizSesion);
      } catch { /* fail open */ }
    });

    // 2. Turno humano: contar turnos para nextTurn
    ctx.session.hook("prompt", (input) => {
      try {
        const sessionID = input && input.sessionID;
        if (!sessionID) return;
        const previous = turnosHumanos.get(sessionID);
        if (input && input.messageID && previous && previous.messageID === input.messageID) return;
        const raizSesion = ancla(sessionID);
        const turno = nextTurn(sessionID, raizSesion);
        turnosHumanos.set(sessionID, { turno, messageID: input && input.messageID });
      } catch { /* fail open */ }
    });

    // 3. Inyección por turno + semilla de puerta al prompt
    ctx.session.hook("context", (input, output) => {
      try {
        const sessionID = input && input.sessionID;
        const raizSesion = (typeof sessionID === "string" ? readSessionRoot(sessionID) : null) ?? raiz;
        const turno = turnosHumanos.get(sessionID)?.turno;
        if (!turno) return;
        const r = inyeccion({ raiz: raizSesion, turno: turno === 1 ? null : turno, nivel: nivel() });
        if (r.inyectar && r.texto) {
          if (output && Array.isArray(output.system)) {
            output.system.push(r.texto);
          } else {
            process.stderr.write(`[Lore Plugin] ${r.texto}\n`);
          }
        }
      } catch (error) {
        process.stderr.write(`[Lore Plugin] hook fallo: ${motivoDe(error)}\n`);
      }
    });

    // 4. Guardia antes de ejecutar herramienta
    ctx.tool.hook("execute.before", (input, output) => {
      let carga, jurisdiccion;
      try {
        const sessionID = input && input.sessionID;
        jurisdiccion = ancla(sessionID);
        armar(sessionID, jurisdiccion);
        carga = alVocabularioDelKit(input && input.tool, output && output.args);
      } catch { return; }
      if (!carga) return;
      let bloquea = null;
      let desconocidos = [];
      try {
        bloquea = jurisdictionBlock(jurisdiccion, carga.tool, carga.input);
        if (!bloquea) desconocidos = unknownWrites(jurisdiccion, carga.tool, carga.input);
      } catch { return; }
      if (bloquea) return;
      if (desconocidos.length === 0) return;
      anotarDesconocidos(jurisdiccion, carga.tool, desconocidos);
      encolar(`Lore Plugin: escritura fuera de un árbol con Lore, permitida y anotada: ${listaDeDatos(desconocidos)}`);
    });

    // 5. Evaluación después de ejecutar herramienta
    ctx.tool.hook("execute.after", (input) => {
      try {
        const sessionID = input && input.sessionID;
        const jurisdiccion = readSessionRoot(sessionID) ?? raiz;
        const actual = snapshot(jurisdiccion);
        if (actual.fileCount === 0) return;
        let base = readSessionBaseline(sessionID, jurisdiccion);
        if (!base) {
          writeSessionBaseline(sessionID, jurisdiccion, apertura && apertura.root === jurisdiccion ? apertura.estado : actual);
          return;
        }
        if (!loreDeparted(base, actual)) return;
        let registrado = readReceipt(jurisdiccion);
        if (registrado === null) {
          const baseRecibo = base ?? (apertura && apertura.root === jurisdiccion ? apertura.estado : null);
          if (!baseRecibo) { writeReceipt(jurisdiccion, actual); return; }
          try { registrado = writeReceipt(jurisdiccion, baseRecibo); } catch { registrado = { version: 2, ...baseRecibo }; }
        }
        const resultado = evaluateState(actual, registrado);
        if (!resultado.pendingLore && !resultado.requiresApproval) {
          if (registrado.version === 1) writeReceipt(jurisdiccion, actual);
          return;
        }
        encolar(formatIntervention(resultado));
      } catch { /* fail open */ }
    });
  },
};
