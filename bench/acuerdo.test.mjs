import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

import { skillText } from "../scripts/skill-text.mjs";

// S4v2 - el acuerdo en el primer uso.
//
// Los primeros cuatro requisitos son la forma original de la pieza. Los seis siguientes son
// defectos que una revision independiente le encontro a un intento anterior (S4, guardado en
// `git stash list`), y por eso cada uno entra aqui como prueba obligatoria desde el principio:
// la forma se escribe knowing que esos seis ya fallaron una vez.
//
// Requisito 9 governa este archivo entero: toda prueba de comportamiento llama a la funcion
// real y mira su salida real. Donde una prueba podria limitarse a leer una bandera de estado,
// esta llama ademas a la funcion y comprueba lo que devuelve.

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const A = join(raiz, "skills", "use-lore", "scripts", "acuerdo.mjs");
const MODULO = () => import(pathToFileURL(A).href);
const leer = (rel) => readFileSync(join(raiz, rel), "utf8");
const CLI = (raizArbol, ...args) =>
  execFileSync(process.execPath, [A, ...args.map((a) => a.replace("{raiz}", raizArbol))], {
    encoding: "utf8",
  });

const HOY = "2026-09-28";
const tree = () => mkdtempSync(join(tmpdir(), "acuerdo-"));
const limpiar = (root) => rmSync(root, { recursive: true, force: true });

// Lo que la persona elige en el primer acuerdo. `porque` va primero porque la enmienda de RC4
// lo exige: el acuerdo que ofrece el kit empieza por el para que.
const PORQUE = "Quiero que esta landing y el reporte semanal salgan sin que tenga que vigilarlos.";
const ELECCION = {
  porque: PORQUE,
  trabajo: "landing y reporte semanal",
  intensidad: "cercana",
  ritmo: "normal",
  cubre: ["landing", "reporte-semanal"],
  limites: [
    { familia: "opus", nivel: "alto", nunca: false },
    { familia: "gpt-5", nivel: "medio", nunca: false },
    { familia: "flash-preview", nivel: "bajo", nunca: true, temporal: true, vence: "2026-12-31" },
  ],
};

const RECAPITULACION =
  "Vas a hacer la landing y el reporte semanal. Te hablo cercano y a ritmo normal. "
  + "No uso modelos de la familia flash-preview en nivel bajo.";

// Registrar de verdad un acuerdo aprobado: las tres puertas, y el por que.
const aprobado = async (root, sobre = ELECCION) => {
  const M = await MODULO();
  const acuerdo = M.elegir(sobre);
  const r = M.registrar(acuerdo, {
    raiz: root,
    aprobado: true,
    recapitulacion: RECAPITULACION,
    ahora: HOY,
  });
  assert.equal(r.escrito, true, `el registro deberia escribirse: ${r.falta}`);
  return { M, acuerdo, ...r };
};

// --- 1. el primer uso ofrece el acuerdo, y no bloquea trabajar sin el ---------

test("1a: el primer uso de un trabajo de mas de una sesion ofrece el acuerdo", async () => {
  const { primeraVez, elegir } = await MODULO();
  const root = tree();
  try {
    const r = primeraVez({ raiz: root, trabajo: { sesiones: 3 } });
    assert.equal(r.ofrece, true);
    assert.equal(r.motivo, "primer-uso");
    assert.equal(r.acuerdo, null);
    assert.equal(typeof elegir(ELECCION).intensidad, "string");
  } finally {
    limpiar(root);
  }
});

test("1b: un trabajo de una sola sesion no ofrece el acuerdo y tampoco estorba", async () => {
  const { primeraVez } = await MODULO();
  const root = tree();
  try {
    const r = primeraVez({ raiz: root, trabajo: { sesiones: 1 } });
    assert.equal(r.ofrece, false);
    assert.equal(r.motivo, "trabajo-corto");
  } finally {
    limpiar(root);
  }
});

test("1c: con acuerdo vigente el segundo uso no vuelve a ofrecerlo", async () => {
  const root = tree();
  try {
    const { M } = await aprobado(root);
    const r = M.primeraVez({ raiz: root, trabajo: { sesiones: 9 } });
    assert.equal(r.ofrece, false);
    assert.equal(r.motivo, "ya-hay-acuerdo");
    assert.equal(r.acuerdo.intensidad, "cercana");
  } finally {
    limpiar(root);
  }
});

test("1d: el acuerdo existe solo si pasaron las tres puertas juntas", async () => {
  const { elegir, registrar, leer: leerAcuerdo, hayAcuerdo } = await MODULO();
  const acuerdo = elegir(ELECCION);

  // Puerta 1 y 3, sin la 2: la IA recapo y escribiria, pero nadie aprobo.
  const sinAprobar = tree();
  try {
    const r = registrar(acuerdo, { raiz: sinAprobar, aprobado: false, recapitulacion: RECAPITULACION, ahora: HOY });
    assert.equal(r.escrito, false);
    assert.equal(r.falta, "aprobacion");
    assert.equal(existsSync(join(sinAprobar, r.ruta)), false);
    assert.equal(leerAcuerdo(sinAprobar), null);
  } finally {
    limpiar(sinAprobar);
  }

  // Puerta 2 y 3, sin la 1: aprobado y escrito, pero nadie lo recapitulo.
  const sinRecap = tree();
  try {
    const r = registrar(acuerdo, { raiz: sinRecap, aprobado: true, recapitulacion: "", ahora: HOY });
    assert.equal(r.escrito, false);
    assert.equal(r.falta, "recapitulacion");
    assert.equal(leerAcuerdo(sinRecap), null);
  } finally {
    limpiar(sinRecap);
  }

  // Las tres: queda escrito antes de construir.
  const completo = tree();
  try {
    const r = registrar(acuerdo, { raiz: completo, aprobado: true, recapitulacion: RECAPITULACION, ahora: HOY });
    assert.equal(r.escrito, true);
    const doc = readFileSync(join(completo, r.ruta), "utf8");
    // El documento se escribe en el idioma del kit y la recapitulacion va en el de la
    // persona: el archivo tiene que registrar las dos cosas, no una traduccion.
    assert.match(doc, /approved by the person/i);
    assert.ok(doc.includes(RECAPITULACION), "la recapitulacion completa queda escrita, no resumida");
    assert.equal(leerAcuerdo(completo).intensidad, "cercana");
    assert.equal(hayAcuerdo(completo), true);
  } finally {
    limpiar(completo);
  }
});

test("1e: sin acuerdo el kit opera igual - negar el trabajo no es una opcion", async () => {
  const { primeraVez, sinAcuerdo, puedeOperar, hayAcuerdo } = await MODULO();
  const root = tree();
  try {
    const r = primeraVez({ raiz: root, trabajo: { sesiones: 5 } });
    assert.equal(r.ofrece, true);
    assert.equal(hayAcuerdo(root), false, "ofrecido no es aprobado: no hay acuerdo");
    // Lo que se hace mientras la persona no contesta: se trabaja con los defectos.
    assert.equal(sinAcuerdo(root).intensidad, "cercana");
    assert.equal(sinAcuerdo(root).ritmo, "normal");
    assert.equal(sinAcuerdo(root).limites.length, 0);
    assert.equal(puedeOperar(null), true, "se puede operar sin acuerdo");
  } finally {
    limpiar(root);
  }
});

// --- 2. las perillas del primer acuerdo --------------------------------------

