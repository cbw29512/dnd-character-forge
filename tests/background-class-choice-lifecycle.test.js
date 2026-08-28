import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { sanitizeClassSelectionsForBackgroundChange } from "../src/ui/class-background-transition.js";

function stateFor(classId,level,background,subclass="random"){
  try{
    const state=createInitialState();state.ruleset="2024";state.constraints.class=classId;state.constraints.level=String(level);state.constraints.subclass=subclass;state.constraints.species="dwarf";state.constraints.background=background;return state;
  }catch(error){console.error("[background-class-lifecycle-test] fixture failed",error);throw error;}
}

test("background change removes only class-skill locks newly duplicated by the background",()=>{
  const state=stateFor("fighter",1,"soldier");
  state.classSelections={classSkills:["Athletics","Perception"],fightingStyle:"defense"};
  const clean=sanitizeClassSelectionsForBackgroundChange(state);
  assert.deepEqual(clean.classSkills,["perception"]);
  assert.equal(clean.fightingStyle,"defense");
  const character=generateCharacter(state);
  assert.equal(character.validation.valid,true);
  assert.equal(character.audit.rawIntegrity,true);
});

test("Bard background transition preserves base choices, removes only duplicate Lore skills, and keeps Expertise when the new background supplies it",()=>{
  const state=stateFor("bard",3,"sage","college-lore");
  state.classSelections={
    classSkills:["deception","history","persuasion"],
    loreBonusSkills:["arcana","nature","religion"],
    expertise:["deception","history"]
  };
  const clean=sanitizeClassSelectionsForBackgroundChange(state);
  assert.deepEqual(clean.classSkills,["deception","persuasion"]);
  assert.deepEqual(clean.loreBonusSkills,["nature","religion"]);
  assert.deepEqual(clean.expertise,["deception","history"]);
  const character=generateCharacter(state);
  assert.equal(character.validation.valid,true);
  assert.equal(character.audit.rawIntegrity,true);
});

test("random background does not erase legal fixed class skills",()=>{
  const state=stateFor("fighter",1,"random");
  state.classSelections={classSkills:["athletics","perception"],fightingStyle:"defense"};
  const clean=sanitizeClassSelectionsForBackgroundChange(state);
  assert.deepEqual(clean.classSkills,["athletics","perception"]);
  assert.equal(clean.fightingStyle,"defense");
});

test("background transition canonicalizes display-form skill locks before conflict repair",()=>{
  const state=stateFor("bard",3,"sage","college-lore");
  state.classSelections={classSkills:["Deception","History","Persuasion"],loreBonusSkills:["Arcana","Nature","Religion"]};
  const clean=sanitizeClassSelectionsForBackgroundChange(state);
  assert.deepEqual(clean.classSkills,["deception","persuasion"]);
  assert.deepEqual(clean.loreBonusSkills,["nature","religion"]);
});
