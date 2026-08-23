import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { fighterProgressionFor } from "../src/rules/fighter.js";
import { buildQuickReference } from "../src/rules/reference.js";
import { pregenFingerprintPayload } from "../src/library/fingerprint.js";

function fighterAt(level,subclass="champion"){
  try{
    const state=createInitialState();
    state.ruleset="2024";
    state.constraints.level=String(level);
    state.constraints.class="fighter";
    state.constraints.subclass=level>=3?subclass:"random";
    state.constraints.species="human";
    state.constraints.background="soldier";
    return generateCharacter(state);
  }catch(error){console.error(`[test] Fighter level ${level}`,error);throw error;}
}

test("2024 Champion generates and validates at every level 1 through 20",()=>{
  try{for(let level=1;level<=20;level++){const character=fighterAt(level);assert.equal(character.level,level);assert.equal(character.class.id,"fighter");assert.equal(character.validation.valid,true);if(level>=3)assert.equal(character.subclass.id,"champion");}}
  catch(error){console.error("[test] Fighter 1-20 matrix",error);throw error;}
});

test("2024 Fighter resource progression matches exact breakpoint table",()=>{
  try{
    const cases=[
      [1,{secondWindUses:2,actionSurgeUses:0,indomitableUses:0,masteryCount:3,attacksPerAction:1}],
      [2,{secondWindUses:2,actionSurgeUses:1,indomitableUses:0,masteryCount:3,attacksPerAction:1}],
      [4,{secondWindUses:3,actionSurgeUses:1,indomitableUses:0,masteryCount:4,attacksPerAction:1}],
      [5,{secondWindUses:3,actionSurgeUses:1,indomitableUses:0,masteryCount:4,attacksPerAction:2}],
      [9,{secondWindUses:3,actionSurgeUses:1,indomitableUses:1,masteryCount:4,attacksPerAction:2}],
      [10,{secondWindUses:4,actionSurgeUses:1,indomitableUses:1,masteryCount:5,attacksPerAction:2}],
      [11,{secondWindUses:4,actionSurgeUses:1,indomitableUses:1,masteryCount:5,attacksPerAction:3}],
      [13,{secondWindUses:4,actionSurgeUses:1,indomitableUses:2,masteryCount:5,attacksPerAction:3}],
      [16,{secondWindUses:4,actionSurgeUses:1,indomitableUses:2,masteryCount:6,attacksPerAction:3}],
      [17,{secondWindUses:4,actionSurgeUses:2,indomitableUses:3,masteryCount:6,attacksPerAction:3}],
      [20,{secondWindUses:4,actionSurgeUses:2,indomitableUses:3,masteryCount:6,attacksPerAction:4}]
    ];
    for(const [level,expected] of cases){const actual=fighterProgressionFor("2024",level,level>=3?"champion":null);for(const [key,value] of Object.entries(expected))assert.equal(actual[key],value,`level ${level} ${key}`);}
  }catch(error){console.error("[test] Fighter progression breakpoints",error);throw error;}
});

test("Champion critical and initiative progression is exact",()=>{
  try{
    assert.equal(fighterProgressionFor("2024",2,null).criticalMinimum,20);
    assert.equal(fighterProgressionFor("2024",3,"champion").criticalMinimum,19);
    assert.equal(fighterProgressionFor("2024",14,"champion").criticalMinimum,19);
    assert.equal(fighterProgressionFor("2024",15,"champion").criticalMinimum,18);
    assert.equal(fighterAt(3).initiativeAdvantage,true);
    assert.equal(fighterAt(20).initiativeAdvantage,true);
  }catch(error){console.error("[test] Champion critical progression",error);throw error;}
});

test("Champion gains a second distinct Fighting Style at level 7",()=>{
  try{for(let i=0;i<30;i++){const before=fighterAt(6),after=fighterAt(7);assert.equal(before.fightingStyles.length,1);assert.equal(after.fightingStyles.length,2);assert.equal(new Set(after.fightingStyles.map(style=>style.id)).size,2);}}
  catch(error){console.error("[test] Champion Fighting Styles",error);throw error;}
});

