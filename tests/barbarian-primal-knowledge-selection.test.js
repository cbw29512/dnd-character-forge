import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";

function barbarianState(level=3){
  const state=createInitialState();
  state.ruleset="2024";
  state.constraints={...state.constraints,level:String(level),class:"barbarian",subclass:level>=3?"berserker":"random",species:"dwarf",background:"sage",name:"Primal Knowledge Audit"};
  state.classSelections={classSkills:["Athletics","Survival"]};
  return state;
}

test("2024 Barbarian can lock the RAW Primal Knowledge skill choice",()=>{
  const state=barbarianState(3);state.classSelections.primalKnowledgeSkill="Nature";
  const character=generateCharacter(state);
  assert.equal(character.validation.valid,true);
  assert.equal(character.audit.rawIntegrity,true);
  assert.equal(character.barbarianSelections.primalKnowledgeSkill,"Nature");
  assert.ok(character.skills.includes("Nature"));
  assert.deepEqual(character.classSkillChoices,["Athletics","Survival"]);
  assert.equal(new Set(character.skills).size,character.skills.length);
});

test("2024 Barbarian Random Primal Knowledge records one legal new proficiency",()=>{
  const state=barbarianState(3),character=generateCharacter(state),choice=character.barbarianSelections.primalKnowledgeSkill;
  assert.ok(character.class.skillChoices.includes(choice));
  assert.ok(character.skills.includes(choice));
  assert.ok(!character.classSkillChoices.includes(choice));
  assert.ok(!character.background.skills.includes(choice));
});

test("Primal Knowledge cannot duplicate a fixed base Barbarian skill",()=>{
  const state=barbarianState(3);state.classSelections.primalKnowledgeSkill="Athletics";
  assert.throws(()=>generateCharacter(state),/must add new proficiencies|already proficient|fixed class or class-feature skill/i);
});

test("Primal Knowledge cannot duplicate a fixed background proficiency",()=>{
  const state=barbarianState(3);state.constraints.background="soldier";state.classSelections.classSkills=["Animal Handling","Survival"];state.classSelections.primalKnowledgeSkill="Athletics";
  assert.throws(()=>generateCharacter(state),/fixed class or class-feature skill|already granted/i);
});

test("Primal Knowledge selection is inactive before level 3 and in 2014",()=>{
  const low=barbarianState(2);low.classSelections.primalKnowledgeSkill="Nature";const lowCharacter=generateCharacter(low);assert.equal(lowCharacter.barbarianSelections.primalKnowledgeSkill,null);
  const old=barbarianState(3);old.ruleset="2014";old.constraints.subclass="berserker";old.classSelections.primalKnowledgeSkill="Nature";const oldCharacter=generateCharacter(old);assert.equal(oldCharacter.barbarianSelections.primalKnowledgeSkill,null);
});
