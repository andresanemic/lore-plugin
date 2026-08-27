function codeOnly(text) {
  const blocks = text.match(/```[\s\S]*?```/g);
  return blocks ? blocks.join("\n") : text;
}

export function gradeTask(task, raw, scope = "code") {
  if (task.criteria) {
    return { verdict: "pending", compliance: [], violation: [], failed_criteria: [] };
  }
  const text = scope === "full" ? raw : codeOnly(raw);
  const hit = (pattern) => {
    const prefix = pattern.match(/^\(\?([im]+)\)/);
    const flags = new Set(["m", ...(prefix?.[1] ?? "")]);
    const source = prefix ? pattern.slice(prefix[0].length) : pattern;
    return new RegExp(source, [...flags].join("")).test(text);
  };
  const compliance = task.compliance.filter(hit);
  const violation = task.violation.filter(hit);
  const verdict = violation.length || compliance.length < task.compliance.length ? "fail" : "pass";
  return { verdict, compliance, violation };
}

export function validateTaskGrader(task) {
  if (task.criteria) {
    if (task.criteria.length !== 8) throw new Error("Una tarea semántica debe congelar ocho criterios.");
    return;
  }
  if (!task.selftest) throw new Error("Tarea regex sin selftest.");
  if (gradeTask(task, task.selftest.bad).verdict !== "fail") throw new Error("Selftest bad no falla.");
  if (gradeTask(task, task.selftest.good).verdict !== "pass") throw new Error("Selftest good no pasa.");
}
