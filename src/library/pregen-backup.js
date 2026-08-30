import { loadPregens, replacePregens, PREGEN_ENTRY_SCHEMA_VERSION } from "./local-library.js";
import { verifyPregenEntry } from "./pregen-integrity.js";

export const PREGEN_BACKUP_FORMAT = "character-forge-pregen-backup";
export const PREGEN_BACKUP_SCHEMA_VERSION = 1;
export const PREGEN_BACKUP_MAX_ENTRIES = 500;

function assertRaw(entry){
  try{
    if(entry.sourceMode!=="RAW"||entry.character?.sourceMode!=="RAW")throw new Error(`Backup contains a non-RAW pregen${entry.name?` (${entry.name})`:""}.`);
    return entry;
  }catch(error){console.error("[pregen-backup] RAW boundary failed",error);throw error;}
}

function parseBackup(text){
  try{
    if(typeof text!=="string"||!text.trim())throw new Error("Pregen backup is empty.");
    const backup=JSON.parse(text);
    if(!backup||typeof backup!=="object"||Array.isArray(backup))throw new Error("Pregen backup must be a JSON object.");
    if(backup.format!==PREGEN_BACKUP_FORMAT)throw new Error("This file is not a Character Forge pregen backup.");
    if(!Number.isInteger(backup.schemaVersion)||backup.schemaVersion<1)throw new Error("Pregen backup schema version is missing or invalid.");
    if(backup.schemaVersion>PREGEN_BACKUP_SCHEMA_VERSION)throw new Error(`Pregen backup schema v${backup.schemaVersion} is newer than this Character Forge supports.`);
    if(!Array.isArray(backup.entries))throw new Error("Pregen backup entries are missing or malformed.");
    if(backup.entries.length>PREGEN_BACKUP_MAX_ENTRIES)throw new Error(`Pregen backup exceeds the ${PREGEN_BACKUP_MAX_ENTRIES}-entry safety limit.`);
    return backup;
  }catch(error){
    if(error instanceof SyntaxError)throw new Error("Pregen backup is not valid JSON.");
    console.error("[pregen-backup] parse failed",error);
    throw error;
  }
}

async function verifyRawEntries(entries,label){
  try{
    const verified=[];
    for(const entry of entries)verified.push(assertRaw(await verifyPregenEntry(entry)));
    return verified;
  }catch(error){console.error(`[pregen-backup] ${label} verification failed`,error);throw error;}
}

export async function createPregenBackup(entries=loadPregens()){
  try{
    if(!Array.isArray(entries))throw new Error("Saved pregen library is malformed.");
    if(entries.length>PREGEN_BACKUP_MAX_ENTRIES)throw new Error(`Saved pregen library exceeds the ${PREGEN_BACKUP_MAX_ENTRIES}-entry backup limit.`);
    const verified=await verifyRawEntries(entries,"export");
    return{
      format:PREGEN_BACKUP_FORMAT,
      schemaVersion:PREGEN_BACKUP_SCHEMA_VERSION,
      entrySchemaVersion:PREGEN_ENTRY_SCHEMA_VERSION,
      exportedAt:new Date().toISOString(),
      entries:verified
    };
  }catch(error){console.error("[pregen-backup] export build failed",error);throw error;}
}

export async function exportPregenBackupJson(entries=loadPregens()){
  try{return JSON.stringify(await createPregenBackup(entries),null,2);}
  catch(error){console.error("[pregen-backup] JSON export failed",error);throw error;}
}

export async function importPregenBackupJson(text){
  try{
    const backup=parseBackup(text);
    const incoming=await verifyRawEntries(backup.entries,"import");
    const currentRaw=loadPregens();
    if(currentRaw.length>PREGEN_BACKUP_MAX_ENTRIES)throw new Error(`Saved pregen library exceeds the ${PREGEN_BACKUP_MAX_ENTRIES}-entry safety limit.`);
    const current=await verifyRawEntries(currentRaw,"existing library");
    const fingerprints=new Set(current.map(entry=>entry.fingerprint));
    const ids=new Set(current.map(entry=>entry.id));
    const added=[];
    let skipped=0;
    for(const entry of incoming){
      if(fingerprints.has(entry.fingerprint)){skipped+=1;continue;}
      const restored=structuredClone(entry);
      if(ids.has(restored.id))restored.id=crypto.randomUUID();
      while(ids.has(restored.id))restored.id=crypto.randomUUID();
      restored.schemaVersion=PREGEN_ENTRY_SCHEMA_VERSION;
      fingerprints.add(restored.fingerprint);
      ids.add(restored.id);
      added.push(restored);
    }
    if(current.length+added.length>PREGEN_BACKUP_MAX_ENTRIES)throw new Error(`Import would exceed the ${PREGEN_BACKUP_MAX_ENTRIES}-entry library safety limit.`);
    replacePregens([...added,...current]);
    return{added:added.length,skipped,total:current.length+added.length};
  }catch(error){console.error("[pregen-backup] import failed",error);throw error;}
}