test("Fighter ASI schedule applies all six legal opportunities by level 16",()=>{
  try{
    const level3=fighterAt(3),level4=fighterAt(4),level6=fighterAt(6),level8=fighterAt(8),level16=fighterAt(16);
    const total=character=>Object.values(character.abilities).reduce((sum,value)=>sum+value,0);
    assert.ok(total(level4)>total(level3));
    assert.ok(total(level6)>total(level4));
    assert.ok(total(level8)>total(level6));
    assert.ok(total(level16)>total(level8));
    for(const value of Object.values(level16.abilities))assert.ok(value<=20);
  }catch(error){console.error("[test] Fighter ASI schedule",error);throw error;}
});

test("level 19 Fighter receives Boon of Combat Prowess with legal ability adjustment",()=>{
  try{const character=fighterAt(19);const boon=character.feats.find(feat=>feat.id==="boon-combat-prowess");assert.ok(boon);assert.ok(character.epicBoonAbility);assert.equal(character.abilityMaximums[character.epicBoonAbility],30);assert.ok(character.abilities[character.epicBoonAbility]<=30);}
  catch(error){console.error("[test] Fighter Epic Boon",error);throw error;}
});

test("level 20 Champion exposes only current attack and critical tiers",()=>{
  try{const character=fighterAt(20);assert.equal(character.fighter.attacksPerAction,4);assert.equal(character.fighter.criticalMinimum,18);assert.ok(character.features.includes("Three Extra Attacks"));assert.ok(character.features.includes("Superior Critical"));assert.ok(!character.features.includes("Extra Attack"));assert.ok(!character.features.includes("Two Extra Attacks"));assert.ok(!character.features.includes("Improved Critical"));}
  catch(error){console.error("[test] current Fighter feature tiers",error);throw error;}
});

test("level 20 Champion play references are fully sourced",()=>{
  try{const character=fighterAt(20),references=buildQuickReference(character);assert.ok(references.some(item=>item.name==="Boon of Combat Prowess"));assert.ok(references.some(item=>item.name==="Survivor"));assert.equal(references.filter(item=>item.category==="Fighting Style").length,2);for(const item of references){assert.equal(item.source.version,"SRD 5.2.1");assert.ok(item.source.page);assert.match(item.source.pdfUrl,/\.pdf$/);}}
  catch(error){console.error("[test] level-20 provenance",error);throw error;}
});

test("Fighter level 20 has proficiency +6 and six distinct mastery weapon choices",()=>{
  try{for(let i=0;i<30;i++){const character=fighterAt(20);assert.equal(character.proficiency,6);assert.equal(character.masteryIds.length,6);assert.equal(new Set(character.masteryIds).size,6);}}
  catch(error){console.error("[test] level-20 proficiency/masteries",error);throw error;}
});

test("unsupported level 6 Cleric still fails closed",()=>{
  try{const state=createInitialState();state.ruleset="2024";state.constraints.level="6";state.constraints.class="cleric";assert.throws(()=>generateCharacter(state),/currently supports levels/);}
  catch(error){console.error("[test] Cleric level ceiling",error);throw error;}
});

test("Random 2024 Fighter level can legally span 1 through 20",()=>{
  try{const state=createInitialState();state.ruleset="2024";state.constraints.class="fighter";const levels=new Set();for(let i=0;i<500;i++){const character=generateCharacter(state);assert.ok(character.level>=1&&character.level<=20);levels.add(character.level);}assert.ok([...levels].some(level=>level>5));}
  catch(error){console.error("[test] random Fighter level span",error);throw error;}
});

test("pregen fingerprint includes both Fighting Styles and Epic Boon ability state",()=>{
  try{const character=fighterAt(20),payload=pregenFingerprintPayload(character);assert.equal(payload.fightingStyles.length,2);assert.ok(payload.epicBoonAbility);assert.equal(payload.abilityMaximums[payload.epicBoonAbility],30);}
  catch(error){console.error("[test] Fighter fingerprint",error);throw error;}
});
