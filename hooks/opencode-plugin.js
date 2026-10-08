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
//   pre_tool_use                 `tool.execute.before`; ante una escritura estructurada
//                                ajena no lanza error: deja que las puertas nativas
//                                `external_directory` y `edit` decidan. No equivale a
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
// Una sola definición default: v1.18.29+ llama server; v2 llama setup.
// Se conserva el núcleo de criterio; cada API registra y traduce sus propios eventos.

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

const LorePlugin = async ({ directory, worktree } = {}) => {
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
  const pendientes = new Map();
  const semillasConsumidas = new Set();
  const encolar = (sessionID, texto) => {
    if (typeof sessionID !== "string" || !sessionID) return;
    if (typeof texto !== "string" || texto === "") return;
    const previo = pendientes.get(sessionID);
    pendientes.set(sessionID, previo ? `${previo}\n${texto}` : texto);
  };

  // La puerta se siembra AQUÍ, al abrir, y no en el primer turno. `experimental.chat.system.transform`
  // es el único canal de la v1 que muta `output.system`, o sea el único que alcanza al modelo; su
  // inyección depende de `chat.message`, que cuenta turnos humanos y devuelve temprano. Con la
  // ventana sin sembrar, el veredicto esperaba a ese guard: para cuando llegaba, la persona ya había
  // escrito y el modelo ya había formulado su respuesta. Sembrarla no puede hacer que el sistema
  // hable antes del primer mensaje —eso no lo puede ningún hook— y sí que no espere a que el modelo
  // ya haya acted, que es la diferencia entre esto y un `UserPromptSubmit`.
  //
  // `veredictoSemilla` se guarda aparte del texto encolado por una sola razon, y es para no
  // decirlo dos veces: cuando el guard ya corrió, la inyección del turno lleva el veredicto
  // dentro de su propio texto, y repetirlo en el mismo prompt del sistema es gasto, no énfasis.
  let veredictoSemilla = null;
  try {
    veredictoSemilla = semillaDePuerta({ raiz });
  } catch {
    /* el techo no se cambia: la puerta vuelve a decir su motivo en la inyección del turno */
  }

  // Lo que el prompt del sistema publica lo lee el modelo como instrucción, así que una ruta
  // que viene de `tool_input` viaja como dato: una línea, sin caracteres de control, y
  // acotada. Una ruta con salto de línea no puede inyectar una instrucción en ese canal (H10).
  const MAX_DATO = 200;
  const comoDato = (valor) => String(valor)
    .replace(/[\r\n\t\v\f\0]+/g, " ")
    // eslint-disable-next-line no-control-regex -- quitar los controles es el punto
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, MAX_DATO);
  const listaDeDatos = (valores) => (Array.isArray(valores) ? valores : []).map(comoDato).filter(Boolean).join(", ");

  // El motivo de un fallo, como dato y no como frase: acota y quita lo que en ese canal seria una
  // instruccion. Un error que no se puede leer no sirve para depurar nada.
  const motivoDe = (error) => comoDato(error?.message ?? error);

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
        if (!ev || !["session.created", "session.deleted"].includes(ev.type)) return;
        const id = ev.properties && ev.properties.info && ev.properties.info.id;
        if (typeof id !== "string" || id === "") return;
        if (ev.type === "session.deleted") {
          pendientes.delete(id);
          semillasConsumidas.delete(id);
          turnosHumanos.delete(id);
          return;
        }
        const raizSesion = ancla(id);
        armar(id, raizSesion);
      } catch {
        // El bus es del host y el runtime llama a `event` sin try: un manejador que revienta
        // se lleva por delante el bus entero, que es la parte compartida. Fallo abierto, siempre.
      }
    },

    dispose() { pendientes.clear(); semillasConsumidas.clear(); turnosHumanos.clear(); },

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

      // La V1 del plugin no puede abrir el prompt nativo desde este hook. Deja pasar
      // únicamente la escritura estructurada para que la herramienta de archivo aplique
      // sus puertas `external_directory` y `edit` antes de mutar. Una regla host `deny`
      // sigue bloqueando; no escribimos una concesión ni aprobamos comandos de shell aquí.
      if (bloquea) return;
      if (desconocidos.length === 0) return;
      anotarDesconocidos(jurisdiccion, carga.tool, desconocidos);
      encolar(input?.sessionID, `Lore Plugin: escritura fuera de un árbol con Lore, permitida y anotada: ${listaDeDatos(desconocidos)}`);
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

        let registrado = readReceipt(jurisdiccion);
        if (registrado === null) {
          const baseRecibo = base ?? (apertura?.root === jurisdiccion ? apertura.estado : null);
          if (!baseRecibo) {
            writeReceipt(jurisdiccion, actual);
            return;
          }
          try { registrado = writeReceipt(jurisdiccion, baseRecibo); }
          catch { registrado = { version: 2, ...baseRecibo }; }
        }
        const resultado = evaluateState(actual, registrado);
        if (!resultado.pendingLore && !resultado.requiresApproval) {
          if (registrado.version === 1) writeReceipt(jurisdiccion, actual);
          return;
        }
        encolar(sessionID, formatIntervention(resultado));
      } catch {
        /* abierto: un guard que se cae no puede ser el que frena el trabajo */
      }
    },

    "experimental.chat.system.transform"(input, output) {
      if (!output || !Array.isArray(output.system)) return;
      const sessionID = input?.sessionID;
      let aviso = pendientes.get(sessionID) ?? null;
      pendientes.delete(sessionID);
      if (typeof sessionID === "string" && !semillasConsumidas.has(sessionID)) {
        semillasConsumidas.add(sessionID);
        if (veredictoSemilla) aviso = aviso ? `${veredictoSemilla}\n${aviso}` : veredictoSemilla;
      }

      // Lo que esta peticion va a decir de la semilla, y que arbol es el suyo. Tres formas de
      // callarla, y las tres se deciden aqui y no en la fabrica: el turno ya la dijo, la sesion no
      // es el arbol donde se sembro, o la perilla esta apagada —que se lee en este momento y no
      // al cargar la fabrica, porque `LORE_ESTADO_DIR` todavia no esta puesto en ese instante.
      const injectionDelTurno = { texto: null };
      let raizSesion = raiz;

      // Escribir en el canal del host es lo unico que puede fallar aqui, y cuando falla no queda
      // otro canal dentro del proceso. Por eso stderr es el respaldo y no una excepcion: un hook que
      // pierde lo que tenia que decir es un hook que nadie puede depurar. El texto se escribe tal
      // cual —no se pierde lo que se iba a decir— y con la marca delante cuando el texto no se
      // identifica solo, para que quien lo lea en la consola sepa de quien es.
      const alSistema = (texto) => {
        if (typeof texto !== "string" || texto === "") return true;
        try {
          output.system.push(texto);
          return true;
        } catch {
          const conMarca = texto.startsWith("Lore Plugin") ? texto : `[Lore Plugin] ${texto}`;
          try { process.stderr.write(`${conMarca}\n`); }
          catch { /* ni stderr responde: no queda nada, y el techo sigue siendo no romper nada */ }
          return false;
        }
      };

      // El aviso sin la semilla cuando esta peticion ya la dijo por otro camino, cuando la sesion
      // no es el arbol donde se sembro, o cuando la perilla esta apagada. La semilla es una LINEA
      // propia de la cola —no una frase pegada dentro de otro texto— porque es lo unico que se
      // puede quitar sin perder el aviso de la guardia, que viaja en la misma cola.
      const sinSemilla = (texto) => {
        if (typeof texto !== "string" || veredictoSemilla === null) return texto;
        const yaLaDijoElTurno = injectionDelTurno.texto !== null && injectionDelTurno.texto.includes(veredictoSemilla);
        if (!yaLaDijoElTurno && raizSesion === raiz && nivel() !== "off") return texto;
        return texto.split("\n").filter((linea) => linea !== veredictoSemilla).join("\n");
      };

      // El registro del turno viaja por el MISMO canal que el aviso de la guardia, y en la
      // misma petición: son las dos cosas que el sistema tiene que saber antes de que el
      // modelo responda, y separarlas costaría un disparo del hook por cada una.
      try {
        const sessionID = input && input.sessionID;
        raizSesion = (typeof sessionID === "string" ? readSessionRoot(sessionID) : null) ?? raiz;
        // Solo chat.message cuenta a la persona. Las peticiones auxiliares y los ciclos
        // internos del modelo no crean turnos ni consumen la apertura.
        const turno = turnosHumanos.get(sessionID)?.turno;
        if (!turno) { alSistema(sinSemilla(aviso)); return; }
        const r = inyeccion({
          raiz: raizSesion,
          turno: turno === 1 ? null : turno,
          nivel: nivel(),
        });
        if (r.inyectar && r.texto) {
          injectionDelTurno.texto = r.texto;
          alSistema(r.texto);
        }
      } catch (error) {
        // Fallo abierto, que es el techo declarado y no se cambia: una puerta que no puede
        // abrirse no puede ser la que tumba la sesion. Lo que si se cambia es el silencio. Con el
        // catch mudo, la inyeccion no llegaba y el turno seguía como si no hubiera puerta —que es
        // el defecto, no la garantia— y nadie tenía forma de saber que el registro en vigor se
        // acababa de saltar. Se dice que fallo y por que, por el mismo canal que el aviso.
        alSistema(`Lore Plugin: el hook fallo y este turno pasa sin el registro en vigor (${motivoDe(error)}). El turno sigue: la puerta es lo que no abrio, no el trabajo.`);
      }
      alSistema(sinSemilla(aviso));
    },
  };
};

