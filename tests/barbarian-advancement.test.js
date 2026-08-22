import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";

function stateFor(ruleset,level){const state=createInitialState();state.ruleset=ruleset;state.constraints.class="barbarian";state.constraints.level=String(level);return state;}

test("2024 locked General feats and Epic Boon remain hard constraints",()=>{
  const state=stateFor("2024",20);state.advancementSelections={4:"grappler",8:"ability-score-improvement",12:"ability-score-improvement",16:"ability-score-improvement",19:"boon-truesight"};
  const character=generateCharacter(state),byLevel=Object.fromEntries(character.advancementChoices.map(choice=>[choice.level,choice]));
  assert.equal(byLevel[4].id,"grappler");assert.equal(byLevel[4].locked,true);assert.equal(byLevel[8].id,"ability-score-improvement");assert.equal(byLevel[19].id,"boon-truesight");assert.equal(byLevel[19].locked,true);assert.ok(character.feats.some(feat=>feat.id==="boon-truesight"));
});

test("2014 locked Grappler may replace one ASI but cannot be selected twice",()=>{
  const legal=stateFor("2014",8);legal.advancementSelections={4:"grappler",8:"asi"};const character=generateCharacter(legal);assert.equal(character.advancementChoices[0].id,"grappler");assert.equal(character.advancementChoices[1].type,"asi");
  const illegal=stateFor("2014",8);illegal.advancementSelections={4:"grappler",8:"grappler"};assert.throws(()=>generateCharacter(illegal),/Grappler is not legal/i);
});

test("edition-ineligible advancement choices fail closed",()=>{
  const old=stateFor("2014",4);old.advancementSelections={4:"ability-score-improvement"};assert.throws(()=>generateCharacter(old),/Illegal 2014 Barbarian advancement/i);
  const modern=stateFor("2024",4);modern.advancementSelections={4:"boon-truesight"};assert.throws(()=>generateCharacter(modern),/Illegal 2024 Barbarian General feat/i);
  const epic=stateFor("2024",19);epic.advancementSelections={19:"boon-spell-recall"};assert.throws(()=>generateCharacter(epic),/Illegal Barbarian Epic Boon/i);
});
