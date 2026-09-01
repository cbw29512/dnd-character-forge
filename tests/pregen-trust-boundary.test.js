import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { deriveCharacter } from "../src/rules/derive.js";
import { forgeDataFor } from "../src/data/forge-data.js";
import { fingerprint, pregenFingerprintPayload } from "../src/library/fingerprint.js";
import { verifyPregenEntry } from "../src/library/pregen-integrity.js";
import { legacySafeCharacter } from "../src/ui/render-safe.js";

function fighter2024(){
  const state=createInitialState();
  state.constraints.level="5";
  state.constraints.class="fighter";
  state.constraints.species="human";
  state.constraints.background="criminal";
  return generateCharacter(state);
}

async function entryFor(character){
  return{id:"test-pregen",fingerprint:await fingerprint(pregenFingerprintPayload(character)),character};
}

test("saved pregens are fingerprint-checked and revalidated before reopening",async()=>{
  const character=fighter2024(),entry=await entryFor(character);
  entry.character={...structuredClone(character),validation:{valid:true,errors:[]},audit:{status:"PASS",sourceMode:"RAW",ruleset:"2024",rawIntegrity:true,sourceVersion:"FAKE",mechanics:[{source:{version:"FAKE",page:1}}]}};
  const verified=await verifyPregenEntry(entry);
  assert.equal(verified.character.validation.valid,true);
  assert.equal(verified.character.audit.status,"PASS");
  assert.notEqual(verified.character.audit.sourceVersion,"FAKE");
});

test("saved pregen rejects mechanical tampering without a matching fingerprint",async()=>{
  const character=fighter2024(),entry=await entryFor(character);
  entry.character=structuredClone(character);
  entry.character.abilities.str+=1;
  await assert.rejects(()=>verifyPregenEntry(entry),/integrity check failed/i);
});

test("saved pregen restores catalog objects before derivation",async()=>{
  const character=fighter2024(),entry=await entryFor(character),expectedHp=character.hp;
  entry.character=structuredClone(character);
  entry.character.class={...entry.character.class,name:'<img src=x onerror="globalThis.pwned=true">',hitDie:100};
  entry.character.species={...entry.character.species,name:"Hostile Species",speed:999};
  entry.character.background={...entry.character.background,name:"<script>globalThis.pwned=true</script>",skills:[]};
  if(entry.character.subclass)entry.character.subclass={...entry.character.subclass,name:"<svg onload=globalThis.pwned=true>"};

  const verified=await verifyPregenEntry(entry);
  assert.equal(verified.character.class.name,"Fighter");
  assert.equal(verified.character.class.hitDie,10);
  assert.equal(verified.character.species.name,"Human");
  assert.equal(verified.character.background.name,"Criminal");
  if(verified.character.subclass)assert.doesNotMatch(verified.character.subclass.name,/[<>]/);
  assert.equal(verified.character.hp,expectedHp);
});

test("legacy render adapter escapes identity labels independently of catalog restoration",()=>{
  const character=structuredClone(fighter2024());
  character.class.name="<img src=x onerror=alert(1)>";
  character.background.name="<script>alert(1)</script>";
  if(character.subclass)character.subclass.name="<svg onload=alert(1)>";
  const safe=legacySafeCharacter(character);
  assert.doesNotMatch(safe.class.name,/<img/i);
  assert.match(safe.class.name,/&lt;img/i);
  assert.doesNotMatch(safe.background.name,/<script/i);
  assert.match(safe.background.name,/&lt;script/i);
  if(safe.subclass)assert.doesNotMatch(safe.subclass.name,/<svg/i);
});

test("recomputed fingerprint cannot bypass the SRD Origin-feat boundary",async()=>{
  const character=structuredClone(fighter2024());
  character.feats.push({id:"tough",name:"Tough",category:"Origin"});
  const entry=await entryFor(character);
  await assert.rejects(()=>verifyPregenEntry(entry),/Tough is not published/i);
  assert.throws(()=>deriveCharacter(character,forgeDataFor("2024")),/Tough is not published/i);
});

test("derive no longer contains dormant Tough HP mechanics",()=>{
  const source=readFileSync(new URL("../src/rules/derive.js",import.meta.url),"utf8");
  assert.doesNotMatch(source,/toughHpBonus/);
  assert.match(source,/assertSourceBoundary\(character\)/);
});

test("library open path verifies saved pregens before rendering",()=>{
  const source=readFileSync(new URL("../src/ui/library.js",import.meta.url),"utf8");
  assert.match(source,/verifyPregenEntry/);
  assert.match(source,/const verified=await verifyPregenEntry\(entry\)/);
  assert.match(source,/Fingerprint \$\{escapeHtml\(fingerprint\)\}/);
});