test("2a: intensidad y ritmo tienen vocabulario cerrado y defecto", async () => {
  const { elegir, INTENSIDADES, RITMOS, DEFECTO } = await MODULO();
  assert.deepEqual(INTENSIDADES, ["sobria", "cercana"]);
  assert.deepEqual(RITMOS, ["despacio", "normal", "rapido"]);
  assert.deepEqual(DEFECTO, { intensidad: "cercana", ritmo: "normal" });

  // Sin elegir nada: cercana y normal, que es lo que el acuerdo declara.
  const porDefecto = elegir({ porque: PORQUE });
  assert.equal(porDefecto.intensidad, "cercana");
  assert.equal(porDefecto.ritmo, "normal");

  assert.equal(elegir({ ...ELECCION, intensidad: "sobria", ritmo: "despacio" }).intensidad, "sobria");
  assert.equal(elegir({ ...ELECCION, ritmo: "rapido" }).ritmo, "rapido");
  assert.throws(() => elegir({ ...ELECCION, intensidad: "cariñosa" }), /intensidad/i);
  assert.throws(() => elegir({ ...ELECCION, ritmo: "urgentísimo" }), /ritmo/i);
});

test("2b: los limites nombran familia y nivel, nunca un numero de version", async () => {
  const { elegir } = await MODULO();
  // Una familia con digitos es una familia: el veto es a la version, no al numero.
  assert.equal(elegir({ ...ELECCION, limites: [{ familia: "gpt-5", nivel: "alto" }] }).limites[0].familia, "gpt-5");
  // Un numero de version en el lugar de la familia no es una familia.
  assert.throws(() => elegir({ ...ELECCION, limites: [{ familia: "4.5.1", nivel: "alto" }] }), /familia/);
  // Y un limite que ademas trae la version colgada es el mismo error, con otro nombre.
  assert.throws(
    () => elegir({ ...ELECCION, limites: [{ familia: "opus", nivel: "alto", version: "4.5.1" }] }),
    /version/,
  );
});

test("2c: un limite temporal lleva fecha de vencimiento, y vencido deja de mandar", async () => {
  const { elegir, vigente } = await MODULO();
  assert.throws(
    () => elegir({ ...ELECCION, limites: [{ familia: "flash-preview", nivel: "bajo", nunca: true, temporal: true }] }),
    /vence/,
  );

  const limite = elegir(ELECCION).limites[2];
  assert.equal(limite.vence, "2026-12-31");
  assert.equal(vigente(limite, HOY), true);
  assert.equal(vigente(limite, "2027-01-15"), false);

  // Un limite que no depende de nada temporal no caduca nunca por su cuenta.
  const permanente = elegir({ ...ELECCION, limites: [{ familia: "opus", nivel: "alto", nunca: true }] }).limites[0];
  assert.equal(vigente(permanente, "2099-01-01"), true);
});

test("2d: 'nunca' se dice, y un limite sin nivel no es un limite", async () => {
  const { elegir } = await MODULO();
  const conNunca = elegir({ ...ELECCION, limites: [{ familia: "flash-preview", nivel: "bajo", nunca: true }] }).limites[0];
  assert.equal(conNunca.nunca, true);
  assert.throws(() => elegir({ ...ELECCION, limites: [{ familia: "opus" }] }), /nivel/);
  assert.throws(() => elegir({ ...ELECCION, limites: [{ nivel: "alto" }] }), /familia/);
});

// --- 3. quien actualiza desde una version anterior ---------------------------

test("3a: el mensaje de actualizacion llega una sola vez, en llano, con su invitacion", async () => {
  const { mensajeActualizacion } = await MODULO();
  const root = tree();
  try {
    const primera = mensajeActualizacion({ raiz: root, desde: "2.4.8", ahora: HOY });
    assert.equal(primera.yaDice, false);
    assert.ok(primera.mensaje.length > 0);
    // Que llego Vespi, que puede hacer, y la invitacion a fijar limites. Las tres.
    assert.match(primera.mensaje, /Vespi/, "el mensaje dice explicitamente que llego Vespi");
    assert.match(primera.mensaje, /lleg[oó]/i);
    assert.match(primera.mensaje, /puede|can offer|can set/i);
    assert.match(primera.mensaje, /limit|l[ií]mite/i);

    const segunda = mensajeActualizacion({ raiz: root, desde: "2.4.8", ahora: HOY });
    assert.equal(segunda.yaDice, true);
    assert.equal(segunda.mensaje, null);

    // Y una vez dicho, no vuelve a decir ni en una llamada posterior.
    assert.equal(mensajeActualizacion({ raiz: root, desde: "2.4.8", ahora: HOY }).yaDice, true);
  } finally {
    limpiar(root);
  }
});

test("3b: quien no actualiza desde antes no recibe nada", async () => {
  const { mensajeActualizacion } = await MODULO();
  const root = tree();
  try {
    const r = mensajeActualizacion({ raiz: root, desde: "2.4.9", ahora: HOY });
    assert.equal(r.yaDice, true);
    assert.equal(r.mensaje, null);
  } finally {
    limpiar(root);
  }
});

// --- 4. el chequeo silencioso antes de cada pieza nueva -----------------------

test("4a: una pieza cubierta no llega a la persona; una nueva, si", async () => {
  const { cubrir } = await MODULO();
  const acuerdo = { cubre: ["landing", "reporte-semanal"], apuestasCaidas: [] };

  const cubierta = cubrir(acuerdo, "landing");
  assert.equal(cubierta.cubierto, true);
  assert.equal(cubierta.preguntar, false);

  const nueva = cubrir(acuerdo, "checkout-nuevo");
  assert.equal(nueva.cubierto, false);
  assert.equal(nueva.preguntar, true);
});

test("4b: el chequeo es silencioso - no devuelve frase para el caso cubierto", async () => {
  const { cubrir } = await MODULO();
  const acuerdo = { cubre: ["landing"], apuestasCaidas: [] };
  assert.equal(cubrir(acuerdo, "landing").frase, null);
  assert.ok(cubrir(acuerdo, "checkout-nuevo").frase.length > 0);
});

test("4c: sin acuerdo vigente no se pregunta por cada pieza - no se impone", async () => {
  const { cubrir } = await MODULO();
  // Sin acuerdo, nada esta cubierto por un acuerdo que no existe...
  const r = cubrir(null, "checkout-nuevo");
  assert.equal(r.cubierto, false);
  assert.equal(r.por, "sin-acuerdo");
  // ...y aun asi no se lleva la pieza a la persona: el kit no se niega a operar sin el.
  assert.equal(r.preguntar, false, "sin acuerdo el kit opera, no pregunta pieza por pieza");
  assert.equal(r.frase, null);
});

test("4d: una enmienda que saca una pieza la devuelve a la pregunta", async () => {
  const { elegir, enmendar, cubrir } = await MODULO();
  const base = elegir(ELECCION);
  const salida = enmendar(base, {
    cambio: { saca: "reporte-semanal" },
    autorizado: true,
    ahora: "2026-10-01",
  });
  assert.equal(cubrir(salida, "reporte-semanal").preguntar, true);
  assert.equal(cubrir(salida, "landing").preguntar, false);
});

// --- 5. el aviso de actualizacion NUNCA cuenta como acuerdo aprobado ---------
// Defecto de S4: el aviso escribia un recibo con `version: 1` y `leer()` lo devolvia, asi que
// preguntar "hay acuerdo" despues del aviso contestaba que si.

test("5a: mostrar el aviso de actualizacion y preguntar si hay acuerdo responde que no", async () => {
  const { mensajeActualizacion, hayAcuerdo, leer, primeraVez } = await MODULO();
  const root = tree();
  try {
    const aviso = mensajeActualizacion({ raiz: root, desde: "2.4.8", ahora: HOY });
    assert.equal(aviso.yaDice, false, "el aviso se mostro de verdad");

    // La pregunta que el aviso contestaba sin querer.
    assert.equal(hayAcuerdo(root), false, "el aviso no es un acuerdo aprobado");
    assert.equal(leer(root), null, "leer() tampoco devuelve un acuerdo");

    // Y el arbol no tiene documento de acuerdo, que es la otra mitad de lo mismo.
    assert.equal(existsSync(join(root, "acuerdo.md")), false);

    // Y la oferta sigue en pie: no hay acuerdo, asi que el primer uso la vuelve a ofrecer.
    const oferta = primeraVez({ raiz: root, trabajo: { sesiones: 3 } });
    assert.equal(oferta.ofrece, true);
    assert.equal(oferta.acuerdo, null);
  } finally {
    limpiar(root);
  }
});

