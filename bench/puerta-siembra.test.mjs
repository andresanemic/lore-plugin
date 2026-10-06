import assert from "node:assert/strict";
import test from "node:test";
import { semillaDePuerta } from "../hooks/lore-turno.mjs";

// H6: la siembra que falla no puede callar. El techo es no romper la sesión,
// no el silencio: el motivo viaja como motivo, distinguible del veredicto.
test("la semilla que falla dice su motivo, no null", () => {
  const r = semillaDePuerta({ raiz: 123 });
  assert.equal(typeof r, "string", "el fallo se tragó en silencio");
  assert.match(r, /no pudo sembrar/, "el motivo no se distingue del veredicto");
});
