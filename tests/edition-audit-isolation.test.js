import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";

function make(ruleset,classId,subclass,background){
  try{
    const state=createInitialState();
    state.ruleset=ruleset;
    state.constraints.level="20";
    state.constraints.class=classId;
    state.constraints.subclass=subclass;
    state.constraints.species="human";
    state.constraints.background=background;
    if(classId==="paladin")state.classSelections={fightingStyle:"defense"};
    return generateCharacter(state);
  }catch(error){console.error(`[test] ${ruleset} ${classId} audit isolation`,error);throw error;}
}

function auditText(character){return character.audit.checks.join(" ");}

test("2014 Barbarian audit never names 2024-only mechanics",()=>{
  const text=auditText(make("2014","barbarian","berserker","acolyte"));
  assert.match(text,/Brutal Critical/);
  for(const forbidden of ["Weapon Mastery","Brutal Strike","Epic Boon"])assert.equal(text.includes(forbidden),false,`2014 Barbarian audit leaked ${forbidden}`);
});

test("2024 Barbarian audit never names 2014-only Brutal Critical",()=>{
  const text=auditText(make("2024","barbarian","berserker","soldier"));
  assert.match(text,/Weapon Mastery/);
  assert.match(text,/Brutal Strike/);
  assert.equal(text.includes("Brutal Critical"),false);
});

test("2014 Paladin audit never names 2024-only mechanics",()=>{
  const text=auditText(make("2014","paladin","oath-devotion","acolyte"));
  assert.match(text,/Divine Sense/);
  assert.match(text,/Divine Smite/);
  assert.match(text,/Cleansing Touch/);
  for(const forbidden of ["Weapon Mastery","Paladin's Smite","Abjure Foes","Radiant Strikes","Restoring Touch","Epic Boon"])assert.equal(text.includes(forbidden),false,`2014 Paladin audit leaked ${forbidden}`);
});

test("2024 Paladin audit never names 2014-only class mechanics",()=>{
  const text=auditText(make("2024","paladin","oath-devotion","soldier"));
  assert.match(text,/Weapon Mastery/);
  assert.match(text,/Paladin's Smite/);
  assert.match(text,/Restoring Touch/);
  for(const forbidden of ["Divine Sense","Improved Divine Smite","Cleansing Touch","Purity of Spirit","Turn the Unholy"])assert.equal(text.includes(forbidden),false,`2024 Paladin audit leaked ${forbidden}`);
});
