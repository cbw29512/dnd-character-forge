import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { classChoiceFieldsForState } from "../src/ui/class-options.js";
import { classSelectionsFromCharacter } from "../src/ui/class-selection-state.js";

const BARBARIAN_SKILLS=["animalHandling","athletics","intimidation","nature","perception","survival"];

function stateFor({ruleset="2024",level=3,background="sage",classSelections={}}={}){
  const state=createInitialState();
  state.ruleset=ruleset;
  state.constraints.level=String(level);
  state.constraints.species="random";
  state.constraints.class="barbarian";
  state.constraints.subclass="random";
  state.constraints.background=background;
  state.classSelections=structuredClone(classSelections);
  return state;
}

test("Primal Knowledge control exists only for 2024 Barbarian level 3+",()=>{
  assert.ok(!classChoiceFieldsForState(stateFor({level:2})).some(field=>field.key==="primalKnowledgeSkill"));
  assert.ok(!classChoiceFieldsForState(stateFor({ruleset:"2014",level:3})).some(field=>field.key==="primalKnowledgeSkill"));
  const field=classChoiceFieldsForState(stateFor({level:3})).find(item=>item.key==="primalKnowledgeSkill");
  assert.ok(field);
  assert.deepEqual(new Set(field.options.map(option=>option.id)),new Set(BARBARIAN_SKILLS));
});

test("fixed Primal Knowledge remains another proficiency beyond the two base Barbarian skills",()=>{
  const character=generateCharacter(stateFor({classSelections:{classSkills:["athletics","nature"],primalKnowledgeSkill:"perception"}}));
  assert.deepEqual(new Set(character.classSkillChoices),new Set(["athletics","nature"]));
  assert.equal(character.primalKnowledgeSkill,"perception");
  assert.ok(character.skills.includes("perception"));
  assert.equal(new Set([character.primalKnowledgeSkill,...character.classSkillChoices]).size,3);
});

test("Random Primal Knowledge always resolves to a distinct Barbarian skill",()=>{
  for(let attempt=0;attempt<12;attempt++){
    const character=generateCharacter(stateFor({classSelections:{classSkills:["athletics","nature"]}}));
    assert.ok(BARBARIAN_SKILLS.includes(character.primalKnowledgeSkill));
    assert.ok(!character.classSkillChoices.includes(character.primalKnowledgeSkill));
    assert.ok(!character.background.skills.includes(character.primalKnowledgeSkill));
    assert.ok(character.skills.includes(character.primalKnowledgeSkill));
  }
});

test("Primal Knowledge and base class skill controls cannot select the same proficiency",()=>{
  assert.throws(()=>generateCharacter(stateFor({classSelections:{classSkills:["athletics","nature"],primalKnowledgeSkill:"athletics"}})),/class skill choices must add new proficiencies|already known|unavailable/);
});

test("fixed backgrounds cannot consume a locked Primal Knowledge proficiency",()=>{
  assert.throws(()=>generateCharacter(stateFor({background:"soldier",classSelections:{primalKnowledgeSkill:"athletics"}})),/fixed class or feature skill|different skill\/background combination/);
});

test("Primal Knowledge locks fail closed before level 3",()=>{
  assert.throws(()=>generateCharacter(stateFor({level:2,classSelections:{primalKnowledgeSkill:"perception"}})),/unavailable before 2024 Barbarian level 3/);
});

test("saved Barbarians restore the resolved Primal Knowledge skill",()=>{
  const character=generateCharacter(stateFor({classSelections:{classSkills:["athletics"],primalKnowledgeSkill:"survival"}}));
  const restored=classSelectionsFromCharacter(character);
  assert.deepEqual(restored.classSkills,character.classSkillChoices);
  assert.equal(restored.primalKnowledgeSkill,"survival");
});
