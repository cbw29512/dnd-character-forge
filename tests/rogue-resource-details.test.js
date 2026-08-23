import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { rogueResourceSummary } from "../src/ui/rogue-resources.js";

function thiefAt(level){const state=createInitialState();state.ruleset="2024";state.constraints.level=String(level);state.constraints.class="rogue";state.constraints.subclass="thief";state.constraints.species="halfling";state.constraints.background="criminal";return generateCharacter(state);}

test("Rogue Resources exposes Cunning Strike requirements and playable effects",()=>{
  const html=rogueResourceSummary(thiefAt(14));assert.match(html,/Poisoner&#39;s Kit/);assert.match(html,/failed save: Prone/);assert.match(html,/move up to half your Speed without provoking Opportunity Attacks/);assert.match(html,/Daze · 2d6 · CON save/);assert.match(html,/Knock Out · 6d6 · CON save/);assert.match(html,/Obscure · 3d6 · DEX save/);
});

test("Use Magic Device scroll failure warning appears at Thief 13, not before",()=>{
  assert.doesNotMatch(rogueResourceSummary(thiefAt(12)),/disintegrates the scroll/);const html=rogueResourceSummary(thiefAt(13));assert.match(html,/Intelligence \(Arcana\) DC 10 \+ spell level/);assert.match(html,/failed check disintegrates the scroll/);
});
