import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { classChoiceFieldsForState } from "../src/ui/class-options.js";
import { classSelectionsFromCharacter } from "../src/ui/class-selection-state.js";

function stateFor(classId,level){
  try{
    const state=createInitialState();
    state.ruleset="2014";
    state.constraints.class=classId;
    state.constraints.level=String(level);
    state.constraints.subclass="random";
    state.constraints.background="acolyte";
    return state;
  }catch(error){
    console.error("[2014-fighting-style-ui-test] state fixture failed",error);
    throw error;
  }
}

function fightingStyleField(classId,level=2){
  try{
    return classChoiceFieldsForState(stateFor(classId,level)).find(field=>field.key==="fightingStyle")||null;
  }catch(error){
    console.error("[2014-fighting-style-ui-test] field lookup failed",error);
    throw error;
  }
}

test("2014 Paladin exposes its Fighting Style picker at level 2",()=>{
  const field=fightingStyleField("paladin");
  assert.ok(field);
  assert.deepEqual(field.options.map(option=>option.id),["defense","dueling","great-weapon","protection"]);
});

test("2014 Ranger exposes its Fighting Style picker at level 2",()=>{
  const field=fightingStyleField("ranger");
  assert.ok(field);
  assert.deepEqual(field.options.map(option=>option.id),["archery","defense","dueling","two-weapon"]);
});

test("2014 Fighting Style pickers remain hidden before level 2",()=>{
  assert.equal(fightingStyleField("paladin",1),null);
  assert.equal(fightingStyleField("ranger",1),null);
});

test("saved Paladin and Ranger styles reconstruct into Forge state",()=>{
  assert.deepEqual(classSelectionsFromCharacter({class:{id:"paladin"},fightingStyle:{id:"dueling"}}),{fightingStyle:"dueling"});
  assert.deepEqual(classSelectionsFromCharacter({class:{id:"ranger"},fightingStyle:{id:"archery"},rangerSelections:{}}),{fightingStyle:"archery"});
});