// API v2 documentada: https://opencode.ai/v2/docs/build/plugins/migrate-v1
export default {
  id: "lore-plugin",
  server: LorePlugin,
  async setup(ctx) {
    const hooks = await LorePlugin({ directory: ctx.location.directory });
    const controller = new AbortController();
    await ctx.session.hook("prompt", event => {
      hooks.event({ event: { type: "session.created", properties: { info: { id: event.sessionID } } } });
      hooks["chat.message"]({ sessionID: event.sessionID, messageID: event.messageID }, { message: { role: "user" } });
    });
    await ctx.session.hook("context", event => {
      const output = { system: [] };
      hooks["experimental.chat.system.transform"]({ sessionID: event.sessionID }, output);
      for (const text of output.system) event.system.push({ type: "text", text });
    });
    await ctx.tool.hook("execute.before", event => hooks["tool.execute.before"](
      { sessionID: event.sessionID, tool: event.tool }, { args: event.input }));
    await ctx.tool.hook("execute.after", event => hooks["tool.execute.after"](
      { sessionID: event.sessionID, tool: event.tool }));
    const subscription = (async () => {
      for await (const event of ctx.event.subscribe({ signal: controller.signal })) hooks.event({ event });
    })().catch(error => {
      if (!controller.signal.aborted) process.stderr.write("Lore Plugin: event subscription unavailable; session baseline uses prompt admission.\n");
    });
    return async () => { controller.abort(); await subscription; hooks.dispose(); };
  },
};
