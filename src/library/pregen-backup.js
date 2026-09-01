import { loadPregens, replacePregens } from "./local-library.js";
import { verifyPregenEntry } from "./pregen-integrity.js";

export const PREGEN_BACKUP_FORMAT="character-forge-pregen-backup";
export const PREGEN_BACKUP_VERSION=1;
export const MAX_PREGEN_BACKUP_ENTRIES=500;
export const MAX_PREGEN_BACKUP_BYTES=5*1024*1024;

export async function exportPregenBackup(){
  try{
    const entries=loadPregens();
    if(entries.length>MAX_PREGEN_BACKUP_ENTRIES)throw new Error(`Pregen backups support at most ${MAX_PREGEN_BACKUP_ENTRIES} saved characters.`);
    const pregens=[];
    for(const entry of entries)pregens.push(await verifyPregenEntry(entry));
    return JSON.stringify({
      format:PREGEN_BACKUP_FORMAT,
      backupVersion:PREGEN_BACKUP_VERSION,
      exportedAt:new Date().toISOString(),
      pregens
    },null,2);
  }catch(error){console.error("[pregen-backup] export failed",error);throw error;}
}

export async function importPregenBackup(text){
  try{
    if(typeof text!=="string"||!text.trim())throw new Error("Choose a Character Forge Pregen backup JSON file.");
    if(new TextEncoder().encode(text).byteLength>MAX_PREGEN_BACKUP_BYTES)throw new Error(`Pregen backup files must be ${formatByteLimit(MAX_PREGEN_BACKUP_BYTES)} or smaller.`);
    const backup=JSON.parse(text);
    assertBackupEnvelope(backup);

    const existing=loadPregens();
    const fingerprints=new Set(existing.map(entry=>entry.fingerprint));
    const ids=new Set(existing.map(entry=>entry.id));
    const imported=[];
    let skipped=0;

    for(const rawEntry of backup.pregens){
      const verified=await verifyPregenEntry(rawEntry);
      if(verified.sourceMode!=="RAW")throw new Error("Backup contains a non-RAW Pregen entry and cannot be imported.");
      if(fingerprints.has(verified.fingerprint)){skipped+=1;continue;}
      const id=ids.has(verified.id)?crypto.randomUUID():verified.id;
      const entry={...verified,id};
      imported.push(entry);
      fingerprints.add(entry.fingerprint);
      ids.add(entry.id);
    }

    if(existing.length+imported.length>MAX_PREGEN_BACKUP_ENTRIES)throw new Error(`Import would exceed the ${MAX_PREGEN_BACKUP_ENTRIES}-Pregen library safety limit.`);
    replacePregens([...imported,...existing]);
    return{imported:imported.length,skipped,total:backup.pregens.length};
  }catch(error){
    console.error("[pregen-backup] import failed",error);
    if(error instanceof SyntaxError)throw new Error("That file is not valid Character Forge backup JSON.",{cause:error});
    throw error;
  }
}

function assertBackupEnvelope(backup){
  try{
    if(!backup||typeof backup!=="object"||Array.isArray(backup))throw new Error("Backup root must be an object.");
    if(backup.format!==PREGEN_BACKUP_FORMAT)throw new Error("This is not a Character Forge Pregen backup.");
    if(backup.backupVersion!==PREGEN_BACKUP_VERSION)throw new Error(`Unsupported Pregen backup version: ${String(backup.backupVersion)}.`);
    if(typeof backup.exportedAt!=="string"||Number.isNaN(Date.parse(backup.exportedAt)))throw new Error("Backup is missing a valid export timestamp.");
    if(!Array.isArray(backup.pregens))throw new Error("Backup is missing its Pregen list.");
    if(backup.pregens.length>MAX_PREGEN_BACKUP_ENTRIES)throw new Error(`Pregen backups support at most ${MAX_PREGEN_BACKUP_ENTRIES} entries.`);
  }catch(error){console.error("[pregen-backup] envelope validation failed",error);throw error;}
}

function formatByteLimit(bytes){
  try{return `${Math.floor(bytes/(1024*1024))} MB`;}
  catch(error){console.error("[pregen-backup] byte limit formatting failed",error);throw error;}
}
