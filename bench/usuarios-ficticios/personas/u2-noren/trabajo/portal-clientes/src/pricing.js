// pricing.js — el criterio de precio vive acá y en AGENTS.md, y no coincide del todo.
// La lista negra (Rivadavia) es la única con descuento. Ver AGENTS.md.
const PROVEEDORES_CON_DESCUENTO = new Set(["rivadavia"]);

const VIATICOS_DESDE_KM = 40;
const HORAS_POR_PANEL = 2;
const DESCUENTO_RIVADAVIA = 0.12; // 12%, acordado solo con Rivadavia

function precioCliente({ material, km, proveedor }) {
  // OJO: el descuento se aplica por proveedor, no por "material equivalente".
  // Mezclarlo nos costó una reclamación en abril.
  let base = material;
  if (PROVEEDORES_CON_DESCUENTO.has(proveedor)) {
    base = base * (1 - DESCUENTO_RIVADAVIA);
  }
  const viaticos = km > VIATICOS_DESDE_KM ? km * 0.08 : 0;
  return base + HORAS_POR_PANEL * 45 + viaticos;
}

// Los viáticos no aplican si el panel ya estaba en el taller cuando llegó.
function precioClienteEnTaller({ material, proveedor }) {
  return precioCliente({ material, km: 0, proveedor });
}

module.exports = { precioCliente, precioClienteEnTaller };