test("5b: el aprobado es un campo explicito, y solo las tres puertas lo escriben", async () => {
  const root = tree();
  try {
    const { M } = await aprobado(root);
    // El recibo guarda el aprobado explicito, y `leer` no lo infiere de que el archivo exista.
    const recibo = JSON.parse(readFileSync(join(root, ".lore-acuerdo"), "utf8"));
    assert.equal(recibo.aprobado, true);
    assert.equal(M.hayAcuerdo(root), true);

    // Un recibo con la forma correcta pero sin aprobado -el estado que dejaba el aviso- no
    // cuenta. Esto es lo que hacia el aviso de S4.
    const sinAprobar = tree();
    try {
      writeFileSync(
        join(sinAprobar, ".lore-acuerdo"),
        JSON.stringify({ version: 1, intensidad: "cercana", ritmo: "normal", aviso: { desde: "2.4.8" } }),
        "utf8",
      );
      assert.equal(M.hayAcuerdo(sinAprobar), false, "version sin aprobado no es un acuerdo");
      assert.equal(M.leer(sinAprobar), null);
    } finally {
      limpiar(sinAprobar);
    }
  } finally {
    limpiar(root);
  }
});

test("5c: una enmienda sin la palabra de la persona no crea un acuerdo aprobado", async () => {
  const { elegir, enmendar, hayAcuerdo } = await MODULO();
  const root = tree();
  try {
    const base = elegir(ELECCION);
    enmendar(base, { cambio: { intensidad: "sobria" }, autorizado: false, ahora: "2026-10-01", raiz: root });
    assert.equal(hayAcuerdo(root), false, "enmendar sin autorizacion no aprueba nada");
    assert.equal(existsSync(join(root, "acuerdo.md")), false);
  } finally {
    limpiar(root);
  }
});

// --- 6. el documento del acuerdo NUNCA se sobrescribe -----------------------
// Defecto de S4: `registrar` hacia writeFileSync sin mirar, y la segunda llamada perdia el
// primer documento entero, con la recapitulacion de la persona dentro.

test("6a: registrar dos veces no pierde ni reemplaza el primer documento", async () => {
  const root = tree();
  try {
    const { M, acuerdo, ruta } = await aprobado(root);
    const despues = readFileSync(join(root, ruta), "utf8");

    // El mismo acuerdo, registrado otra vez - la llamada que en S4 pisaba el archivo.
    const segundo = M.registrar(acuerdo, {
      raiz: root,
      aprobado: true,
      recapitulacion: "UNA RECAPITULACION DISTINTA QUE NO DEBE PERDERSE",
      ahora: "2026-10-09",
    });

    assert.equal(segundo.escrito, false, "el segundo registro no escribe");
    assert.equal(segundo.falta, "ya-existe", "y lo dice explicitamente");
    assert.equal(segundo.redirige, "enmendar", "y manda al camino de la enmienda");

    const final = readFileSync(join(root, ruta), "utf8");
    assert.equal(final, despues, "el documento del primer acuerdo queda byte a byte");
    assert.ok(final.includes(RECAPITULACION), "la recapitulacion del primer acuerdo sigue ahi");
    assert.ok(!final.includes("UNA RECAPITULACION DISTINTA"), "el segundo intento no entro a costo del primero");
  } finally {
    limpiar(root);
  }
});

test("6b: el segundo intento entra como enmienda, y lo segundo queda escrito", async () => {
  const root = tree();
  try {
    const { M, acuerdo } = await aprobado(root);
    M.registrar(acuerdo, {
      raiz: root,
      aprobado: true,
      recapitulacion: "OTRA RECAPITULACION",
      ahora: "2026-10-09",
    });
    // El camino correcto: no registrar de nuevo, enmendar.
    const salida = M.enmendar(acuerdo, {
      cambio: { intensidad: "sobria" },
      autorizado: true,
      ahora: "2026-10-09",
      raiz: root,
    });
    assert.equal(salida.intensidad, "sobria");

    const doc = readFileSync(join(root, "acuerdo.md"), "utf8");
    assert.ok(doc.includes(RECAPITULACION), "lo primero sigue escrito");
    assert.match(doc, /2026-10-09/, "y la enmienda fechada se agrego");
    assert.ok(!doc.includes("OTRA RECAPITULACION"), "el intento descartado no escribio nada");
    assert.equal(M.leer(root).intensidad, "sobria");
  } finally {
    limpiar(root);
  }
});

// --- 7. las enmiendas no pierden informacion ---------------------------------
// Defecto de S4: tres cosas. La fecha podia quedar en null; `saca` y `agrega` en la misma
// operacion se aplicaban los dos desde la lista ORIGINAL, asi que lo sacado volvia; y los
// limites nuevos se renderizaban como [object Object].

test("7a: una enmienda sin fecha se rechaza", async () => {
  const { elegir, enmendar } = await MODULO();
  const base = elegir(ELECCION);

  assert.throws(
    () => enmendar(base, { cambio: { intensidad: "sobria" }, autorizado: true, ahora: null }),
    /fecha/i,
  );
  // Y tampoco una fecha que no es fecha.
  assert.throws(
    () => enmendar(base, { cambio: { intensidad: "sobria" }, autorizado: true, ahora: "el jueves" }),
    /fecha/i,
  );
  // Y omitirla no es una tercera via: sin fecha hay tres formas del mismo rechazo.
  assert.throws(
    () => enmendar(base, { cambio: { intensidad: "sobria" }, autorizado: true, ahora: undefined }),
    /fecha/i,
  );
  // Y el acuerdo de origen no se toco: la enmienda ni se registro.
  assert.deepEqual(base.enmiendas, []);
  assert.equal(base.intensidad, "cercana", "el acuerdo sigue como estaba");
});

test("7b: 'saca' y 'agrega' en la misma operacion aplican los dos, en orden", async () => {
  const { elegir, enmendar, cubrir } = await MODULO();
  const base = elegir(ELECCION);
  const salida = enmendar(base, {
    cambio: { saca: "landing", agrega: "checkout-nuevo" },
    autorizado: true,
    ahora: "2026-10-01",
  });

  assert.ok(!salida.cubre.includes("landing"), "lo sacado no vuelve: no se recupera lo que la otra operacion retiro");
  assert.ok(salida.cubre.includes("checkout-nuevo"), "y lo agregado entra");
  assert.ok(salida.cubre.includes("reporte-semanal"), "lo que no se nombro se queda");
  assert.equal(cubrir(salida, "landing").preguntar, true, "la pieza sacada vuelve a la pregunta");
  assert.equal(cubrir(salida, "checkout-nuevo").preguntar, false);
});

test("7c: los limites nuevos se renderizan en su forma legible, nunca [object Object]", async () => {
  const root = tree();
  try {
    const { M, acuerdo } = await aprobado(root);
    M.enmendar(acuerdo, {
      cambio: { limites: [{ familia: "gemini", nivel: "alto", nunca: true, temporal: true, vence: "2027-01-31" }] },
      autorizado: true,
      ahora: "2026-10-01",
      raiz: root,
    });

    const doc = readFileSync(join(root, "acuerdo.md"), "utf8");
    const agregado = doc.slice(doc.indexOf("2026-10-01"));
    assert.ok(!agregado.includes("[object Object]"), "un limite no se renderiza como objeto");
    assert.match(agregado, /gemini/, "la familia nueva se lee");
    assert.match(agregado, /alto/, "el nivel nuevo se lee");
    assert.match(agregado, /2027-01-31/, "y su vencimiento");
    assert.ok(!agregado.includes("[object"), "ninguna parte de la enmienda es [object ...]");
  } finally {
    limpiar(root);
  }
});

