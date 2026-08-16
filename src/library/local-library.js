import { fingerprint, pregenFingerprintPayload } from "./fingerprint.js";

const KEY = "character-forge:pregen-library:v1";

export function loadPregens() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) { console.error("[library] loadPregens failed", error); return []; }
}

export async function savePregen(character) {
  try {
    const items = loadPregens();
    const contentFingerprint = await fingerprint(pregenFingerprintPayload(character));
    const duplicate = items.find(item=>item.fingerprint===contentFingerprint);
    if (duplicate) throw new Error(`This pregen is mechanically identical to ${duplicate.name}. Open the existing library entry instead.`);
    const entry = {
      id:crypto.randomUUID(),
      fingerprint:contentFingerprint,
      name:character.name,
      createdAt:new Date().toISOString(),
      ruleset:character.ruleset,
      sourceMode:character.sourceMode,
      level:character.level,
      className:character.class?.name||"Unknown",
      speciesName:character.species?.name||"Unknown",
      backgroundName:character.background?.name||"Unknown",
      character
    };
    items.unshift(entry);
    localStorage.setItem(KEY,JSON.stringify(items));
    return entry;
  } catch (error) { console.error("[library] savePregen failed", error); throw error; }
}

export function removePregen(id) {
  try {
    const items = loadPregens().filter(item=>item.id!==id);
    localStorage.setItem(KEY,JSON.stringify(items));
    return items;
  } catch (error) { console.error("[library] removePregen failed", error); throw error; }
}
