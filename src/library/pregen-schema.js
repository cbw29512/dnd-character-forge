export const PREGEN_SCHEMA_VERSION=1;

export function migratePregenEntry(entry){
  try{
    if(!entry||typeof entry!=="object"||Array.isArray(entry))return null;
    if(typeof entry.id!=="string"||!entry.id||typeof entry.fingerprint!=="string"||!entry.fingerprint)return null;
    if(!entry.character||typeof entry.character!=="object"||Array.isArray(entry.character))return null;
    const version=entry.schemaVersion;
    if(version==null)return{...entry,schemaVersion:PREGEN_SCHEMA_VERSION};
    if(!Number.isInteger(version)||version<1)return null;
    if(version>PREGEN_SCHEMA_VERSION)return null;
    return entry;
  }catch(error){console.error("[pregen-schema] migration failed",error);return null;}
}

export function currentPregenEntry(entry){
  try{return Boolean(entry&&entry.schemaVersion===PREGEN_SCHEMA_VERSION&&migratePregenEntry(entry));}
  catch(error){console.error("[pregen-schema] current-version check failed",error);return false;}
}
