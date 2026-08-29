import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";

function stateFor(ruleset,classId,{level="1",background="random",species="random",classSelections={},speciesSelections={}}={}){
  const state=createInitialState();state.ruleset=ruleset;state.constraints.class=classId;state.constraints.level=level;state.constraints.background=background;state.constraints.species=species;state.classSelections=structuredClone(classSelections);state.speciesSelections=structuredClone(speciesSelections);return state;
}

test("fixed class skill choices stay fixed in both editions",()=>{
  for(const ruleset of ["2014","2024"]){
    const character=generateCharacter(stateFor(ruleset,"fighter",{classSelections:{classSkills:["athletics","perception"]}}));
    assert.deepEqual(character.classSkillChoices.sort(),["athletics","perception"].sort());
    assert.ok(character.skills.includes("athletics"));assert.ok(character.skills.includes("perception"));
  }
});

test("partially fixed class skill choices preserve the fixed prefix and fill the remainder",()=>{
  const character=generateCharacter(stateFor("2024","ranger",{classSelections:{classSkills:["survival"]}}));
  assert.equal(character.classSkillChoices.length,3);assert.ok(character.classSkillChoices.includes("survival"));
});

test("illegal fixed class skills fail closed",()=>{
  assert.throws(()=>generateCharacter(stateFor("2024","fighter",{classSelections:{classSkills:["arcana"]}})),/not available to Fighter/i);
});

test("duplicate fixed class skills fail closed instead of being silently repaired",()=>{
  assert.throws(()=>generateCharacter(stateFor("2024","fighter",{classSelections:{classSkills:["athletics","athletics"]}})),/duplicate/i);
});

test("Random background selection preserves a fixed class skill instead of consuming it",()=>{
  for(let attempt=0;attempt<12;attempt++){
    const character=generateCharacter(stateFor("2024","fighter",{classSelections:{classSkills:["athletics"]}}));
    assert.ok(character.classSkillChoices.includes("athletics"));
    assert.ok(!character.background.skills.includes("athletics"));
  }
});

test("a fixed background conflict fails closed with an actionable class-skill error",()=>{
  assert.throws(()=>generateCharacter(stateFor("2024","fighter",{background:"soldier",classSelections:{classSkills:["athletics"]}})),/class or College of Lore skill is already granted|different (?:class )?skill\/background combination|fixed background conflicts with a fixed class skill/i);
});

test("Expertise reservations and fixed class skills share the real class proficiency budget",()=>{
  const legal=generateCharacter(stateFor("2024","rogue",{background:"acolyte",classSelections:{classSkills:["acrobatics","athletics","deception"],expertise:["stealth"]}}));
  assert.equal(legal.classSkillChoices.length,4);
  assert.ok(legal.classSkillChoices.includes("stealth"));
  assert.equal(legal.expertise.length,2);

  assert.throws(()=>generateCharacter(stateFor("2024","rogue",{background:"acolyte",classSelections:{classSkills:["acrobatics","athletics","deception","stealth"],expertise:["perception"]}})),/require 5 class proficiencies|grants only 4/i);
});

test("College of Lore fixed skills are reserved away from Bard class-skill generation",()=>{
  const character=generateCharacter(stateFor("2024","bard",{level:"3",background:"criminal",classSelections:{loreBonusSkills:["arcana","history","nature"]}}));
  assert.ok(character.bardSelections.loreBonusSkills.includes("arcana"));
  assert.ok(character.bardSelections.loreBonusSkills.includes("history"));
  assert.ok(character.bardSelections.loreBonusSkills.includes("nature"));
  for(const skill of character.bardSelections.loreBonusSkills)assert.ok(!character.classSkillChoices.includes(skill));
});

test("fixed class skill colliding with a fixed species skill fails closed",()=>{
  assert.throws(()=>generateCharacter(stateFor("2024","fighter",{species:"human",classSelections:{classSkills:["athletics"]},speciesSelections:{skill:"athletics"}})),/already granted by the selected species|different skill\/species combination/i);
});
