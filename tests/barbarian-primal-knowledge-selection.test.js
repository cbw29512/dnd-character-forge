import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";

function barbarianState(level=3){
  const state=createInitialState();
  state.ruleset="2024";
  state.constraints={...state.constraints,level:String(level),class:"barbarian",subclass:level>=3?"berserker":"random",species:"dwarf",background:"sage",name:"Primal Knowledge Audit"};
  // Deliberately use legacy/display-form labels here. Generation must canonicalize
  // them to the engine skill ids rather than crashing on otherwise legal state.
  state.classSelections={classSkills:["Athletics","Survival"]};
  return state;
}

test("2024 Barbarian can lock the RAW Primal Knowledge skill choice",()=>{
  const state=barbarianState(3);state.classSelections.primalKnowledgeSkill="Nature";
  const character=generateCharacter(state);
  assert.equal(character.validation.valid,true);
  assert.equal(character.audit.rawIntegrity,true);
  assert.equal(character.barbarianSelections.primalKnowledgeSkill,"nature");
  assert.ok(character.skills.includes("nature"));
  assert.deepEqual(character.classSkillChoices,["athletics","survival"]);
  assert.equal(new Set(character.skills).size,character.skills.length);
});

test("2024 Barbarian Random Primal Knowledge records one legal new proficiency",()=>{
  const state=barbarianState(3),character=generateCharacter(state),choice=character.barbarianSelections.primalKnowledgeSkill;
  assert.ok(character.class.skillChoices.includes(choice));
  assert.ok(character.skills.includes(choice));
  assert.ok(!character.classSkillChoices.includes(choice));
  assert.ok(!character.background.skills.includes(choice));
});

test("stale Primal Knowledge lock that duplicates a base Barbarian skill is canonicalized",()=>{
  const state=barbarianState(3);state.classSelections.primalKnowledgeSkill="Athletics";
  const character=generateCharacter(state),choice=character.barbarianSelections.primalKnowledgeSkill;
  assert.deepEqual(character.classSkillChoices,["athletics","survival"]);
  assert.notEqual(choice,"athletics");
  assert.ok(character.class.skillChoices.includes(choice));
  assert.ok(character.skills.includes(choice));
  assert.equal(new Set(character.skills).size,character.skills.length);
});

test("stale Primal Knowledge lock that collides with a changed background is re-resolved",()=>{
  const state=barbarianState(3);state.constraints.background="soldier";state.classSelections.classSkills=["Animal Handling","Survival"];state.classSelections.primalKnowledgeSkill="Athletics";
  const character=generateCharacter(state),choice=character.barbarianSelections.primalKnowledgeSkill;
  assert.notEqual(choice,"athletics");
  assert.ok(character.class.skillChoices.includes(choice));
  assert.ok(!character.background.skills.includes(choice));
  assert.ok(!character.classSkillChoices.includes(choice));
  assert.equal(character.validation.valid,true);
  assert.equal(character.audit.rawIntegrity,true);
});

test("malformed or off-list Primal Knowledge lock is discarded instead of leaking",()=>{
  const state=barbarianState(3);state.classSelections.primalKnowledgeSkill="Arcana";
  const character=generateCharacter(state),choice=character.barbarianSelections.primalKnowledgeSkill;
  assert.notEqual(choice,"arcana");
  assert.ok(character.class.skillChoices.includes(choice));
  assert.ok(character.skills.includes(choice));
});

test("Primal Knowledge selection is inactive before level 3 and in 2014",()=>{
  const low=barbarianState(2);low.classSelections.primalKnowledgeSkill="Nature";const lowCharacter=generateCharacter(low);assert.equal(lowCharacter.barbarianSelections.primalKnowledgeSkill,null);
  const old=barbarianState(3);old.ruleset="2014";old.constraints.subclass="berserker";old.classSelections.primalKnowledgeSkill="Nature";const oldCharacter=generateCharacter(old);assert.equal(oldCharacter.barbarianSelections.primalKnowledgeSkill,null);
});
