export function failedOriginal(result) {
  return result?.verdict === "fail" && result?.error !== true;
}

export function buildRepairPrompt(task, priorText) {
  return `${task.prompt}\n\n` +
    `Tu respuesta anterior fue:\n\n---\n${priorText}\n---\n\n` +
    `Revisión: no respetó este criterio del proyecto: ${task.clue}. ` +
    `Corrígela y entrega la respuesta completa corregida, no una lista de cambios.`;
}
