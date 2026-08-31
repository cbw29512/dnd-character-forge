import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { applyPrimalChampion } from "../src/rules/barbarian.js";
import { buildQuickReference } from "../src/rules/reference-router.js";

function barbarian(ruleset,level){
  const state=createInitialState();
  state.ruleset=ruleset;
  state.constraints.level=String(level);
  state.constraints.class="barbarian";
  state.constraints.subclass=level>=3?"berserker":"random";
  state.constraints.species="human";
  state.constraints.background=ruleset==="2014"?"acolyte":"soldier";
  return generateCharacter(state);
}

function reference(character,name){
  const item=buildQuickReference(character).find(entry=>entry.name===name);
  assert.ok(item,`${character.ruleset} Barbarian L${character.level}: missing ${name} reference`);
  return item.text;
}

test("Primal Champion applies exact edition score and maximum semantics",()=>{
  const pre20=applyPrimalChampion({str:20,con:19},{str:20,con:20},"2024",19);
  assert.deepEqual(pre20,{scores:{str:20,con:19},maximums:{str:20,con:20}});

  const legacy=applyPrimalChampion({str:20,con:19},{str:20,con:20},"2014",20);
  assert.deepEqual(legacy.scores,{str:24,con:23});
  assert.deepEqual(legacy.maximums,{str:24,con:24});

  const revised=applyPrimalChampion({str:21,con:20},{str:30,con:20},"2024",20);
  assert.deepEqual(revised.scores,{str:25,con:24});
  assert.deepEqual(revised.maximums,{str:30,con:25});
});

test("Persistent Rage keeps the 2014 and 2024 contracts isolated",()=>{
  const legacy=barbarian("2014",15),revised=barbarian("2024",15);
  const legacyText=reference(legacy,"Persistent Rage"),revisedText=reference(revised,"Persistent Rage");

  assert.match(legacyText,/ends early only if you fall Unconscious or use a Bonus Action to end it/i);
  assert.doesNotMatch(legacyText,/Initiative is rolled/i);
  assert.doesNotMatch(legacyText,/regain all expended Rage uses/i);

  assert.match(revisedText,/Initiative is rolled/i);
  assert.match(revisedText,/regain all expended Rage uses once per Long Rest/i);
  assert.match(revisedText,/lasts 10 minutes without round-to-round extension/i);
  assert.match(revisedText,/Unconscious or don Heavy armor/i);
});

test("Berserker quick references preserve edition-specific feature semantics",()=>{
  const legacy=barbarian("2014",14),revised=barbarian("2024",14);
  const legacyFrenzy=reference(legacy,"Frenzy"),revisedFrenzy=reference(revised,"Frenzy");
  const legacyPresence=reference(legacy,"Intimidating Presence"),revisedPresence=reference(revised,"Intimidating Presence");

  assert.match(legacyFrenzy,/Bonus Action/i);
  assert.match(legacyFrenzy,/Exhaustion/i);
  assert.doesNotMatch(legacyFrenzy,/Reckless Attack/i);

  assert.match(revisedFrenzy,/Reckless Attack/i);
  assert.match(revisedFrenzy,/first Strength-based hit/i);
  assert.match(revisedFrenzy,/3d6/i);
  assert.doesNotMatch(revisedFrenzy,/Exhaustion/i);

  assert.match(legacyPresence,/Wisdom save DC/i);
  assert.match(legacyPresence,/immune to this feature for 24 hours/i);
  assert.match(revisedPresence,/30-ft Emanation/i);
  assert.match(revisedPresence,/expend a Rage use/i);
  assert.match(revisedPresence,/1 minute/i);
});
