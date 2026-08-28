import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { classChoiceFieldsForState } from "../src/ui/class-options.js";
import { classSelectionsFromCharacter } from "../src/ui/class-selection-state.js";
import { RANGER_LANGUAGE_OPTIONS_2024 } from "../src/rules/ranger-explorer-selections.js";

function rangerState(level=2,classSelections={}){
  try{
    const state=createInitialState();
    state.ruleset="2024";
    state.constraints.level=String(level);
    state.constraints.class="ranger";
    state.constraints.subclass=level>=3?"hunter":"random";
    state.constraints.species="human";
    state.constraints.background="soldier";
    state.classSelections={...classSelections};
    return state;
  }catch(error){
    console.error("[ranger-deft-explorer-test] state fixture failed",error);
    throw error;
  }
}

function fields(level=2,classSelections={}){
  try{return classChoiceFieldsForState(rangerState(level,classSelections));}
  catch(error){console.error("[ranger-deft-explorer-test] field lookup failed",error);throw error;}
}

test("Deft Explorer controls appear at Ranger level 2",()=>{
  const level1=fields(1);
  assert.equal(level1.some(field=>field.key==="expertise"),false);
  assert.equal(level1.some(field=>field.key==="deftExplorerLanguages"),false);

  const level2=fields(2),expertise=level2.find(field=>field.key==="expertise"),languages=level2.find(field=>field.key==="deftExplorerLanguages");
  assert.ok(expertise);
  assert.equal(expertise.max,1);
  assert.ok(languages);
  assert.equal(languages.max,2);
  assert.deepEqual(new Set(languages.options.map(option=>option.id)),new Set(RANGER_LANGUAGE_OPTIONS_2024));
});

test("Ranger level 9 expands Expertise capacity from one to three",()=>{
  assert.equal(fields(8).find(field=>field.key==="expertise").max,1);
  assert.equal(fields(9).find(field=>field.key==="expertise").max,3);
});

test("fixed Deft Explorer choices preserve Expertise and two additional unique languages",()=>{
  const state=rangerState(2,{expertise:["stealth"],deftExplorerLanguages:["Sylvan","Draconic"]}),character=generateCharacter(state);
  assert.equal(character.validation.valid,true);
  assert.deepEqual(character.expertise,["stealth"]);
  assert.ok(character.skills.includes("stealth"));
  assert.ok(character.languages.includes("Sylvan"));
  assert.ok(character.languages.includes("Draconic"));
  assert.equal(new Set(character.languages).size,character.languages.length);
  assert.equal(character.languages.length,5);
  assert.deepEqual(new Set(character.rangerSelections.deftExplorerLanguages),new Set(["Sylvan","Draconic"]));
});

test("level 9 Ranger can lock all three Expertise proficiencies",()=>{
  const requested=["stealth","survival","perception"],character=generateCharacter(rangerState(9,{expertise:requested}));
  assert.equal(character.expertise.length,3);
  assert.deepEqual(new Set(character.expertise),new Set(requested));
  for(const skill of requested)assert.ok(character.skills.includes(skill),`${skill} must be proficient before Expertise`);
});

test("partial Ranger locks leave remaining Expertise and language choices Random",()=>{
  const character=generateCharacter(rangerState(9,{expertise:["stealth"],deftExplorerLanguages:["Celestial"]}));
  assert.equal(character.expertise.length,3);
  assert.ok(character.expertise.includes("stealth"));
  assert.equal(character.rangerSelections.deftExplorerLanguages.length,2);
  assert.ok(character.rangerSelections.deftExplorerLanguages.includes("Celestial"));
  assert.equal(new Set(character.languages).size,character.languages.length);
});

test("premature and excessive Deft Explorer locks are rejected",()=>{
  assert.throws(()=>generateCharacter(rangerState(1,{expertise:["stealth"]})),/unavailable before level 2/);
  assert.throws(()=>generateCharacter(rangerState(1,{deftExplorerLanguages:["Sylvan"]})),/unavailable before Ranger level 2/);
  assert.throws(()=>generateCharacter(rangerState(2,{expertise:["stealth","survival"]})),/Choose at most 1 Ranger Expertise/);
  assert.throws(()=>generateCharacter(rangerState(2,{deftExplorerLanguages:["Sylvan","Celestial","Draconic"]})),/Choose at most 2 Deft Explorer/);
});

test("saved Ranger restores resolved Deft Explorer choices into Forge state",()=>{
  const character=generateCharacter(rangerState(9,{expertise:["stealth"],deftExplorerLanguages:["Undercommon"]})),restored=classSelectionsFromCharacter(character);
  assert.deepEqual(restored.expertise,character.rangerSelections.expertise);
  assert.deepEqual(restored.deftExplorerLanguages,character.rangerSelections.deftExplorerLanguages);
});
