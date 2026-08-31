import { fingerprint, pregenFingerprintPayload } from "./fingerprint.js";
import { finalizeExistingCharacter } from "../rules/finalize-character.js";
import { PREGEN_SCHEMA_VERSION, migratePregenEntry } from "./pregen-schema.js";

export async function verifyPregenEntry(entry){
  try{
    const migrated=migratePregenEntry(entry);
    if(!migrated)throw new Error("Saved pregen is malformed, incomplete, or uses an unsupported schema version.");
    const actual=await fingerprint(pregenFingerprintPayload(migrated.character));
    if(actual!==migrated.fingerprint)throw new Error("Saved pregen integrity check failed. Its stored mechanics no longer match the saved fingerprint.");
    const character=finalizeExistingCharacter(migrated.character);
    return{...migrated,schemaVersion:PREGEN_SCHEMA_VERSION,character};
  }catch(error){console.error("[pregen-integrity] saved pregen rejected",error);throw error;}
}

export function validEntryShape(entry){
  try{return Boolean(migratePregenEntry(entry));}
  catch(error){console.error("[pregen-integrity] shape validation failed",error);throw error;}
}
