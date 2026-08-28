import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { sanitizeActiveClassChoiceFields } from "../src/ui/class-choice-sanitizer.js";
import { sanitizeClassSelectionsForCurrentState } from "../src/ui/class-options.js";

function stateFor(ruleset,classId,level,subclass="random"){
  try{
    const state=createInitialState();state.ruleset=ruleset;state.constraints.class=classId;state.constraints.level=String(level);state.constraints.subclass=subclass;return state;
  }catch(error){console.error("[class-choice-lifecycle-test] fixture failed",error);throw error;}
}

test("generic active-field sanitizer repairs single, multi, and indexed stale state without touching unrelated keys",()=>{
  const selections={singleChoice:"retired",multiChoice:["a","a","retired","b","c"],indexedChoice:["x","retired","z"],unrelated:"keep"},fields=[
    {type:"single",key:"singleChoice",options:[{id:"legal"}]},
    {type:"multi",key:"multiChoice",max:2,options:[{id:"a"},{id:"b"},{id:"c"}]},
    {type:"indexed",key:"indexedChoice",index:0,options:[{id:"x"}]},
    {type:"indexed",key:"indexedChoice",index:1,options:[{id:"y"}]}
  ],clean=sanitizeActiveClassChoiceFields(selections,fields);
  assert.equal("singleChoice" in clean,false);
  assert.deepEqual(clean.multiChoice,["a","b"]);
  assert.deepEqual(clean.indexedChoice,["x"]);
  assert.equal(clean.unrelated,"keep");
  assert.equal(selections.singleChoice,"retired","sanitizer must not mutate caller state");
});

test("2014 Warlock level-down removes unavailable Pact state and high-level invocations but preserves legal invocations",()=>{
  const state=stateFor("2014","warlock",2);
  state.constraints.background="acolyte";
  state.classSelections={pactBoon:"chain",eldritchInvocations:["chains-of-carceri","devils-sight","mask-of-many-faces"]};
  const clean=sanitizeClassSelectionsForCurrentState(state);
  assert.equal("pactBoon" in clean,false);
  assert.deepEqual(clean.eldritchInvocations,["devils-sight","mask-of-many-faces"]);
  const character=generateCharacter(state);
  assert.equal(character.validation.valid,true);
  assert.deepEqual(character.warlockSelections.invocations.selected,["devils-sight","mask-of-many-faces"]);
});

test("2024 Warlock level-down removes invocation dependents that no longer meet level requirements",()=>{
  const state=stateFor("2024","warlock",4);
  state.constraints.background="acolyte";
  state.classSelections={eldritchInvocations:["pact-of-the-blade","thirsting-blade","devouring-blade"]};
  const clean=sanitizeClassSelectionsForCurrentState(state);
  assert.deepEqual(clean.eldritchInvocations,["pact-of-the-blade"]);
  const character=generateCharacter(state);
  assert.equal(character.validation.valid,true);
  assert.ok(character.warlockSelections.invocations.all.includes("pact-of-the-blade"));
  assert.equal(character.warlockSelections.invocations.all.includes("thirsting-blade"),false);
  assert.equal(character.warlockSelections.invocations.all.includes("devouring-blade"),false);
});

test("2024 Druid level-down drops illegal Wild Shape forms while preserving legal forms and Primal Order",()=>{
  const state=stateFor("2024","druid",3,"circle-land");
  state.constraints.background="acolyte";
  state.classSelections={primalOrder:"magician",circleLand:"temperate",knownForms:["pteranodon","brown-bear","wolf","rat"]};
  const clean=sanitizeClassSelectionsForCurrentState(state);
  assert.equal(clean.primalOrder,"magician");
  assert.equal(clean.circleLand,"temperate");
  assert.deepEqual(clean.knownForms,["wolf","rat"]);
  const character=generateCharacter(state);
  assert.equal(character.validation.valid,true);
  assert.ok(character.druidSelections.knownForms.includes("wolf"));
  assert.ok(character.druidSelections.knownForms.includes("rat"));
  assert.equal(character.druidSelections.knownForms.includes("pteranodon"),false);
  assert.equal(character.druidSelections.knownForms.includes("brown-bear"),false);
});

test("level-down truncates still-legal scalable multi choices instead of clearing the whole class state",()=>{
  const state=stateFor("2024","sorcerer",3,"draconic-sorcery");
  state.constraints.background="acolyte";
  state.classSelections={classSkills:["arcana","persuasion"],metamagic:["quickened-spell","subtle-spell","twinned-spell","heightened-spell"]};
  const clean=sanitizeClassSelectionsForCurrentState(state);
  assert.deepEqual(clean.classSkills,["arcana","persuasion"]);
  assert.ok(clean.metamagic.length<=2);
  const character=generateCharacter(state);
  assert.equal(character.validation.valid,true);
});
