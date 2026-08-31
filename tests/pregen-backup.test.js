import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { loadPregens, savePregen } from "../src/library/local-library.js";
import { PREGEN_BACKUP_FORMAT, PREGEN_BACKUP_VERSION, exportPregenBackup, importPregenBackup } from "../src/library/pregen-backup.js";

const storage=new Map();
globalThis.localStorage={
  getItem:key=>storage.has(key)?storage.get(key):null,
  setItem:(key,value)=>storage.set(key,String(value)),
  removeItem:key=>storage.delete(key),
  clear:()=>storage.clear()
};

function fighter2024(){
  try{
    const state=createInitialState();
    state.constraints.level="5";
    state.constraints.class="fighter";
    state.constraints.species="human";
    state.constraints.background="criminal";
    return generateCharacter(state);
  }catch(error){console.error("[test] fighter fixture failed",error);throw error;}
}

async function freshBackup(){
  try{
    storage.clear();
    await savePregen(fighter2024());
    return exportPregenBackup();
  }catch(error){console.error("[test] backup fixture failed",error);throw error;}
}

test("Pregen backup exports a versioned verified envelope and restores it",async()=>{
  try{
    const json=await freshBackup();
    const backup=JSON.parse(json);
    assert.equal(backup.format,PREGEN_BACKUP_FORMAT);
    assert.equal(backup.backupVersion,PREGEN_BACKUP_VERSION);
    assert.equal(backup.pregens.length,1);
    assert.equal(backup.pregens[0].schemaVersion,1);

    storage.clear();
    const result=await importPregenBackup(json);
    assert.deepEqual(result,{imported:1,skipped:0,total:1});
    assert.equal(loadPregens().length,1);
  }catch(error){console.error("[test] backup round trip failed",error);throw error;}
});

test("Pregen backup import skips an exact duplicate without replacing it",async()=>{
  try{
    const json=await freshBackup();
    const result=await importPregenBackup(json);
    assert.deepEqual(result,{imported:0,skipped:1,total:1});
    assert.equal(loadPregens().length,1);
  }catch(error){console.error("[test] backup duplicate handling failed",error);throw error;}
});

test("Pregen backup import is transactional when a saved character is tampered",async()=>{
  try{
    const json=await freshBackup(),backup=JSON.parse(json);
    backup.pregens[0].character.abilities.str+=1;
    storage.clear();
    await assert.rejects(()=>importPregenBackup(JSON.stringify(backup)),/integrity check failed/i);
    assert.equal(loadPregens().length,0);
  }catch(error){console.error("[test] backup tamper rejection failed",error);throw error;}
});

test("Pregen backup import rejects unsupported backup versions",async()=>{
  try{
    const json=await freshBackup(),backup=JSON.parse(json);
    backup.backupVersion=PREGEN_BACKUP_VERSION+1;
    storage.clear();
    await assert.rejects(()=>importPregenBackup(JSON.stringify(backup)),/unsupported pregen backup version/i);
    assert.equal(loadPregens().length,0);
  }catch(error){console.error("[test] backup version rejection failed",error);throw error;}
});
