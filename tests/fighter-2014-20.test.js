import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { fighterProgressionFor } from "../src/rules/fighter.js";
import { applyClassAsi } from "../src/rules/features.js";
import { buildQuickReference } from "../src/rules/reference.js";

function fighterAt(level,subclass="champion"){
  try{
    const state=createInitialState();
    state.ruleset="2014";
    state.constraints.level=String(level);
    state.constraints.class="fighter";
    state.constraints.subclass=level>=3?subclass:"random";
    state.constraints.species="human";
    state.constraints.background="acolyte";
    return generateCharacter(state);
  }catch(error){console.error(`[test] 2014 Fighter level ${level}`,error);throw error;}
}

test("2014 Champion generates and validates at every level 1 through 20",()=>{
  try{for(let level=1;level<=20;level++){const character=fighterAt(level);assert.equal(character.level,level);assert.equal(character.class.id,"fighter");assert.equal(character.validation.valid,true);if(level>=3)assert.equal(character.subclass.id,"champion");}}
  catch(error){console.error("[test] 2014 Fighter 1-20 matrix",error);throw error;}
});

test("2014 Fighter resource progression matches exact breakpoint table",()=>{
  try{
    const cases=[
      [1,{secondWindUses:1,actionSurgeUses:0,indomitableUses:0,masteryCount:0,attacksPerAction:1}],
      [2,{secondWindUses:1,actionSurgeUses:1,indomitableUses:0,masteryCount:0,attacksPerAction:1}],
      [5,{secondWindUses:1,actionSurgeUses:1,indomitableUses:0,masteryCount:0,attacksPerAction:2}],
      [9,{secondWindUses:1,actionSurgeUses:1,indomitableUses:1,masteryCount:0,attacksPerAction:2}],
      [11,{secondWindUses:1,actionSurgeUses:1,indomitableUses:1,masteryCount:0,attacksPerAction:3}],
      [13,{secondWindUses:1,actionSurgeUses:1,indomitableUses:2,masteryCount:0,attacksPerAction:3}],
      [17,{secondWindUses:1,actionSurgeUses:2,indomitableUses:3,masteryCount:0,attacksPerAction:3}],
      [20,{secondWindUses:1,actionSurgeUses:2,indomitableUses:3,masteryCount:0,attacksPerAction:4}]
    ];
    for(const [level,expected] of cases){const actual=fighterProgressionFor("2014",level,level>=3?"champion":null);for(const [key,value] of Object.entries(expected))assert.equal(actual[key],value,`level ${level} ${key}`);}
  }catch(error){console.error("[test] 2014 Fighter progression breakpoints",error);throw error;}
});

test("2014 Champion critical progression is exact and never grants initiative Advantage",()=>{
  try{
    assert.equal(fighterProgressionFor("2014",2,null).criticalMinimum,20);
    assert.equal(fighterProgressionFor("2014",3,"champion").criticalMinimum,19);
    assert.equal(fighterProgressionFor("2014",14,"champion").criticalMinimum,19);
    assert.equal(fighterProgressionFor("2014",15,"champion").criticalMinimum,18);
    assert.equal(fighterAt(7).initiativeAdvantage,false);
    assert.equal(fighterAt(20).initiativeAdvantage,false);
  }catch(error){console.error("[test] 2014 Champion critical progression",error);throw error;}
});

test("2014 Champion gains a second distinct Fighting Style at level 10",()=>{
  try{for(let i=0;i<30;i++){const before=fighterAt(9),after=fighterAt(10);assert.equal(before.fightingStyles.length,1);assert.equal(after.fightingStyles.length,2);assert.equal(new Set(after.fightingStyles.map(style=>style.id)).size,2);}}
  catch(error){console.error("[test] 2014 Champion Fighting Styles",error);throw error;}
});

test("2014 Fighter ASI schedule spends all seven legal two-point opportunities by level 19",()=>{
  try{
    const total=character=>Object.values(character.abilities).reduce((sum,value)=>sum+value,0);
    const level3=fighterAt(3),level19=fighterAt(19);
    assert.equal(total(level19),total(level3)+14);
    for(const value of Object.values(level19.abilities))assert.ok(value<=20);
  }catch(error){console.error("[test] 2014 Fighter ASI schedule",error);throw error;}
});

