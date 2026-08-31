import test from "node:test";
import assert from "node:assert/strict";
import { PREGEN_SCHEMA_VERSION, currentPregenEntry, migratePregenEntry } from "../src/library/pregen-schema.js";
import { loadPregens } from "../src/library/local-library.js";
import { validEntryShape } from "../src/library/pregen-integrity.js";

const legacy=()=>({id:"legacy-1",fingerprint:"abc123",name:"Legacy Hero",character:{ruleset:"2024",class:{id:"fighter"}}});

test("legacy pregens migrate explicitly to the current schema without rewriting character mechanics",()=>{
  const entry=legacy(),migrated=migratePregenEntry(entry);
  assert.equal(PREGEN_SCHEMA_VERSION,1);
  assert.equal(migrated.schemaVersion,1);
  assert.deepEqual(migrated.character,entry.character);
  assert.equal(validEntryShape(entry),true,"legacy pre-v1 entries must remain readable through migration");
  assert.equal(currentPregenEntry(migrated),true);
});

test("malformed and future-version pregens fail closed",()=>{
  assert.equal(migratePregenEntry(null),null);
  assert.equal(migratePregenEntry({id:"x",fingerprint:"f"}),null);
  assert.equal(migratePregenEntry({...legacy(),schemaVersion:PREGEN_SCHEMA_VERSION+1}),null);
  assert.equal(migratePregenEntry({...legacy(),schemaVersion:0}),null);
  assert.equal(validEntryShape({...legacy(),schemaVersion:99}),false);
});

test("library loading quarantines individual bad entries instead of poisoning valid saved pregens",()=>{
  const payload=[legacy(),{id:"broken",fingerprint:"bad"},{...legacy(),id:"future",schemaVersion:99}];
  const previous=globalThis.localStorage;
  globalThis.localStorage={getItem:key=>key==="character-forge:pregen-library:v1"?JSON.stringify(payload):null,setItem:()=>{}};
  try{
    const loaded=loadPregens();
    assert.equal(loaded.length,1);
    assert.equal(loaded[0].id,"legacy-1");
    assert.equal(loaded[0].schemaVersion,PREGEN_SCHEMA_VERSION);
  }finally{
    if(previous===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous;
  }
});
