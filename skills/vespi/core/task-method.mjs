// task-method: el paquete que cruza el limite del host. El metodo del coordinador (skills/vespi/method.md)
// viaja como texto dentro del encargo, no como enlace ni como skill instalada aparte: lo que el trabajador
// no recibe no lo puede aplicar, y lo que no viaja con su huella no se puede comprobar despues.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SHIPPED_METHOD = fileURLToPath(new URL("../method.md", import.meta.url));
const KIT_ROOT = fileURLToPath(new URL("../../../", import.meta.url));

// kitWorkerAgentType: la identidad completa que el host da al trabajador de ESTE plugin (`<nombre>:lore-worker`,
// con el nombre del manifiesto). Un `lore-worker` de otro plugin comparte el nombre corto y no trae este metodo.
export function kitWorkerAgentType(pluginRoot = KIT_ROOT) {
  const manifest = JSON.parse(readFileSync(join(pluginRoot, ".claude-plugin", "plugin.json"), "utf8"));
  if (typeof manifest?.name !== "string" || !manifest.name.trim()) throw new Error("plugin manifest has no name");
  return `${manifest.name}:lore-worker`;
}

const sha256 = (text) => createHash("sha256").update(text).digest("hex");

// El metodo distribuido por el kit, leido de su sitio. Un archivo vacio es un metodo ausente.
export function loadShippedMethod() {
  const content = readFileSync(SHIPPED_METHOD, "utf8");
  if (!content.trim()) throw new Error(`shipped method is empty: ${SHIPPED_METHOD}`);
  return { content, sha256: sha256(content), path: SHIPPED_METHOD };
}

// buildTaskMethod: el encargo completo que recibe quien ejecuta. Sin texto de metodo no hay paquete, y sin
// paquete no se llama al host: la falta se ve antes de ejecutar, no despues en un reporte.
export function buildTaskMethod({ operation, task, methodText, cardContent = null } = {}) {
  if (typeof methodText !== "string" || !methodText.trim()) {
    throw new Error("task package needs the shipped method text: no method, no execution");
  }
  if (!operation?.id) throw new Error("task package needs the operation id");
  if (!task?.id) throw new Error("task package needs the task id");
  if (cardContent !== null && (typeof cardContent !== "string" || !cardContent.trim())) {
    throw new Error("task package card content must be a non-empty string");
  }
  return {
    operationId: operation.id,
    taskId: task.id,
    role: task.role ?? null,
    goal: operation.working_goal ?? "",
    question: task.question ?? null,
    sources: Array.isArray(task.sources) ? [...task.sources] : [],
    scope: task.scope ?? null,
    done: task.done_criterion ?? null,
    proof: task.proof ?? null,
    output: task.output?.path ?? null,
    limits: operation.authority ?? null,
    ...(cardContent ? { cardContent } : {}),
    method: { sha256: sha256(methodText), content: methodText },
  };
}

// renderTaskPrompt: el texto canonico que cruza el limite. La huella se calcula sobre estos bytes, y no
// sobre una serializacion interna, para que un observador del host (un hook que ve el prompt real) pueda
// recalcularla sin conocer la estructura del paquete.
function commissionLines(pkg) {
  const list = (items) => (items.length ? items.map((item) => `- ${item}`).join("\n") : "- (none)");
  return [
    `# Task ${pkg.taskId} of operation ${pkg.operationId}`,
    `Role: ${pkg.role ?? "worker"}`,
    `Goal: ${pkg.goal}`,
    `Question: ${pkg.question ?? ""}`,
    `Scope: ${pkg.scope ?? ""}`,
    `Done when: ${pkg.done ?? ""}`,
    `Proof: ${pkg.proof ?? ""}`,
    `Output: ${pkg.output ?? ""}`,
    "Sources:",
    list(pkg.sources),
    ...(pkg.cardContent ? ["Task card:", pkg.cardContent] : []),
    `Limits: ${JSON.stringify(pkg.limits)}`,
    `Method sha256: ${pkg.method.sha256}`,
  ];
}

export function renderTaskPrompt(pkg) {
  return [...commissionLines(pkg), "", "<<<METHOD", pkg.method.content, "METHOD>>>", ""].join("\n");
}

// renderCommission: el mismo encargo sin el bloque de metodo, para el trabajador del kit
// (agents/lore-worker.md), que trae el metodo en su definicion. Nombra la huella del metodo que espera.
// Se construye desde las mismas lineas y no recortando el prompt completo: una marca de metodo escrita
// dentro de un campo no puede cortar el encargo (R3 de la revision de L1).
export function renderCommission(pkg) {
  return `${commissionLines(pkg).join("\n")}\n\nMethod: delivered in the lore-worker agent definition (sha256 ${pkg.method.sha256}).\n`;
}

export function packageDigest(pkg) {
  return sha256(renderTaskPrompt(pkg));
}
