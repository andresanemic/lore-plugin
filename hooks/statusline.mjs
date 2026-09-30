#!/usr/bin/env node
// La marca `[Lore Plugin]` en la linea de estado de Claude Code (R46).
//
// Vive en la linea de estado y no dentro de la prosa de las respuestas por una razon
// que no es de estilo: `use-lore` prohibe narrar la maquinaria en la conversacion, y
// una marca que aparece en cada respuesta seria justamente eso. En la linea de estado
// cuesta cero tokens —esa linea no entra al contexto— y la persona la ve sin que
// nadie la interrumpa.
//
// No se instala solo. Se entrega con el kit y lo pone quien instala (L7): escribir en
// la configuracion de la persona sin que lo pida seria cambiar su host, y eso no lo
// hace un hook.
//
// Modo de uso: Claude Code corre esto con el estado de la sesion por stdin y usa la
// primera linea de stdout como la marca. Falla en silencio: una linea de estado rota
// no puede tirar la sesion, y un error visible ahi seria ruido en cada turno.

import { readFileSync } from "node:fs";

import { marca, nivel as nivelActivo } from "./lore-turno.mjs";

let salida = "";
try {
  // Se lee el stdin y se EXIGE que sea un objeto. La marca no necesita el contenido del
  // payload: lo necesita para saber que el host hablo con el kit. Una entrada rota es
  // un host que no se pudo entender, y marcarlo como si el kit supiera el nivel seria
  // inventar el dato.
  const payload = JSON.parse(readFileSync(0, "utf8") || "{}");
  if (payload && typeof payload === "object") salida = marca(nivelActivo());
} catch {
  salida = "";
}
process.stdout.write(salida ? `${salida}\n` : "");
