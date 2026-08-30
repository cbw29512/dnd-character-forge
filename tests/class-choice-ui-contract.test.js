import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { classChoiceFieldsForState } from "../src/ui/class-options.js";

function stateFor(ruleset,classId,level,subclass="random",classSelections={}){const state=createInitialState();state.ruleset=ruleset;state.constraints.class=classId;state.constraints.level=String(level);state.constraints.subclass=subclass;state.classSelections=classSelections;return state;}
const keys=fields=>fields.map(field=>field.key);
const baseKeys=fields=>[...new Set(keys(fields).filter(key=>key!=="advancements"))];
const advancementFields=fields=>fields.filter(item=>item.key==="advancements");
const field=(fields,key)=>fields.find(item=>item.key===key);

test("Class Options exposes every implemented Bard, Sorcerer, Warlock, Druid, Ranger, Monk, Paladin, and Cleric choice family",()=>{
  const bard=classChoiceFieldsForState(stateFor("2014","bard",20,"college-lore"));assert.deepEqual(baseKeys(bard),["classSkills","instruments","loreBonusSkills","expertise"]);assert.equal(field(bard,"classSkills").max,3);assert.equal(field(bard,"instruments").type,"multi");assert.equal(field(bard,"expertise").max,4);assert.ok(advancementFields(bard).length>0);assert.ok(advancementFields(bard).every(item=>item.type==="indexed"&&item.defaultLabel==="Automatic ASI"));
  const sorcerer=classChoiceFieldsForState(stateFor("2024","sorcerer",20,"draconic-sorcery"));assert.deepEqual(baseKeys(sorcerer),["equipmentPackage","classSkills","metamagic","elementalAffinity"]);assert.equal(field(sorcerer,"metamagic").max,6);assert.ok(advancementFields(sorcerer).length>0);
  const warlock2014=classChoiceFieldsForState(stateFor("2014","warlock",20,"fiend"));assert.deepEqual(baseKeys(warlock2014),["classSkills","pactBoon","eldritchInvocations"]);assert.equal(field(warlock2014,"eldritchInvocations").max,8);assert.ok(advancementFields(warlock2014).length>0);
  const warlock2024=classChoiceFieldsForState(stateFor("2024","warlock",20,"fiend-patron")),warlock2024Slots=warlock2024.filter(item=>item.key==="eldritchInvocations");assert.deepEqual(baseKeys(warlock2024),["equipmentPackage","classSkills","eldritchInvocations"]);assert.equal(warlock2024Slots.length,10);assert.ok(warlock2024Slots.every((item,index)=>item.type==="indexed"&&item.index===index));assert.ok(advancementFields(warlock2024).length>0);
  const druid=classChoiceFieldsForState(stateFor("2024","druid",20,"circle-land"));for(const key of ["equipmentPackage","classSkills","primalOrder","circleLand","elementalFury","knownForms"])assert.ok(keys(druid).includes(key),`missing Druid ${key}`);assert.equal(field(druid,"knownForms").max,8);assert.ok(advancementFields(druid).length>0);
  const ranger2014=classChoiceFieldsForState(stateFor("2014","ranger",20,"hunter",{favoredEnemies:["fiends"]}));for(const key of ["classSkills","favoredEnemies","favoredEnemyLanguages","naturalExplorerTerrains","huntersPrey","defensiveTactics","multiattack","superiorDefense"])assert.ok(keys(ranger2014).includes(key),`missing 2014 Ranger ${key}`);assert.equal(field(ranger2014,"favoredEnemyLanguages").type,"indexed");assert.ok(advancementFields(ranger2014).length>0);
  const ranger2024=classChoiceFieldsForState(stateFor("2024","ranger",20,"hunter"));for(const key of ["equipmentPackage","classSkills","fightingStyle","expertise","deftExplorerLanguages","huntersPrey","defensiveTactics"])assert.ok(keys(ranger2024).includes(key),`missing 2024 Ranger ${key}`);assert.ok(advancementFields(ranger2024).length>0);
  const monk=classChoiceFieldsForState(stateFor("2024","monk",20,"open-hand")),paladin=classChoiceFieldsForState(stateFor("2024","paladin",20,"oath-devotion")),cleric=classChoiceFieldsForState(stateFor("2024","cleric",20,"life-domain"));for(const fields of [monk,paladin,cleric])assert.ok(keys(fields).includes("equipmentPackage"));assert.ok(keys(monk).includes("classSkills"));assert.ok(keys(monk).includes("monkTool"));assert.ok(keys(paladin).includes("classSkills"));assert.ok(keys(paladin).includes("fightingStyle"));for(const key of ["classSkills","divineOrder","blessedStrikes"])assert.ok(keys(cleric).includes(key));for(const fields of [monk,paladin,cleric])assert.ok(advancementFields(fields).length>0);
});

test("Class Options keeps unavailable choices out at low levels while retaining base class skills",()=>{
  assert.deepEqual(keys(classChoiceFieldsForState(stateFor("2014","sorcerer",2,"draconic-bloodline"))),["classSkills","draconicAncestry"]);
  assert.deepEqual(keys(classChoiceFieldsForState(stateFor("2014","warlock",2,"fiend"))),["classSkills","eldritchInvocations"]);
  assert.deepEqual(keys(classChoiceFieldsForState(stateFor("2024","warlock",1,"fiend-patron"))),["equipmentPackage","classSkills","eldritchInvocations"]);
  assert.ok(!keys(classChoiceFieldsForState(stateFor("2024","druid",3,"circle-land"))).includes("elementalFury"));
  assert.ok(!keys(classChoiceFieldsForState(stateFor("2014","ranger",6,"hunter"))).includes("defensiveTactics"));
});
