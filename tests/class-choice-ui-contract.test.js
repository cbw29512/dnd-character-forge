import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { classChoiceFieldsForState } from "../src/ui/class-options.js";

function stateFor(ruleset,classId,level,subclass="random",classSelections={}){const state=createInitialState();state.ruleset=ruleset;state.constraints.class=classId;state.constraints.level=String(level);state.constraints.subclass=subclass;state.classSelections=classSelections;return state;}
const keys=fields=>fields.map(field=>field.key);
const field=(fields,key)=>fields.find(item=>item.key===key);

test("Class Options exposes every implemented Bard, Sorcerer, Warlock, Druid, Ranger, Monk, Paladin, and Cleric choice family",()=>{
  const bard=classChoiceFieldsForState(stateFor("2014","bard",20,"college-lore"));assert.deepEqual(keys(bard),["instruments","loreBonusSkills","expertise"]);assert.equal(field(bard,"instruments").type,"multi");assert.equal(field(bard,"expertise").max,4);
  const sorcerer=classChoiceFieldsForState(stateFor("2024","sorcerer",20,"draconic-sorcery"));assert.deepEqual(keys(sorcerer),["metamagic","elementalAffinity"]);assert.equal(field(sorcerer,"metamagic").max,6);
  const warlock2014=classChoiceFieldsForState(stateFor("2014","warlock",20,"fiend"));assert.deepEqual(keys(warlock2014),["pactBoon","eldritchInvocations"]);assert.equal(field(warlock2014,"eldritchInvocations").max,8);
  const warlock2024=classChoiceFieldsForState(stateFor("2024","warlock",20,"fiend-patron"));assert.deepEqual(keys(warlock2024),["eldritchInvocations"]);assert.equal(field(warlock2024,"eldritchInvocations").max,10);
  const druid=classChoiceFieldsForState(stateFor("2024","druid",20,"circle-land"));for(const key of ["primalOrder","circleLand","elementalFury","knownForms"])assert.ok(keys(druid).includes(key),`missing Druid ${key}`);assert.equal(field(druid,"knownForms").max,8);
  const ranger2014=classChoiceFieldsForState(stateFor("2014","ranger",20,"hunter",{favoredEnemies:["fiends"]}));for(const key of ["favoredEnemies","favoredEnemyLanguages","naturalExplorerTerrains","huntersPrey","defensiveTactics","multiattack","superiorDefense"])assert.ok(keys(ranger2014).includes(key),`missing 2014 Ranger ${key}`);assert.equal(field(ranger2014,"favoredEnemyLanguages").type,"indexed");
  const ranger2024=classChoiceFieldsForState(stateFor("2024","ranger",20,"hunter"));for(const key of ["fightingStyle","huntersPrey","defensiveTactics"])assert.ok(keys(ranger2024).includes(key),`missing 2024 Ranger ${key}`);
  assert.ok(keys(classChoiceFieldsForState(stateFor("2024","monk",20,"open-hand"))).includes("monkTool"));assert.ok(keys(classChoiceFieldsForState(stateFor("2024","paladin",20,"oath-devotion"))).includes("fightingStyle"));for(const key of ["divineOrder","blessedStrikes"])assert.ok(keys(classChoiceFieldsForState(stateFor("2024","cleric",20,"life-domain"))).includes(key));
});

test("Class Options keeps unavailable choices out at low levels",()=>{
  assert.deepEqual(keys(classChoiceFieldsForState(stateFor("2014","sorcerer",2,"draconic-bloodline"))),["draconicAncestry"]);
  assert.deepEqual(keys(classChoiceFieldsForState(stateFor("2014","warlock",2,"fiend"))),["eldritchInvocations"]);
  assert.deepEqual(keys(classChoiceFieldsForState(stateFor("2024","warlock",1,"fiend-patron"))),["eldritchInvocations"]);
  assert.ok(!keys(classChoiceFieldsForState(stateFor("2024","druid",3,"circle-land"))).includes("elementalFury"));
  assert.ok(!keys(classChoiceFieldsForState(stateFor("2014","ranger",6,"hunter"))).includes("defensiveTactics"));
});
