import assert from "node:assert/strict";
import test from "node:test";
import { FORGE_FAMILY_NAMES, FORGE_GIVEN_NAMES, FORGE_NAME_COMBINATIONS } from "../src/data/original-names.js";
import { pick, randomCharacterName, resetRandomHistory } from "../src/rules/random.js";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";

const LEGACY_NAMES=["Aric Vale","Mira Stone","Tavian Reed","Selene Hart","Bren Ashford","Kael Rowan"];

function fighterState(name=""){
  const state=createInitialState();
  state.ruleset="2024";
  state.constraints.level="1";
  state.constraints.class="fighter";
  state.constraints.species="dwarf";
  state.constraints.background="soldier";
  state.constraints.name=name;
  return state;
}

test("Forge Original name catalog provides thousands of unique combinations",()=>{
  assert.ok(FORGE_GIVEN_NAMES.length>=64);
  assert.ok(FORGE_FAMILY_NAMES.length>=64);
  assert.equal(new Set(FORGE_GIVEN_NAMES).size,FORGE_GIVEN_NAMES.length);
  assert.equal(new Set(FORGE_FAMILY_NAMES).size,FORGE_FAMILY_NAMES.length);
  assert.equal(FORGE_NAME_COMBINATIONS,FORGE_GIVEN_NAMES.length*FORGE_FAMILY_NAMES.length);
  assert.ok(FORGE_NAME_COMBINATIONS>=4000);
});

test("six consecutive Random characters do not repeat given names or surnames",()=>{
  resetRandomHistory();
  const names=Array.from({length:6},()=>randomCharacterName()),parts=names.map(name=>name.split(" "));
  assert.equal(new Set(names).size,6);
  assert.equal(new Set(parts.map(([given])=>given)).size,6);
  assert.equal(new Set(parts.map(([,family])=>family)).size,6);
});

test("legacy six-name generator call is transparently upgraded to the broad name system",()=>{
  resetRandomHistory();
  const originalRandom=Math.random;
  try{
    Math.random=()=>0;
    const name=pick(LEGACY_NAMES);
    assert.equal(name,`${FORGE_GIVEN_NAMES[0]} ${FORGE_FAMILY_NAMES[0]}`);
    assert.equal(LEGACY_NAMES.includes(name),false);
  }finally{Math.random=originalRandom;resetRandomHistory();}
});

test("history avoids repeated identity parts even with a constant RNG",()=>{
  resetRandomHistory();
  const originalRandom=Math.random;
  try{
    Math.random=()=>0;
    const names=Array.from({length:6},()=>randomCharacterName()),parts=names.map(name=>name.split(" "));
    assert.equal(new Set(parts.map(([given])=>given)).size,6);
    assert.equal(new Set(parts.map(([,family])=>family)).size,6);
  }finally{Math.random=originalRandom;resetRandomHistory();}
});

test("blank generator names use the expanded pool while explicit names remain untouched",()=>{
  resetRandomHistory();
  const generated=generateCharacter(fighterState()),[given,family]=generated.name.split(" ");
  assert.ok(FORGE_GIVEN_NAMES.includes(given));
  assert.ok(FORGE_FAMILY_NAMES.includes(family));
  const explicit=generateCharacter(fighterState("Captain Marrow"));
  assert.equal(explicit.name,"Captain Marrow");
});
