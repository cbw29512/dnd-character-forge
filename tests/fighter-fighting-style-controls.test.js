import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { classChoiceFieldsForState } from "../src/ui/class-options.js";
import { classSelectionsFromCharacter } from "../src/ui/class-selection-state.js";

function fighterState(ruleset,level,subclass="random",classSelections={}){
  try{
    const state=createInitialState();
    state.ruleset=ruleset;
    state.constraints.level=String(level);
    state.constraints.class="fighter";
    state.constraints.subclass=subclass;
    state.constraints.species="human";
    state.constraints.background=ruleset==="2014"?"acolyte":"soldier";
    state.classSelections={...classSelections};
    return state;
  }catch(error){
    console.error("[fighter-style-controls-test] state fixture failed",error);
    throw error;
  }
}

function fields(ruleset,level,subclass="random",classSelections={}){
  try{return classChoiceFieldsForState(fighterState(ruleset,level,subclass,classSelections));}
  catch(error){console.error("[fighter-style-controls-test] field lookup failed",error);throw error;}
}

test("Fighter exposes a primary Fighting Style from level 1 in both editions",()=>{
  for(const ruleset of ["2014","2024"]){
    const field=fields(ruleset,1).find(item=>item.key==="fightingStyle");
    assert.ok(field,`${ruleset} Fighter primary Fighting Style missing`);
    assert.ok(field.options.length>=3);
  }
});

test("Champion additional Fighting Style appears only at the edition-correct level",()=>{
  assert.equal(fields("2014",9,"champion").some(item=>item.key==="additionalFightingStyle"),false);
  assert.equal(fields("2014",10,"champion").some(item=>item.key==="additionalFightingStyle"),true);
  assert.equal(fields("2024",6,"champion").some(item=>item.key==="additionalFightingStyle"),false);
  assert.equal(fields("2024",7,"champion").some(item=>item.key==="additionalFightingStyle"),true);
});

test("fixed 2014 Fighter styles choose compatible equipment packages",()=>{
  const archer=generateCharacter(fighterState("2014",1,"random",{fightingStyle:"archery"}));
  assert.equal(archer.fightingStyle.id,"archery");
  assert.equal(archer.equipment.id,"shield");
  const greatWeapon=generateCharacter(fighterState("2014",1,"random",{fightingStyle:"great-weapon"}));
  assert.equal(greatWeapon.fightingStyle.id,"great-weapon");
  assert.equal(greatWeapon.equipment.id,"greatsword");
});

test("fixed 2024 Fighter styles choose compatible equipment packages",()=>{
  const twoWeapon=generateCharacter(fighterState("2024",1,"random",{fightingStyle:"two-weapon"}));
  assert.equal(twoWeapon.fightingStyle.id,"two-weapon");
  assert.equal(twoWeapon.equipment.id,"light");
  const greatWeapon=generateCharacter(fighterState("2024",1,"random",{fightingStyle:"great-weapon"}));
  assert.equal(greatWeapon.fightingStyle.id,"great-weapon");
  assert.equal(greatWeapon.equipment.id,"heavy");
});

test("Champion can lock two distinct Fighting Styles",()=>{
  const c2014=generateCharacter(fighterState("2014",10,"champion",{fightingStyle:"great-weapon",additionalFightingStyle:"archery"}));
  assert.deepEqual(c2014.fightingStyles.map(style=>style.id),["great-weapon","archery"]);
  const c2024=generateCharacter(fighterState("2024",7,"champion",{fightingStyle:"archery",additionalFightingStyle:"great-weapon"}));
  assert.deepEqual(c2024.fightingStyles.map(style=>style.id),["archery","great-weapon"]);
});

test("additional Fighter style cannot duplicate the primary or appear before unlock",()=>{
  assert.throws(()=>generateCharacter(fighterState("2014",10,"champion",{fightingStyle:"defense",additionalFightingStyle:"defense"})),/must be different/);
  assert.throws(()=>generateCharacter(fighterState("2024",6,"champion",{additionalFightingStyle:"archery"})),/unavailable at this level/);
});

test("saved Fighter restores primary and additional Fighting Styles",()=>{
  const restored=classSelectionsFromCharacter({class:{id:"fighter"},fightingStyle:{id:"defense"},fightingStyles:[{id:"defense"},{id:"archery"}]});
  assert.deepEqual(restored,{fightingStyle:"defense",additionalFightingStyle:"archery"});
});
