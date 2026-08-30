import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { fingerprint, pregenFingerprintPayload } from "../src/library/fingerprint.js";
import { loadPregens, replacePregens, savePregen, PREGEN_ENTRY_SCHEMA_VERSION } from "../src/library/local-library.js";
import { verifyPregenEntry } from "../src/library/pregen-integrity.js";
import { createPregenBackup, exportPregenBackupJson, importPregenBackupJson, PREGEN_BACKUP_FORMAT, PREGEN_BACKUP_SCHEMA_VERSION } from "../src/library/pregen-backup.js";

const PREGEN_STORAGE_KEY="character-forge:pregen-library:v1";

function memoryStorage(){
  const values=new Map();
  return{
    getItem:key=>values.has(key)?values.get(key):null,
    setItem:(key,value)=>values.set(key,String(value)),
    removeItem:key=>values.delete(key),
    clear:()=>values.clear()
  };
}

function fighter(level=5,name=`Backup Fighter ${level}`){
  const state=createInitialState();
  state.constraints.level=String(level);
  state.constraints.class="fighter";
  state.constraints.species="human";
  state.constraints.background="criminal";
  state.constraints.name=name;
  return generateCharacter(state);
}

async function entryFor(character,id="backup-entry"){
  return{
    schemaVersion:PREGEN_ENTRY_SCHEMA_VERSION,
    id,
    fingerprint:await fingerprint(pregenFingerprintPayload(character)),
    name:character.name,
    createdAt:"2026-08-30T00:00:00.000Z",
    ruleset:character.ruleset,
    sourceMode:character.sourceMode,
    level:character.level,
    className:character.class.name,
    speciesName:character.species.name,
    backgroundName:character.background.name,
    character:structuredClone(character)
  };
}

function envelope(entries){
  return JSON.stringify({format:PREGEN_BACKUP_FORMAT,schemaVersion:PREGEN_BACKUP_SCHEMA_VERSION,exportedAt:"2026-08-30T00:00:00.000Z",entries});
}

function reset(){globalThis.localStorage=memoryStorage();}

test("new saved pregens carry an explicit schema version and the existing v1 storage key remains stable",async()=>{
  reset();
  const entry=await savePregen(fighter());
  assert.equal(entry.schemaVersion,PREGEN_ENTRY_SCHEMA_VERSION);
  assert.equal(loadPregens()[0].schemaVersion,PREGEN_ENTRY_SCHEMA_VERSION);
  const source=readFileSync(new URL("../src/library/local-library.js",import.meta.url),"utf8");
  assert.match(source,/character-forge:pregen-library:v1/);
});

test("verified pregen backup round-trips through JSON without losing integrity",async()=>{
  reset();
  await savePregen(fighter(5,"Round Trip"));
  const json=await exportPregenBackupJson();
  const parsed=JSON.parse(json);
  assert.equal(parsed.format,PREGEN_BACKUP_FORMAT);
  assert.equal(parsed.schemaVersion,PREGEN_BACKUP_SCHEMA_VERSION);
  assert.equal(parsed.entries.length,1);
  replacePregens([]);
  const result=await importPregenBackupJson(json);
  assert.deepEqual(result,{added:1,skipped:0,total:1});
  const [restored]=loadPregens();
  assert.equal(restored.schemaVersion,PREGEN_ENTRY_SCHEMA_VERSION);
  assert.equal((await verifyPregenEntry(restored)).character.name,"Round Trip");
});

test("legacy unversioned pregen entries migrate to the current schema during import",async()=>{
  reset();
  const legacy=await entryFor(fighter(5,"Legacy Hero"));
  delete legacy.schemaVersion;
  const result=await importPregenBackupJson(envelope([legacy]));
  assert.equal(result.added,1);
  assert.equal(loadPregens()[0].schemaVersion,PREGEN_ENTRY_SCHEMA_VERSION);
});

test("backup import rejects tampered mechanics before changing the local library",async()=>{
  reset();
  const existing=await entryFor(fighter(4,"Existing"),"existing");
  replacePregens([existing]);
  const incoming=await entryFor(fighter(6,"Tampered"),"tampered");
  incoming.character.abilities.str+=1;
  await assert.rejects(()=>importPregenBackupJson(envelope([incoming])),/integrity check failed/i);
  assert.equal(loadPregens().length,1);
  assert.equal(loadPregens()[0].id,"existing");
});

test("backup operations refuse to overwrite unreadable local pregen data",async()=>{
  reset();
  localStorage.setItem(PREGEN_STORAGE_KEY,"{broken-json");
  const incoming=await entryFor(fighter(6,"Recovery Candidate"),"incoming");
  await assert.rejects(()=>importPregenBackupJson(envelope([incoming])),/corrupted and could not be read safely/i);
  await assert.rejects(()=>exportPregenBackupJson(),/corrupted and could not be read safely/i);
  assert.equal(localStorage.getItem(PREGEN_STORAGE_KEY),"{broken-json");
});

test("backup import rejects unsupported future entry and backup schemas",async()=>{
  reset();
  const entry=await entryFor(fighter());
  const futureEntry=structuredClone(entry);
  futureEntry.schemaVersion=PREGEN_ENTRY_SCHEMA_VERSION+1;
  await assert.rejects(()=>importPregenBackupJson(envelope([futureEntry])),/newer than this Character Forge supports/i);
  const futureBackup=JSON.stringify({format:PREGEN_BACKUP_FORMAT,schemaVersion:PREGEN_BACKUP_SCHEMA_VERSION+1,entries:[entry]});
  await assert.rejects(()=>importPregenBackupJson(futureBackup),/newer than this Character Forge supports/i);
});

test("backup import rejects wrong formats and invalid JSON",async()=>{
  reset();
  await assert.rejects(()=>importPregenBackupJson("not-json"),/not valid JSON/i);
  await assert.rejects(()=>importPregenBackupJson(JSON.stringify({format:"someone-elses-file",schemaVersion:1,entries:[]})),/not a Character Forge pregen backup/i);
});

test("backup restore skips mechanical duplicates and repairs id collisions",async()=>{
  reset();
  const existing=await entryFor(fighter(5,"Existing Hero"),"same-id");
  replacePregens([existing]);
  const duplicate=structuredClone(existing);
  const different=await entryFor(fighter(6,"Different Hero"),"same-id");
  const result=await importPregenBackupJson(envelope([duplicate,different]));
  assert.equal(result.added,1);
  assert.equal(result.skipped,1);
  const restored=loadPregens();
  assert.equal(restored.length,2);
  assert.equal(new Set(restored.map(entry=>entry.id)).size,2);
  assert.equal(new Set(restored.map(entry=>entry.fingerprint)).size,2);
});

test("backup export refuses entries that fail the RAW trust boundary",async()=>{
  reset();
  const character=fighter();
  character.sourceMode="HOMEBREW";
  const entry=await entryFor(character,"not-raw");
  await assert.rejects(()=>createPregenBackup([entry]),/non-RAW pregen/i);
});

test("pregen library UI exposes accessible backup controls and routes imports through verified backup logic",()=>{
  const source=readFileSync(new URL("../src/ui/library.js",import.meta.url),"utf8");
  assert.match(source,/id=\"exportPregenBackup\"/);
  assert.match(source,/id=\"importPregenBackup\"/);
  assert.match(source,/id=\"pregenBackupFile\"/);
  assert.match(source,/accept=\"application\/json,\.json\"/);
  assert.match(source,/exportPregenBackupJson/);
  assert.match(source,/importPregenBackupJson/);
  assert.match(source,/verified RAW pregens between browsers/);
});
