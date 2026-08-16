import { sample } from "./random.js";
import { duplicateValues } from "./duplicates.js";

export function resolveSpellChoices({ available, selected = [], required, label = "spells" }) {
  try {
    if (!Array.isArray(available) || !Array.isArray(selected)) throw new Error(`${label} choices must be arrays`);
    if (!Number.isInteger(required) || required < 0) throw new Error(`${label} required count is invalid`);
    const duplicates = duplicateValues(selected);
    if (duplicates.length) throw new Error(`Duplicate ${label} selected: ${duplicates.join(", ")}`);
    const legal = new Set(available);
    const illegal = selected.filter(id=>!legal.has(id));
    if (illegal.length) throw new Error(`Illegal ${label} selection: ${illegal.join(", ")}`);
    if (selected.length > required) throw new Error(`Too many ${label} selected: ${selected.length} of ${required}`);
    const remaining = required - selected.length;
    const randomized = remaining ? sample(available,remaining,selected) : [];
    return { selected:[...selected], randomized, all:[...selected,...randomized] };
  } catch (error) { console.error(`[spells] ${label} resolution failed`, error); throw error; }
}

export function resolveSpellLoadout(profile, selections = {}) {
  try {
    if (!profile || typeof profile !== "object") throw new Error("Spellcasting profile is required");
    const result = {};
    for (const [bucket, config] of Object.entries(profile.buckets || {})) {
      result[bucket] = resolveSpellChoices({ available:config.available || [], selected:selections[bucket] || [], required:config.required || 0, label:bucket });
    }
    return result;
  } catch (error) { console.error("[spells] loadout resolution failed", error); throw error; }
}
