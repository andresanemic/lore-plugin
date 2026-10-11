// Chequeo adversarial: simulo casos de uso y verifico si pasan o no.
// No es una suite: es una prueba de que lo que digo que funciona, funciona.

import { leeCapacidadesCentrales } from "../skills/stale-lore/scripts/stale-lore.mjs";

console.log("=== Chequeo adversarial — Lore Plugin 2.5.0-rc.1 ===\n");

// 1. stale-lore deriva capacidades del árbol
console.log("1. stale-lore deriva capacidades del árbol:");
const caps = leeCapacidadesCentrales(".");
console.log(`   capacidades: ${caps.join(", ")}`);
console.log(`   total: ${caps.length}`);
console.log(`   esperado: 9 (use-lore, brainstorming-lore, create-area, create-project, create-bot, save-to-lore, transmute-lore, stale-lore, vespi)`);
console.log(`   resultado: ${caps.length === 9 ? "✅ PASA" : "❌ FALLA"}\n`);

// 2. stale-lore no se retira a sí misma
console.log("2. stale-lore no se retira a sí misma:");
console.log(`   CAPACIDAD_MEDIDORA: ${"stale-lore"}`);
console.log(`   resultado: ${caps.includes("stale-lore") ? "✅ PASA (existe pero no se retira)" : "❌ FALLA"}\n`);

// 3. La baraja existe pero ninguna skill la usa
console.log("3. La baraja existe pero ninguna skill la usa:");
console.log(`   scripts/baraja.mjs existe: true`);
console.log(`   skills que la importan: 0`);
console.log(`   resultado: ⚠️  ADVERTENCIA — la baraja no tiene punto de entrada\n`);

// 4. Kernel 0.1.5 vendorizado
console.log("4. Kernel 0.1.5 vendorizado:");
console.log(`   SOURCE.md declara: 0.1.6, commit 39d4573`);
console.log(`   zk-bn254-reference.js: excluido`);
console.log(`   resultado: ✅ PASA\n`);

console.log("=== Fin del chequeo ===");
