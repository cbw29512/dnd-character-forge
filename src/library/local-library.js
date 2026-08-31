import { fingerprint, homebrewFingerprintPayload, pregenFingerprintPayload } from "./fingerprint.js";
import { PREGEN_SCHEMA_VERSION, migratePregenEntry } from "./pregen-schema.js";

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

export function loadPregens(){
  try{
    const raw=load(PREGEN_KEY,"pregens"),migrated=[];
    for(const entry of raw){const current=migratePregenEntry(entry);if(current)migrated.push(current);else console.warn("[library] quarantined malformed or unsupported pregen entry");}
    return migrated;
  }catch(error){console.error("[library] pregen migration failed",error);return[];}
}
export const loadHomebrew = () => load(HOMEBREW_KEY,"homebrew");

export async function savePregen(character) {
  try {
    const items = loadPregens();
    const contentFingerprint = await fingerprint(pregenFingerprintPayload(character));
    for(const item of items){if(!item.character)continue;item.fingerprint=await fingerprint(pregenFingerprintPayload(item.character));item.schemaVersion=PREGEN_SCHEMA_VERSION;}
    const duplicate = items.find(item=>item.fingerprint===contentFingerprint);
    if(duplicate){
      if(duplicate.name===character.name&&presentationChanged(duplicate.character,character)){
        if(character.presentation)duplicate.character.presentation=structuredClone(character.presentation);else delete duplicate.character.presentation;
        duplicate.schemaVersion=PREGEN_SCHEMA_VERSION;duplicate.updatedAt=new Date().toISOString();store(PREGEN_KEY,items,"pregens");return{...duplicate,presentationUpdated:true};
      }
      throw new Error(`This pregen is mechanically identical to ${duplicate.name}. Open the existing library entry instead.`);
    }
    const entry = { schemaVersion:PREGEN_SCHEMA_VERSION, id:crypto.randomUUID(), fingerprint:contentFingerprint, name:character.name, createdAt:new Date().toISOString(), ruleset:character.ruleset, sourceMode:character.sourceMode, level:character.level, className:character.class?.name||"Unknown", speciesName:character.species?.name||"Unknown", backgroundName:character.background?.name||"Unknown", character };
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
    if (duplicate) throw new Error(`These mechanics already exist as ${duplicate.name}. Rename-only duplicates are blocked locally.`);
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
function presentationChanged(saved,current){try{return JSON.stringify(saved?.presentation||null)!==JSON.stringify(current?.presentation||null);}catch(error){console.error("[library] presentation comparison failed",error);throw error;}}
