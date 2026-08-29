import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { FORGE_2014, FORGE_2024 } from "../src/data/forge-data.js";
import { generateCharacter } from "../src/rules/generator.js";

const EDITIONS=Object.freeze([
  Object.freeze({ruleset:"2014",data:FORGE_2014}),
  Object.freeze({ruleset:"2024",data:FORGE_2024})
]);
const LEVELS=Object.freeze([1,10,20]);
const REPEATS=6;
const ALL_RANDOM_RUNS=120;
const FINITE_FIELDS=Object.freeze(["ac","hp","initiative","speed","passivePerception","proficiency"]);

function stateFor({ruleset,classId="random",level="random"}){
  const state=createInitialState();
  state.ruleset=ruleset;
  state.constraints={...state.constraints,class:classId,level:String(level),name:""};
  return state;
}

function assertProductionCharacter(character,label){
  assert.equal(character.validation?.valid,true,`${label}: validation failed: ${(character.validation?.errors||[]).join(" | ")}`);
  assert.equal(character.audit?.status,"PASS",`${label}: Rules Audit did not pass`);
  assert.ok(character.class?.id,`${label}: class missing`);
  assert.ok(Number.isInteger(character.level)&&character.level>=1&&character.level<=20,`${label}: invalid level ${character.level}`);
  for(const field of FINITE_FIELDS)assert.equal(Number.isFinite(character[field]),true,`${label}: ${field} is not finite (${character[field]})`);
  for(const ability of ["str","dex","con","int","wis","cha"]){
    assert.equal(Number.isFinite(character.abilities?.[ability]),true,`${label}: ${ability} score is not finite`);
    assert.equal(Number.isFinite(character.saveBonuses?.[ability]),true,`${label}: ${ability} save is not finite`);
  }
  assert.ok(Array.isArray(character.skills),`${label}: skills missing`);
  assert.equal(new Set(character.skills).size,character.skills.length,`${label}: duplicate skill proficiency`);
  assert.ok(Array.isArray(character.inventory),`${label}: inventory missing`);
  for(const item of character.inventory){
    assert.equal(typeof item,"object",`${label}: unstructured inventory item`);
    assert.ok(String(item.name||"").trim(),`${label}: blank inventory item name`);
    assert.equal(Number.isFinite(item.quantity)&&item.quantity>0,true,`${label}: invalid quantity for ${item.name}`);
  }
  assert.ok(Array.isArray(character.attacks),`${label}: attacks missing`);
  for(const attack of character.attacks){
    assert.equal(Number.isFinite(attack.attackBonus),true,`${label}: invalid attack bonus for ${attack.name}`);
    assert.equal(Number.isFinite(attack.damageBonus),true,`${label}: invalid damage bonus for ${attack.name}`);
  }
  if(character.audit.rawIntegrity===false){
    assert.equal(character.subclass?.contentKind,"forge-original",`${label}: non-RAW character lacks original-content boundary`);
    assert.match(character.audit.license||"",/Character Forge Original/,`${label}: original-content license missing`);
  }else{
    assert.equal(character.audit.rawIntegrity,true,`${label}: RAW integrity missing`);
  }
}

for(const {ruleset,data} of EDITIONS){
  test(`${ruleset} repeated Random generation stays valid across every class at low/mid/high levels`,()=>{
    let generated=0;
    for(const cls of data.classes)for(const level of LEVELS)for(let iteration=1;iteration<=REPEATS;iteration++){
      const label=`${ruleset} ${cls.id} L${level} run ${iteration}/${REPEATS}`;
      const character=generateCharacter(stateFor({ruleset,classId:cls.id,level}));
      assert.equal(character.class.id,cls.id,`${label}: class drift`);
      assert.equal(character.level,level,`${label}: level drift`);
      assertProductionCharacter(character,label);
      generated++;
    }
    console.log(`[repeatability-stress] ${ruleset}: ${generated} class-scoped Random builds passed`);
  });

  test(`${ruleset} fully Random Forge survives ${ALL_RANDOM_RUNS} consecutive builds`,()=>{
    const seenClasses=new Set();
    for(let iteration=1;iteration<=ALL_RANDOM_RUNS;iteration++){
      const character=generateCharacter(stateFor({ruleset}));
      const label=`${ruleset} fully-random run ${iteration}/${ALL_RANDOM_RUNS} (${character.class?.id||"unknown"} L${character.level})`;
      assertProductionCharacter(character,label);
      seenClasses.add(character.class.id);
    }
    console.log(`[repeatability-stress] ${ruleset}: ${ALL_RANDOM_RUNS} fully Random builds passed across ${seenClasses.size} sampled classes`);
  });
}
