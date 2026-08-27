export function failedOriginal(result) {
  return result?.verdict === "fail" && result?.error !== true;
}

export function buildRepairPrompt(task, priorText, failedCriteria = []) {
  if (task.criteria) {
    const feedback = task.criteria
      .filter(({ id }) => failedCriteria.includes(id))
      .map(({ id, description }) => `${id}: ${description}`)
      .join("\n");
    return `${task.prompt}\n\n` +
      `Tu respuesta anterior fue:\n\n---\n${priorText}\n---\n\n` +
      `Revisión: no respetó estos criterios del proyecto:\n${feedback}\n\n` +
      `Corrígela y entrega la respuesta completa corregida, no una lista de cambios.`;
  }
  return `${task.prompt}\n\n` +
    `Tu respuesta anterior fue:\n\n---\n${priorText}\n---\n\n` +
    `Revisión: no respetó este criterio del proyecto: ${task.clue}. ` +
    `Corrígela y entrega la respuesta completa corregida, no una lista de cambios.`;
}