test("7d: la enmienda se fecha y se agrega; lo anterior queda byte a byte", async () => {
  const root = tree();
  try {
    const { M, acuerdo, ruta } = await aprobado(root);
    const antes = readFileSync(join(root, ruta), "utf8");

    M.enmendar(acuerdo, {
      cambio: { intensidad: "sobria" },
      autorizado: true,
      ahora: "2026-10-05",
      raiz: root,
    });
    const despues = readFileSync(join(root, ruta), "utf8");

    assert.ok(despues.startsWith(antes), "el acuerdo original no se reescribe: la enmienda se agrega");
    assert.match(despues.slice(antes.length), /2026-10-05/);
    assert.match(despues.slice(antes.length), /^## Amendment /m);
    assert.match(despues.slice(antes.length), /sobria/);
  } finally {
    limpiar(root);
  }
});

test("7e: sin la palabra de la persona no hay enmienda, y el acuerdo sigue como estaba", async () => {
  const { elegir, enmendar } = await MODULO();
  const base = elegir(ELECCION);
  const r = enmendar(base, { cambio: { intensidad: "sobria" }, autorizado: false, ahora: "2026-10-05" });
  assert.equal(r.enmendada, false);
  assert.equal(r.enmiendas.length, 0);
  assert.equal(r.intensidad, "cercana");
});

test("7f: lo nuevo manda, lo viejo queda legible y el objeto original no se toca", async () => {
  const { elegir, enmendar } = await MODULO();
  const base = elegir(ELECCION);
  const r = enmendar(base, { cambio: { ritmo: "rapido" }, autorizado: true, ahora: "2026-10-05" });
  assert.equal(r.ritmo, "rapido");
  assert.equal(r.enmiendas.length, 1);
  assert.equal(r.enmiendas[0].fecha, "2026-10-05");
  assert.equal(r.enmiendas[0].que, "ritmo");
  assert.equal(base.ritmo, "normal", "el objeto original no se toca: la enmienda es una capa");
});

test("7g: las enmiendas se acumulan sin borrarse", async () => {
  const { elegir, enmendar } = await MODULO();
  let a = elegir(ELECCION);
  a = enmendar(a, { cambio: { ritmo: "despacio" }, autorizado: true, ahora: "2026-10-01" });
  a = enmendar(a, { cambio: { ritmo: "rapido" }, autorizado: true, ahora: "2026-10-02" });
  assert.deepEqual(a.enmiendas.map((e) => e.fecha), ["2026-10-01", "2026-10-02"]);
  assert.equal(a.ritmo, "rapido");
});

// --- 8. las apuestas son exactamente las cuatro del acuerdo -------------------
// Defecto de S4: las apuestas implementadas eran del aparato inventado
// (chequeo-silencioso, no-bloquea, mensaje-una-vez) y no las del acuerdo. Y "nunca se
// impone" es una regla dura, jamas una apuesta que pueda caer.
//
// Defecto de S4v2: esta lista se escribio con tres, y el acuerdo declara cuatro (ver 13a).
// Las pruebas de S4v2 contaban tres; el spec manda, y el conteo se corrige aqui.

const LAS_CUATRO = [
  "Que las frases cotidianas alcancen para repartir el trabajo entre las tres skills.",
  "Que el recordatorio por hook sostenga el registro turno a turno.",
  "Que OpenCode permita avisar sin bloquear.",
  "Que cada host deje leer el uso de la sesión; donde no, se usan las señales contables y se declara por escrito.",
];

test("8a: las apuestas son exactamente las cuatro del acuerdo, con sus palabras", async () => {
  const { APUESTAS, elegir } = await MODULO();
  assert.equal(APUESTAS.length, 4, "son cuatro y solo cuatro");
  assert.deepEqual(APUESTAS.map((a) => a.texto), LAS_CUATRO);
  assert.deepEqual(
    APUESTAS.map((a) => a.id),
    ["frases-cotidianas", "recordatorio-por-hook", "avisar-sin-bloquear", "leer-uso-de-la-sesion"],
  );
  assert.deepEqual(elegir(ELECCION).apuestas, APUESTAS.map((a) => a.id));
});

test("8b: el documento del acuerdo escribe las cuatro apuestas con sus palabras", async () => {
  const root = tree();
  try {
    const { ruta } = await aprobado(root);
    const doc = readFileSync(join(root, ruta), "utf8");
    for (const frase of LAS_CUATRO) {
      assert.ok(doc.includes(frase), `falta la apuesta: ${frase}`);
    }
  } finally {
    limpiar(root);
  }
});

test("8c: 'nunca se impone' es regla dura, no una apuesta que pueda caer", async () => {
  const { APUESTAS, caer, noSeMueve, decision, elegir } = await MODULO();
  const entero = elegir(ELECCION);

  // No es una apuesta: no esta en la lista, y no se puede hacer caer.
  assert.ok(!APUESTAS.some((a) => /impone|imponer|impuesto/i.test(`${a.id} ${a.texto}`)));
  assert.throws(() => caer(entero, "nunca-se-impone"), /apuesta/);
  assert.throws(() => caer(entero, "imponer-el-acuerdo"), /apuesta/);

  // Es regla dura: esta en lo que no se mueve, y con las cuatro caidas sigue parando.
  assert.ok(noSeMueve().includes("imponer-el-acuerdo"), "imponer el acuerdo no se mueve sin tu palabra");
  let roto = entero;
  for (const apuesta of APUESTAS) roto = caer(roto, apuesta.id);
  assert.equal(roto.apuestasCaidas.length, 4);
  assert.equal(decision(roto, "imponer-el-acuerdo"), "parar");
  assert.equal(decision(entero, "imponer-el-acuerdo"), "parar");
});

test("8d: lo demas que no se mueve sin tu palabra tampoco degrada al caer las cuatro", async () => {
  const { APUESTAS, caer, noSeMueve, decision, elegir } = await MODULO();
  const entero = elegir(ELECCION);
  let roto = entero;
  for (const apuesta of APUESTAS) roto = caer(roto, apuesta.id);

  assert.deepEqual(noSeMueve(roto), noSeMueve(entero));
  assert.ok(noSeMueve(entero).length > 0);
  assert.equal(decision(roto, "congelar-una-version"), "parar");
  assert.equal(decision(entero, "congelar-una-version"), "parar");
  assert.notEqual(decision(roto, "cambiar-el-ritmo"), "parar", "y lo de margen sigue operando");
});

// --- 9. el comportamiento se prueba con el comportamiento ---------------------
// Defecto de S4: la prueba que decia "el aviso se repite si cae una apuesta" no llamaba a la
// funcion del aviso; leia una bandera del objeto. Estas cuatro llaman a la funcion de verdad.

test("9a: con la apuesta del aviso caida, la funcion del aviso se llama y contesta de verdad", async () => {
  const root = tree();
  try {
    const { M } = await aprobado(root);
    // La apuesta cae DE VERDAD, en el recibo de verdad.
    M.anotarCaida(root, "avisar-sin-bloquear");
    assert.deepEqual(M.leer(root).apuestasCaidas, ["avisar-sin-bloquear"]);

    // Y ahora la funcion que muestra el aviso, llamada de verdad, sin arbol nuevo.
    const r = M.mensajeActualizacion({ raiz: root, desde: "2.4.8", ahora: HOY });
    assert.equal(r.yaDice, false, "el aviso sigue existiendo: caer la apuesta no lo borra");
    assert.ok(typeof r.mensaje === "string" && r.mensaje.length > 0, "y sigue teniendo su texto real");
    assert.match(r.mensaje, /Vespi/);
    // Lo que cambia es COMO se entrega: sin poder avisar directo, queda disponible para
    // acompanar lo proximo que el kit ya vaya a decir, y no para bloquear.
    assert.equal(r.modo, "disponible");
    assert.equal(r.bloquea, false, "y no bloquea en ninguno de los dos modos");

    // Con la apuesta en pie, el mismo aviso se entrega directo. La misma funcion, otro estado.
    const otro = tree();
    try {
      const otra = await aprobado(otro);
      const directo = otra.M.mensajeActualizacion({ raiz: otro, desde: "2.4.8", ahora: HOY });
      assert.equal(directo.modo, "directo");
      assert.equal(directo.bloquea, false);
      assert.equal(directo.mensaje, r.mensaje, "caer la apuesta no cambia las palabras del aviso");
    } finally {
      limpiar(otro);
    }
  } finally {
    limpiar(root);
  }
});

test("9b: con la apuesta de las frases caida, la funcion que reparte contesta de verdad", async () => {
  const { elegir, caer, reparte, puedeOperar } = await MODULO();
  const entero = elegir(ELECCION);
  const caido = caer(entero, "frases-cotidianas");
  assert.equal(puedeOperar(caido), true, "cae y se sigue");

  // En pie: la frase alcanza a la skill.
  assert.equal(reparte({ frase: "quiero hacer esto y no se como", acuerdo: entero }).skill, "use-lore");
  assert.equal(reparte({ frase: "se esta perdiendo lo que decidimos", acuerdo: entero }).skill, "vespi");

  // Caida: la frase ya no alcanza, y la funcion dice que hay que preguntar. Falla hacia la
  // pregunta, que es el lado barato.
  const r = reparte({ frase: "quiero hacer esto y no se como", acuerdo: caido });
  assert.equal(r.skill, null);
  assert.equal(r.preguntar, true);
  assert.equal(r.por, "sin-frases");
});

test("9c: con la apuesta del recordatorio caida, la funcion del recordatorio contesta de verdad", async () => {
  const { elegir, caer, recordatorio } = await MODULO();
  const entero = elegir(ELECCION);

  // En pie: hay recordatorio silencioso turno a turno, y la persona no lo ve.
  const enP = recordatorio({ acuerdo: entero, turno: 4 });
  assert.equal(enP.visible, false, "el recordatorio es silencioso: la persona no lo ve");
  assert.ok(enP.texto.length > 0, "y lleva su texto real");

  // Caida: no hay recordatorio, y el modulo dice que el registro se guarda en FASES.md.
  const caido = caer(entero, "recordatorio-por-hook");
  const r = recordatorio({ acuerdo: caido, turno: 4 });
  assert.equal(r.texto, null);
  assert.equal(r.por, "sin-hook");
  assert.equal(r.visible, false);
  assert.equal(r.en, "FASES.md", "y la funcion dice donde se guarda el registro en su lugar");
});

test("9d: una apuesta desconocida no se acepta como apuesta", async () => {
  const { elegir, caer } = await MODULO();
  assert.throws(() => caer(elegir(ELECCION), "el-modelo-responde"), /apuesta/);
});

test("9e: con las cuatro caidas el trabajo sigue, y lo que no se movia para igual", async () => {
  const { elegir, caer, puedeOperar, APUESTAS, decision } = await MODULO();
  let a = elegir(ELECCION);
  for (const apuesta of APUESTAS) a = caer(a, apuesta.id);
  assert.equal(puedeOperar(a), true, "las cuatro caidas a la vez no rompen el trabajo");
  assert.equal(a.apuestasCaidas.length, 4);
  assert.equal(decision(a, "congelar-una-version"), "parar", "y lo que no se movia sigue parando");
});

// --- 10. los create-* lo invocan de verdad, y el acuerdo empieza por el por que

const CREATORS = ["create-area", "create-bot", "create-project"];

test("10a: el documento del acuerdo empieza por el por que, antes de recapitular", async () => {
  const root = tree();
  try {
    const { ruta } = await aprobado(root);
    const doc = readFileSync(join(root, ruta), "utf8");
    const porque = doc.indexOf(PORQUE);
    const recap = doc.indexOf(RECAPITULACION);
    assert.ok(porque !== -1, "el por que queda escrito: no es taxonomia, es la gravedad del acuerdo");
    assert.ok(recap !== -1);
    assert.ok(porque < recap, "el por que va antes de que y de como: la enmienda de RC4 lo exige");
    assert.match(doc.slice(0, porque), /## Why/i);
  } finally {
    limpiar(root);
  }
});

test("10b: use-lore dice que el acuerdo empieza por el por que, y lo pone primero", async () => {
  const text = skillText(join(raiz, "skills", "use-lore"));
  const seccion = text.slice(text.indexOf("## The agreement"));
  assert.ok(seccion.length > 0, "use-lore tiene la seccion del acuerdo");

  // La PRIMERA subseccion del acuerdo es el por que. No basta con que exista en algun lado: la
  // enmienda de RC4 pide que el acuerdo empiece ahi, y un por que enterrado media pagina mas
  // abajo es exactamente el acuerdo que empieza por el que.
  const cuerpo = seccion.slice(seccion.indexOf("\n"));
  const primera = cuerpo.match(/^#{2,3} .*$/m)?.[0] ?? "";
  assert.match(primera, /why/i, `la primera subseccion del acuerdo deberia ser el por que; es: ${primera}`);

  // Y la oferta dice las dos perillas, los limites y la regla del fallo.
  assert.match(seccion, /`sobria`\s*\\?\|\s*`cercana`/);
  assert.match(seccion, /`despacio`\s*\\?\|\s*`normal`\s*\\?\|\s*`rapido`/);
  assert.match(seccion, /model family/i);
  assert.match(seccion, /not version numbers/i);
  assert.match(seccion, /when a bet falls, work continues/i);
  assert.match(seccion, /stops when something that did not need/i);
  // La oferta no impone y no bloquea.
  assert.match(seccion, /binds only if you accept it/i);
  assert.match(seccion, /never refuses to work without it/i);
  assert.match(seccion, /three doors/i);
  assert.match(seccion, /second person/i);
  assert.match(seccion, /no jargon/i);
  // Y las cuatro apuestas van con las palabras del acuerdo, no con nombres inventados.
  for (const frase of LAS_CUATRO) {
    assert.ok(seccion.includes(frase), `use-lore no nombra la apuesta: ${frase}`);
  }
  // Y el comando que los create-* invocan sale de aqui.
  assert.match(seccion, /node <ruta-del-kit>\/skills\/use-lore\/scripts\/acuerdo\.mjs primera-vez/);
});

test("10c: los tres create-* invocan el modulo de verdad, dentro de su procedimiento", async () => {
  for (const skill of CREATORS) {
    const text = skillText(join(raiz, "skills", skill));
    // El comando vive en el PROCEDIMIENTO, no en un apendice: se busca desde el encabezado.
    const procedimiento = text.slice(text.search(/^##+ .*Procedure/im));
    assert.ok(procedimiento.length > 0, `${skill}: no tiene seccion de procedimiento`);

    const comando = procedimiento.match(
      /node\s+(?:<[^>]+>\/)?skills\/use-lore\/scripts\/acuerdo\.mjs\s+([a-z-]+)/,
    );
    assert.ok(comando, `${skill}: su procedimiento no invoca skills/use-lore/scripts/acuerdo.mjs`);
    assert.ok(
      ["primera-vez", "aviso"].includes(comando[1]),
      `${skill}: invoca un subcomando que no existe: ${comando[1]}`,
    );
    assert.match(procedimiento, /--raiz/, `${skill}: el comando necesita saber en que arbol`);
  }
});

test("10d: el comando que los create-* nombran se ejecuta de verdad y contesta", () => {
  const root = tree();
  try {
    // 1) el aviso de actualizacion, tal como lo invocaria un create-* sobre un arbol que
    //    venia de una version anterior.
    const aviso = JSON.parse(CLI(root, "aviso", "--raiz", "{raiz}", "--desde", "2.4.8", "--ahora", HOY));
    assert.equal(aviso.yaDice, false);
    assert.match(aviso.mensaje, /Vespi/);
    assert.match(aviso.mensaje, /limit|l[ií]mite/i);

    // 2) la oferta del acuerdo, tal como la invocaria antes de construir.
    const oferta = JSON.parse(CLI(root, "primera-vez", "--raiz", "{raiz}", "--sesiones", "4"));
    assert.equal(oferta.ofrece, true);
    assert.equal(oferta.motivo, "primer-uso");
    // Y el por que es lo primero que ofrece leer: sin el, el orden del acuerdo no es el suyo.
    assert.ok(oferta.porQue, "la oferta trae el hueco del por que");
    assert.equal(oferta.acuerdo, null);
  } finally {
    limpiar(root);
  }
});

test("10e: el CLI de primera-vez no ofrece nada en un arbol que ya tiene acuerdo aprobado", async () => {
  const root = tree();
  try {
    await aprobado(root);
    const r = JSON.parse(CLI(root, "primera-vez", "--raiz", "{raiz}", "--sesiones", "4"));
    assert.equal(r.ofrece, false);
    assert.equal(r.motivo, "ya-hay-acuerdo");
    assert.equal(r.acuerdo.intensidad, "cercana");
  } finally {
    limpiar(root);
  }
});

// --- la pieza queda en los registros del kit ---------------------------------

test("11: la pieza queda en los registros del kit, no solo en el skill", () => {
  for (const lang of ["es", "en"]) {
    assert.match(leer(`docs/REFERENCE_${lang}.md`), /\.lore-acuerdo/, `REFERENCE_${lang}: falta el recibo`);
  }
  assert.match(leer("scripts/spec-a-verifier.mjs"), /skills\/use-lore\/scripts\/acuerdo\.mjs/);
});

// --- el modulo escribe solo a donde puede -----------------------------------

// --- 13. S4v3: lo que las dos revisiones independientes encontraron ------------
// Defectos de S4v2, verificados contra el codigo y contra el texto del acuerdo RC4
// (`specs/012-rc4/acuerdo.md`). Cada uno entra aqui como prueba obligatoria: cada uno
// fallo una vez, y volver a escribir la pieza sin la prueba es volver a fallar.

// 13a. La lista de apuestas estaba incompleta. El acuerdo declara CUATRO, no tres: la
// cuarta -leer el uso de la sesion del host, y donde no se puede, las senales contables
// declaradas por escrito- no estaba en la lista, sin texto y sin su `por`.
test("13a: la cuarta apuesta del acuerdo esta en la lista, con su por", async () => {
  const { APUESTAS, elegir } = await MODULO();
  const CUATRO_DEL_ACUERDO = [
    "Que las frases cotidianas alcancen para repartir el trabajo entre las tres skills.",
    "Que el recordatorio por hook sostenga el registro turno a turno.",
    "Que OpenCode permita avisar sin bloquear.",
    "Que cada host deje leer el uso de la sesión; donde no, se usan las señales contables y se declara por escrito.",
  ];

  assert.equal(APUESTAS.length, 4, "el acuerdo declara cuatro apuestas, no tres");
  assert.deepEqual(APUESTAS.map((a) => a.texto), CUATRO_DEL_ACUERDO, "las cuatro, con las palabras del acuerdo y en su orden");

  // Y la cuarta no esta de largo: tiene nombre, y dice que se usa en su lugar al caer.
  const cuarta = APUESTAS[3];
  assert.ok(cuarta.id, "la cuarta apuesta tiene nombre");
  assert.ok(cuarta.por, "y dice que se hace en su lugar cuando cae");
  assert.ok(elegir(ELECCION).apuestas.includes(cuarta.id), "y entra al registrar un acuerdo");
});

// 13b. enmendar() con `raiz` + `autorizado: true` hacia appendFileSync (que CREA el archivo si no
// existe) y escribia un recibo con `aprobado: true`, sin que las tres puertas se hubieran pasado
// jamas. Eso fabricaba un "acuerdo aprobado" de la nada.
test("13b: enmendar no puede crear un acuerdo que nadie registro", async () => {
  const { elegir, enmendar, hayAcuerdo, leer } = await MODULO();
  const root = tree();
  try {
    const base = elegir(ELECCION);
    const r = enmendar(base, { cambio: { intensidad: "sobria" }, autorizado: true, ahora: "2026-10-01", raiz: root });

    assert.equal(r.enmendada, false, "no hay nada registrado que enmendar");
    assert.equal(r.razon, "sin-acuerdo-registrado", "y lo dice con una razon clara");
    assert.equal(r.intensidad, "cercana", "el acuerdo de origen queda como estaba");

    // Y lo que hizo no fue dejar un acuerdo aprobado de la nada.
    assert.equal(hayAcuerdo(root), false, "ese arbol no tiene acuerdo aprobado");
    assert.equal(leer(root), null);
    assert.equal(existsSync(join(root, "acuerdo.md")), false, "ni documento: solo registrar() lo escribe");
    assert.equal(existsSync(join(root, ".lore-acuerdo")), false, "ni recibo");
  } finally {
    limpiar(root);
  }
});

test("13b-bis: sobre un acuerdo ya registrado, enmendar sigue funcionando", async () => {
  const root = tree();
  try {
    const { M, acuerdo } = await aprobado(root);
    const r = M.enmendar(acuerdo, { cambio: { intensidad: "sobria" }, autorizado: true, ahora: "2026-10-01", raiz: root });
    assert.equal(r.enmendada, true, "lo que ya estaba registrado si se puede enmendar");
    assert.equal(M.leer(root).intensidad, "sobria");
    assert.match(readFileSync(join(root, "acuerdo.md"), "utf8"), /2026-10-01/);
  } finally {
    limpiar(root);
  }
});

test("registrar removes the agreement document when receipt persistence fails", async () => {
  const { elegir, registrar } = await MODULO();
  const root = tree();
  try {
    mkdirSync(join(root, ".lore-acuerdo"));
    assert.throws(() => registrar(elegir(ELECCION), {
      raiz: root,
      aprobado: true,
      recapitulacion: RECAPITULACION,
      ahora: HOY,
    }));
    assert.equal(existsSync(join(root, "acuerdo.md")), false,
      "a failed receipt must not leave a document that claims human approval");
  } finally {
    limpiar(root);
  }
});

// 13c. `registrar` reemplazaba el recibo entero sin conservar el campo `aviso` que ya estaba
// escrito. La secuencia aviso -> se registra el acuerdo -> el aviso se podia volver a mostrar,
// porque el registro habia borrado el rastro de que ya se habia mostrado.
test("13c: registrar conserva el aviso ya mostrado, y el aviso no se repite", async () => {
  const { mensajeActualizacion, hayAcuerdo } = await MODULO();
  const root = tree();
  try {
    // 1) El aviso se muestra de verdad y deja su rastro.
    const aviso = mensajeActualizacion({ raiz: root, desde: "2.4.8", ahora: HOY });
    assert.equal(aviso.yaDice, false);
    assert.equal(aviso.mensaje.length > 0, true);
    assert.equal(existsSync(join(root, ".lore-acuerdo")), true, "el aviso escribio su rastro");

    // 2) La persona acepta y el acuerdo pasa por las tres puertas.
    await aprobado(root);
    assert.equal(hayAcuerdo(root), true, "el registro si crea el acuerdo");

    // 3) El aviso NO vuelve a mostrarse. Ya se dijo una vez, y registrar no borro que se dijo.
    const despues = mensajeActualizacion({ raiz: root, desde: "2.4.8", ahora: HOY });
    assert.equal(despues.yaDice, true, "el aviso ya se habia mostrado: no se repite");
    assert.equal(despues.mensaje, null);

    // Y el recibo es el del acuerdo, con el rastro del aviso dentro y no en su lugar.
    const recibo = JSON.parse(readFileSync(join(root, ".lore-acuerdo"), "utf8"));
    assert.equal(recibo.aprobado, true, "sigue siendo un acuerdo aprobado");
    assert.equal(recibo.intensidad, "cercana", "con lo que la persona eligio");
    assert.equal(recibo.aviso?.desde, "2.4.8", "y el aviso que ya se habia dicho sigue escrito");
  } finally {
    limpiar(root);
  }
});

test("13c-bis: los campos que no le pertenecen al registro sobreviven al registro", async () => {
  const { mensajeActualizacion } = await MODULO();
  const root = tree();
  try {
    // Un campo cualquiera que el modulo no conoce, escrito por otra via, no se pierde.
    mensajeActualizacion({ raiz: root, desde: "2.4.8", ahora: HOY });
    const { M } = await aprobado(root);
    const recibo = M.leer(root);
    assert.equal(recibo.aprobado, true);
    assert.equal(recibo.aviso.desde, "2.4.8", "lo que ya estaba escrito y no le pertenece al registro, se conserva");
  } finally {
    limpiar(root);
  }
});

// 13d. En create-area y en create-bot el aviso de actualizacion corre ANTES de que la carpeta
// destino exista (el `mkdir` esta en el paso siguiente), y ahi escribir el recibo del aviso tira
// ENOENT y tumba el flujo de creacion. El aviso tiene que poder mostrarse sin necesitar disco.
test("13d: el aviso se muestra aunque la carpeta destino todavia no exista", async () => {
  const { mensajeActualizacion, hayAcuerdo } = await MODULO();
  const padre = tree();
  const destino = join(padre, "area-que-aun-no-existe");
  try {
    // Exactamente lo que hace create-area: el aviso, antes del mkdir.
    const aviso = mensajeActualizacion({ raiz: destino, desde: "2.4.8", ahora: HOY });
    assert.equal(aviso.yaDice, false, "el aviso se muestra de verdad");
    assert.ok(aviso.mensaje.length > 0, "con su texto entero");
    assert.match(aviso.mensaje, /Vespi/);
    assert.equal(aviso.bloquea, false, "y sigue sin bloquear");

    // Sin ENOENT, y sin dejar un arbol a medio hacer: avisar no crea la carpeta de otro.
    assert.equal(existsSync(destino), false, "no se crea la carpeta solo por avisar");
    assert.equal(hayAcuerdo(destino), false, "y no hay acuerdo: avisar no aprueba nada");
  } finally {
    limpiar(padre);
  }
});

test("13d-bis: el comando aviso no revienta cuando la carpeta destino no existe", () => {
  const padre = tree();
  const destino = join(padre, "bot-que-aun-no-existe");
  try {
    // Lo que los create-* ejecutan de verdad, contra un destino que todavia no esta.
    const salida = JSON.parse(CLI(destino, "aviso", "--raiz", "{raiz}", "--desde", "2.4.8", "--ahora", HOY));
    assert.equal(salida.yaDice, false);
    assert.match(salida.mensaje, /Vespi/);
    assert.equal(salida.bloquea, false);
    assert.equal(existsSync(destino), false, "el comando tampoco crea la carpeta");

    // Y la oferta tampoco revienta: create-area la corre en el mismo umbral.
    const oferta = JSON.parse(CLI(destino, "primera-vez", "--raiz", "{raiz}", "--sesiones", "4"));
    assert.equal(oferta.ofrece, true);
  } finally {
    limpiar(padre);
  }
});

test("13d-ter: con la carpeta ya ahi, el aviso deja su rastro y no se repite", async () => {
  const { mensajeActualizacion } = await MODULO();
  const root = tree();
  try {
    mensajeActualizacion({ raiz: root, desde: "2.4.8", ahora: HOY });
    assert.equal(existsSync(join(root, ".lore-acuerdo")), true, "donde si puede escribir, escribe");
    assert.equal(mensajeActualizacion({ raiz: root, desde: "2.4.8", ahora: HOY }).yaDice, true);
  } finally {
    limpiar(root);
  }
});

test("13d-cuarta: los create-* declaran que el aviso no depende de la carpeta destino", () => {
  // Sin esto, el texto vuelve a prometer un aviso que se apoya en un arbol que todavia no esta.
  for (const skill of ["create-area", "create-bot", "create-project"]) {
    const text = skillText(join(raiz, "skills", skill));
    assert.match(text, /rastro: false/, `${skill}: no dice que el aviso puede no tener donde dejar rastro`);
  }
});

// 13e. La validacion aceptaba dos cosas que no existen: una familia con la version pegada
// ("opus-4.5.1" - no es una familia, es la version colgada del lado) y una fecha imposible
// ("2026-99-99" - el mes 99 no existe). Las dos, en el acuerdo inicial y en una enmienda.
test("13e: una familia con la version pegada no es una familia", async () => {
  const { elegir, FAMILIAS } = await MODULO();
  // El caso confirmado: la version pegada al nombre de la familia. El criterio es el punto: un
  // numero entero es parte del nombre de la familia (`gpt-5`, `o3`) y un numero CON punto es un
  // pin a una version, que es justo lo que la ley del acuerdo veta.
  assert.throws(
    () => elegir({ ...ELECCION, limites: [{ familia: "opus-4.5.1", nivel: "alto" }] }),
    /familia/i,
    "opus-4.5.1 es una version pegada, no una familia",
  );
  assert.throws(() => elegir({ ...ELECCION, limites: [{ familia: "gpt-4.1-turbo", nivel: "alto" }] }), /familia/i);
  assert.throws(() => elegir({ ...ELECCION, limites: [{ familia: "4.5.1", nivel: "alto" }] }), /familia/i);

  // Y la familia sola, con su numero de generacion, sigue entrando: `gpt-5` es familia.
  assert.equal(elegir({ ...ELECCION, limites: [{ familia: "opus", nivel: "alto" }] }).limites[0].familia, "opus");
  assert.equal(elegir({ ...ELECCION, limites: [{ familia: "gpt-5", nivel: "alto" }] }).limites[0].familia, "gpt-5");
  // El nombre de la familia es un identificador: ni espacios ni puntuacion suelta.
  assert.throws(() => elegir({ ...ELECCION, limites: [{ familia: "sonnet 4", nivel: "alto" }] }), /familia/i);

  // Y hay una lista de familias que este kit reconoce, declarada, no secreta.
  assert.ok(Array.isArray(FAMILIAS) && FAMILIAS.length > 0, "la lista de familias es parte de la ley");
  assert.ok(FAMILIAS.includes("opus"), "y nombra las familias que el kit usa");
  assert.throws(
    () => elegir({ ...ELECCION, limites: [{ familia: "no-es-una-familia", nivel: "alto" }] }),
    /familia/i,
    "una familia que el kit no reconoce es un error visible, no un registro",
  );

  // Y la lista no vive solo en el codigo: use-lore la nombra, para que se pueda ampliar.
  assert.match(skillText(join(raiz, "skills", "use-lore")), /FAMILIAS/, "use-lore declara de donde sale la lista");
});

test("13e-bis: una fecha que no existe no es una fecha", async () => {
  const { elegir, vigente } = await MODULO();
  const conVence = (vence) => elegir({ ...ELECCION, limites: [{ familia: "flash-preview", nivel: "bajo", temporal: true, vence }] });

  // El caso confirmado: el mes 99 y el dia que no existe en su mes.
  assert.throws(() => conVence("2026-99-99"), /vence|fecha/i, "2026-99-99 no es una fecha");
  assert.throws(() => conVence("2026-02-30"), /vence|fecha/i, "febrero no tiene dia 30");
  assert.throws(() => conVence("2026-04-31"), /vence|fecha/i, "abril no tiene dia 31");
  assert.throws(() => conVence("2026-13-01"), /vence|fecha/i, "no hay mes 13");
  assert.throws(() => conVence("2026-00-10"), /vence|fecha/i);
  assert.throws(() => conVence("2026-01-00"), /vence|fecha/i);
  assert.throws(() => conVence("2026-01-32"), /vence|fecha/i);

  // Las que SI existen: y el 29 de febrero, solo en ano bisiesto.
  assert.equal(conVence("2026-02-28").limites[0].vence, "2026-02-28");
  assert.equal(conVence("2024-02-29").limites[0].vence, "2024-02-29", "2024 es bisiesto");
  assert.throws(() => conVence("2026-02-29"), /vence|fecha/i, "2026 no es bisiesto");

  // Y la misma regla para el dia de hoy: un "hoy" imposible no puede afirmar que algo vencio.
  assert.equal(vigente({ vence: "2026-12-31" }, "2026-13-45"), true, "un hoy imposible no vence nada por su cuenta");
});

test("13e-ter: la enmienda no cuela ni la familia versionada ni la fecha imposible", async () => {
  const root = tree();
  try {
    const { M, acuerdo } = await aprobado(root);
    const antes = readFileSync(join(root, "acuerdo.md"), "utf8");

    // Una enmienda con las dos cosas imposibles, sobre un acuerdo ya registrado de verdad.
    assert.throws(
      () => M.enmendar(acuerdo, {
        cambio: { limites: [{ familia: "opus-4.5.1", nivel: "alto" }] },
        autorizado: true,
        ahora: "2026-10-01",
        raiz: root,
      }),
      /familia/i,
      "la enmienda no es una puerta trasera para la version pegada",
    );

    // Y la fecha de la ENMIENDA misma, no la del limite.
    assert.throws(
      () => M.enmendar(acuerdo, { cambio: { intensidad: "sobria" }, autorizado: true, ahora: "2026-02-30", raiz: root }),
      /fecha/i,
      "una enmienda fechada el 30 de febrero no es una enmienda fechada",
    );

    // Nada de eso toco el arbol.
    assert.equal(readFileSync(join(root, "acuerdo.md"), "utf8"), antes, "el documento no cambio");
    assert.equal(M.leer(root).intensidad, "cercana", "y el acuerdo sigue como estaba");
  } finally {
    limpiar(root);
  }
});

// 13f. NO_SE_MUEVE estaba INVERTIDO para la guardia. El acuerdo lista seis cosas bajo "Lo que no
// se mueve sin la palabra de Andres", y cinco son "si esto pasa sin tu palabra, para". La sexta -
// "La guardia sigue bloqueando lo de otro dueno" - tiene el signo contrario: no es una condicion
// de parada, es la regla dura que SIGUE vigente. Modelada en la lista de parar, el kit se
// detenia por hacer lo correcto.
test("13f: la guardia bloqueando lo de otro dueno no es una alarma - se sigue", async () => {
  const { noSeMueve, decision, elegir, caer, APUESTAS } = await MODULO();
  const entero = elegir(ELECCION);

  // Bloquear lo de otro dueno es lo que la guardia DEBE seguir haciendo: no dispara parar.
  assert.ok(
    !noSeMueve().includes("bloquear-el-criterio-de-otro-dueno"),
    "bloquear lo de otro dueno no es algo ante lo cual el kit se detenga",
  );
  assert.equal(decision(entero, "bloquear-el-criterio-de-otro-dueno"), "seguir");

  // Y las cinco que SI son parada por romper una regla dura, siguen parando.
  for (const id of [
    "congelar-una-version",
    "publicar-una-version",
    "escribir-criterio-fuera-de-la-skill",
    "imponer-el-acuerdo",
    "usar-el-modelo-mas-caro-por-defecto",
  ]) {
    assert.ok(noSeMueve().includes(id), `${id}: el acuerdo lo lista y el kit lo tiene que seguir`);
    assert.equal(decision(entero, id), "parar", `${id}: cruzar esa linea sin tu palabra detiene el kit`);
  }

  // Y caer las cuatro apuestas no cambia ninguna de las dos mitades.
  let roto = entero;
  for (const apuesta of APUESTAS) roto = caer(roto, apuesta.id);
  assert.equal(decision(roto, "bloquear-el-criterio-de-otro-dueno"), "seguir");
  assert.equal(decision(roto, "imponer-el-acuerdo"), "parar");
});

test("13f-bis: la regla dura que se mantiene queda escrita, no desaparece", async () => {
  const { sigueDentro, decision, noSeMueve } = await MODULO();
  // Sacarla de la lista de parar no es borrarla: el acuerdo la nombra, y el documento la escribe.
  assert.ok(sigueDentro().includes("bloquear-el-criterio-de-otro-dueno"), "el acuerdo la nombra: sigue escrita");
  assert.ok(!noSeMueve().includes("bloquear-el-criterio-de-otro-dueno"), "pero no como condicion de parada");

  const root = tree();
  try {
    const { ruta } = await aprobado(root);
    const doc = readFileSync(join(root, ruta), "utf8");
    assert.ok(doc.includes("bloquear-el-criterio-de-otro-dueno"), "y el documento del acuerdo la escribe");
    assert.ok(doc.includes("imponer-el-acuerdo"), "junto a las que si paran");
  } finally {
    limpiar(root);
  }
});

test("13f-ter: use-lore no lista la guardia entre las cosas que detienen el kit", () => {
  const text = skillText(join(raiz, "skills", "use-lore"));
  const seccion = text.slice(text.indexOf("### The four bets"));
  const dura = seccion.slice(seccion.indexOf("**And the one thing that is not a bet:**"));
  // El bloque de lo que detiene el kit NO puede llevar a la guardia: la guardia bloqueando es
  // precisamente lo que tiene que seguir pasando.
  assert.ok(dura.length > 0, "use-lore tiene el bloque de la regla dura");
  assert.ok(
    !/not a bet[\s\S]{0,600}guard blocking/i.test(dura),
    "la guardia bloqueando lo de otro dueno no esta entre lo que detiene el kit",
  );
});

test("12: sin las tres puertas no se toca un arbol que no tiene acuerdo aprobado", async () => {
  const { elegir, registrar } = await MODULO();
  const root = tree();
  try {
    mkdirSync(join(root, "lore"), { recursive: true });
    writeFileSync(join(root, "lore", "identidad.md"), "# identidad\n", "utf8");
    const antes = readdirSync(join(root));
    registrar(elegir(ELECCION), { raiz: root, aprobado: false, recapitulacion: RECAPITULACION, ahora: HOY });
    registrar(elegir(ELECCION), { raiz: root, aprobado: true, recapitulacion: "", ahora: HOY });
    assert.deepEqual(readdirSync(join(root)), antes, "sin las tres puertas no se escribe nada");
  } finally {
    limpiar(root);
  }
});
