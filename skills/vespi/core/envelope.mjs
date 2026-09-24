// envelope — authority belongs to this operation. The prompt, the output
// and the receipt can never widen it. Revalidation confirms; it does not
// amend. Purpose change ends revalidation and begins governance.
import { sufficient } from "./kernel/authority.js";

// accreditLoaded: a material decision governed by criterion that should have
// been loaded. Unverifiable is never an automatic PASS.
export function accreditLoaded({ material, loaded = [], unverifiable = null }) {
  if (!material) return "acceptable";
  if (Array.isArray(loaded) && loaded.length > 0) return "accredited";
  if (unverifiable) return "requires_gate";
  return "blocked";
}

// revalidate({ changed, preauthorized }, scope): every changed premise must
// be covered by pre-existing authority, or the operation stops for a gate.
export function revalidate({ changed = [], preauthorized = [] }, _scope = []) {
  for (const premise of changed) {
    if (!preauthorized.includes(premise)) return "requires_gate";
  }
  return "continue";
}

// grantsCover: delegated revalidation may narrow authority, never broaden it.
export function grantsCover(grants, requirements) {
  try {
    return sufficient(requirements, { spend: grants }).ok === true;
  } catch {
    return false;
  }
}
