import { fingerprint, homebrewFingerprintPayload, pregenFingerprintPayload } from "./fingerprint.js";

const PREGEN_KEY = "character-forge:pregen-library:v1";
const HOMEBREW_KEY = "character-forge:homebrew-library:v1";

function load(key, label) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) { console.error(`[library] ${label} load failed`, error); return []; }
}
function store(key, items, label) {
  try { localStorage.setItem(key,JSON.stringify(items)); return items; }
  catch (error) { console.error(`[library] ${label} store failed`, error); throw error; }
}

export const loadPregens = () => load(PREGEN_KEY,"pregens");
export const loadHomebrew = () => load(HOMEBREW_KEY,"homebrew");

export async function savePregen(character) {
  try {
    const items = loadPregens();
    const contentFingerprint = await fingerprint(pregenFingerprintPayload(character));
    const duplicate = items.find(item=>item.fingerprint===contentFingerprint);
    if (duplicate) throw new Error(`This pregen is mechanically identical to ${duplicate.name}. Open the existing library entry instead.`);
    const entry = { id:crypto.randomUUID(), fingerprint:contentFingerprint, name:character.name, createdAt:new Date().toISOString(), systemId:character.systemId||"dnd", ruleset:character.ruleset, sourceMode:character.sourceMode, level:character.level, className:character.class?.name||"Unknown", speciesName:character.species?.name||"Unknown", backgroundName:character.background?.name||"Unknown", character };
    items.unshift(entry);
    store(PREGEN_KEY,items,"pregens");
    return entry;
  } catch (error) { console.error("[library] savePregen failed", error); throw error; }
}

export async function saveHomebrew(item, ruleset) {
  try {
    const items = loadHomebrew();
    const contentFingerprint = await fingerprint(homebrewFingerprintPayload(item,ruleset));
    const sameName = items.find(entry=>entry.name.trim().toLowerCase()===item.name.trim().toLowerCase());
    if (sameName) throw new Error(`You already have Homebrew named ${sameName.name}. Edit or version the existing entry.`);
    const duplicate = items.find(entry=>entry.fingerprint===contentFingerprint);
    if (duplicate) throw new Error(`These mechanics already exist as ${duplicate.name}. Rename-only duplicates are blocked.`);
    const entry = { id:crypto.randomUUID(), fingerprint:contentFingerprint, name:item.name, type:item.type, ruleset, version:1, createdAt:new Date().toISOString(), item };
    items.unshift(entry);
    store(HOMEBREW_KEY,items,"homebrew");
    return entry;
  } catch (error) { console.error("[library] saveHomebrew failed", error); throw error; }
}

export function removePregen(id) {
  try { return store(PREGEN_KEY,loadPregens().filter(item=>item.id!==id),"pregens"); }
  catch (error) { console.error("[library] removePregen failed", error); throw error; }
}
export function removeHomebrew(id) {
  try { return store(HOMEBREW_KEY,loadHomebrew().filter(item=>item.id!==id),"homebrew"); }
  catch (error) { console.error("[library] removeHomebrew failed", error); throw error; }
}
