import { fingerprint, pregenFingerprintPayload } from "./fingerprint.js";
import { PREGEN_ENTRY_SCHEMA_VERSION } from "./local-library.js";
import { finalizeExistingCharacter } from "../rules/finalize-character.js";

function entrySchemaVersion(entry){
  try{
    if(entry?.schemaVersion===undefined)return 0;
    if(!Number.isInteger(entry.schemaVersion)||entry.schemaVersion<0)throw new Error("Saved pregen has an invalid schema version.");
    if(entry.schemaVersion>PREGEN_ENTRY_SCHEMA_VERSION)throw new Error(`Saved pregen schema v${entry.schemaVersion} is newer than this Character Forge supports.`);
    return entry.schemaVersion;
  }catch(error){console.error("[pregen-integrity] schema validation failed",error);throw error;}
}

function normalizedEntry(entry,character){
  try{
    return{
      ...entry,
      schemaVersion:PREGEN_ENTRY_SCHEMA_VERSION,
      name:character.name,
      ruleset:character.ruleset,
      sourceMode:character.sourceMode,
      level:character.level,
      className:character.class?.name||"Unknown",
      speciesName:character.species?.name||"Unknown",
      backgroundName:character.background?.name||"Unknown",
      character
    };
  }catch(error){console.error("[pregen-integrity] normalization failed",error);throw error;}
}

export async function verifyPregenEntry(entry){
  try{
    entrySchemaVersion(entry);
    if(!validEntryShape(entry))throw new Error("Saved pregen is malformed or incomplete.");
    const actual=await fingerprint(pregenFingerprintPayload(entry.character));
    if(actual!==entry.fingerprint)throw new Error("Saved pregen integrity check failed. Its stored mechanics no longer match the saved fingerprint.");
    const character=finalizeExistingCharacter(entry.character);
    return normalizedEntry(entry,character);
  }catch(error){console.error("[pregen-integrity] saved pregen rejected",error);throw error;}
}

export function validEntryShape(entry){
  try{
    return Boolean(entry&&typeof entry.id==="string"&&entry.id&&typeof entry.fingerprint==="string"&&entry.fingerprint&&entry.character&&typeof entry.character==="object");
  }catch(error){console.error("[pregen-integrity] shape validation failed",error);throw error;}
}