test("ASI allocator uses +1/+1 instead of discarding a point when the priority score is 19",()=>{
  try{
    const scores={str:19,dex:19,con:18,int:10,wis:10,cha:10};
    const result=applyClassAsi(scores,4,["str","dex","con","wis","cha","int"],[4]);
    assert.equal(result.str,20);
    assert.equal(result.dex,20);
    assert.equal(Object.values(result).reduce((sum,value)=>sum+value,0),Object.values(scores).reduce((sum,value)=>sum+value,0)+2);
  }catch(error){console.error("[test] legal ASI split allocation",error);throw error;}
});

test("2014 level 20 Champion has four attacks, two Action Surges, three Indomitables, and no 2024-only systems",()=>{
  try{
    const character=fighterAt(20);
    assert.equal(character.fighter.attacksPerAction,4);
    assert.equal(character.fighter.actionSurgeUses,2);
    assert.equal(character.fighter.indomitableUses,3);
    assert.equal(character.fighter.masteryCount,0);
    assert.equal(character.masteryIds.length,0);
    assert.equal(character.proficiency,6);
    assert.ok(!character.feats.some(feat=>feat.id==="boon-combat-prowess"));
    assert.equal(character.epicBoonAbility,null);
  }catch(error){console.error("[test] 2014 level-20 resources",error);throw error;}
});

test("2014 Champion high-level play references stay edition-correct",()=>{
  try{
    const character=fighterAt(20),refs=buildQuickReference(character);
    const actionSurge=refs.find(item=>item.name==="Action Surge"),indomitable=refs.find(item=>item.name==="Indomitable"),athlete=refs.find(item=>item.name==="Remarkable Athlete"),survivor=refs.find(item=>item.name==="Survivor"),extra=refs.find(item=>item.name==="Extra Attack");
    assert.match(actionSurge.text,/2 uses/);
    assert.doesNotMatch(actionSurge.text,/Magic action/i);
    assert.match(indomitable.text,/3 uses/);
    assert.doesNotMatch(indomitable.text,/\+20 bonus/);
    assert.match(athlete.text,/Strength, Dexterity, or Constitution checks/);
    assert.doesNotMatch(athlete.text,/Advantage on Initiative/);
    assert.match(survivor.text,/no more than half your maximum HP/);
    assert.doesNotMatch(survivor.text,/Death Saving Throws/);
    assert.match(extra.text,/four times/);
  }catch(error){console.error("[test] 2014 edition-correct references",error);throw error;}
});

test("2014 level 20 Champion play references are fully sourced to SRD 5.1",()=>{
  try{
    const references=buildQuickReference(fighterAt(20));
    const highLevel=new Map(references.map(item=>[item.name,item]));
    for(const name of ["Action Surge","Ability Score Improvement","Extra Attack","Remarkable Athlete","Indomitable","Additional Fighting Style","Superior Critical","Survivor"]){const item=highLevel.get(name);assert.ok(item,`${name} missing`);assert.equal(item.source.version,"SRD 5.1");assert.equal(item.source.page,"25");assert.match(item.source.pdfUrl,/SRD_CC_v5\.1\.pdf$/);}
  }catch(error){console.error("[test] 2014 level-20 provenance",error);throw error;}
});

test("2014 level 20 ASI reference reports all seven earned opportunities",()=>{
  try{const item=buildQuickReference(fighterAt(20)).find(ref=>ref.name==="Ability Score Improvement");assert.match(item.text,/7 Ability Score Improvement opportunities/);}
  catch(error){console.error("[test] 2014 ASI reference count",error);throw error;}
});

test("2014 Cleric level 6 remains fail-closed after Wizard expansion",()=>{
  try{const state=createInitialState();state.ruleset="2014";state.constraints.level="6";state.constraints.class="cleric";assert.throws(()=>generateCharacter(state),/currently supports levels/);}
  catch(error){console.error("[test] 2014 Cleric level ceiling",error);throw error;}
});

test("Random 2014 Fighter level can legally span 1 through 20",()=>{
  try{const state=createInitialState();state.ruleset="2014";state.constraints.class="fighter";const levels=new Set();for(let i=0;i<500;i++){const character=generateCharacter(state);assert.ok(character.level>=1&&character.level<=20);levels.add(character.level);}assert.ok([...levels].some(level=>level>5));}
  catch(error){console.error("[test] random 2014 Fighter level span",error);throw error;}
});
