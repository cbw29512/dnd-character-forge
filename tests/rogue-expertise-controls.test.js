import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { classChoiceFieldsForState } from "../src/ui/class-options.js";
import { classSelectionsFromCharacter } from "../src/ui/class-selection-state.js";

function rogueState(ruleset,level=1,expertise=[]){
  try{
    const state=createInitialState();
    state.ruleset=ruleset;
    state.constraints.level=String(level);
    state.constraints.class="rogue";
    state.constraints.subclass=level>=3?"thief":"random";
    state.constraints.species="human";
    state.constraints.background="acolyte";
    state.classSelections=expertise.length?{expertise:[...expertise]}:{};
    return state;
  }catch(error){
    console.error("[rogue-expertise-controls-test] state fixture failed",error);
    throw error;
  }
}

function expertiseField(state){
  try{return classChoiceFieldsForState(state).find(field=>field.key==="expertise")||null;}
  catch(error){console.error("[rogue-expertise-controls-test] field lookup failed",error);throw error;}
}

test("Rogue Expertise picker exposes the correct edition-specific choices",()=>{
  const legacy=expertiseField(rogueState("2014"));
  assert.ok(legacy);
  assert.equal(legacy.max,2);
  assert.ok(legacy.options.some(option=>option.id==="religion"),"fixed background proficiency should be selectable");
  assert.ok(legacy.options.some(option=>option.id==="Thieves' Tools"),"2014 should expose Thieves' Tools Expertise");

  const current=expertiseField(rogueState("2024"));
  assert.ok(current);
  assert.equal(current.max,2);
  assert.ok(current.options.some(option=>option.id==="religion"));
  assert.equal(current.options.some(option=>option.id==="Thieves' Tools"),false,"2024 Expertise must remain skill-only");
});

test("Rogue level 6 exposes four Expertise locks in both editions",()=>{
  assert.equal(expertiseField(rogueState("2014",6)).max,4);
  assert.equal(expertiseField(rogueState("2024",6)).max,4);
});

test("fixed 2014 Expertise preserves background, Rogue-skill, and Thieves' Tools choices",()=>{
  const requested=["religion","stealth","perception","Thieves' Tools"],character=generateCharacter(rogueState("2014",6,requested));
  assert.equal(character.validation.valid,true);
  assert.equal(character.expertise.length,4);
  for(const choice of requested)assert.ok(character.expertise.includes(choice),`missing fixed Expertise ${choice}`);
  assert.ok(character.skills.includes("stealth"));
  assert.ok(character.skills.includes("perception"));
  assert.ok(character.toolProficiencies.includes("Thieves' Tools"));
});

test("fixed 2024 Expertise reserves Rogue skill proficiencies and preserves background skills",()=>{
  const requested=["religion","stealth","perception","acrobatics"],character=generateCharacter(rogueState("2024",6,requested));
  assert.equal(character.validation.valid,true);
  assert.deepEqual(new Set(character.expertise),new Set(requested));
  for(const choice of requested)assert.ok(character.skills.includes(choice),`${choice} must be proficient before Expertise`);
});

test("partial Rogue Expertise locks fill the remaining legal slots randomly",()=>{
  const legacy=generateCharacter(rogueState("2014",1,["Thieves' Tools"]));
  assert.equal(legacy.expertise.length,2);
  assert.ok(legacy.expertise.includes("Thieves' Tools"));
  const current=generateCharacter(rogueState("2024",1,["stealth"]));
  assert.equal(current.expertise.length,2);
  assert.ok(current.expertise.includes("stealth"));
});

test("2024 Rogue rejects Thieves' Tools Expertise",()=>{
  assert.throws(()=>generateCharacter(rogueState("2024",1,["Thieves' Tools"])),/2024 Rogue Expertise can only select skill proficiencies/);
});

test("saved Rogues restore every resolved Expertise choice back into Forge state",()=>{
  const character=generateCharacter(rogueState("2014",6,["religion","Thieves' Tools"])),restored=classSelectionsFromCharacter(character);
  assert.deepEqual(restored.expertise,character.expertise);
});
