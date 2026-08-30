import { fingerprint, pregenFingerprintPayload } from "./fingerprint.js";
import { finalizeExistingCharacter } from "../rules/finalize-character.js";

export async function verifyPregenEntry(entry){
  try{
    if(!validEntryShape(entry))throw new Error("Saved pregen is malformed or incomplete.");
    const actual=await fingerprint(pregenFingerprintPayload(entry.character));
    if(actual!==entry.fingerprint)throw new Error("Saved pregen integrity check failed. Its stored mechanics no longer match the saved fingerprint.");
    const character=finalizeExistingCharacter(entry.character);
    return{...entry,character};
  }catch(error){console.error("[pregen-integrity] saved pregen rejected",error);throw error;}
}

export function validEntryShape(entry){
  try{
    return Boolean(entry&&typeof entry.id==="string"&&entry.id&&typeof entry.fingerprint==="string"&&entry.fingerprint&&entry.character&&typeof entry.character==="object");
  }catch(error){console.error("[pregen-integrity] shape validation failed",error);throw error;}
}
