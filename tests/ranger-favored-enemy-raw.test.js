import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { FAVORED_ENEMY_TYPES_2014, resolveRangerClassSelections } from "../src/rules/ranger.js";

const ORCS_GNOLLS="Humanoids: Orcs & Gnolls";
const GOBLINS_KOBOLDS="Humanoids: Goblins & Kobolds";

test("2014 Favored Enemy exposes the RAW two-humanoid-races alternative",()=>{
  assert.ok(FAVORED_ENEMY_TYPES_2014.includes(ORCS_GNOLLS));
  const resolved=resolveRangerClassSelections("2014",1,null,{favoredEnemies:[ORCS_GNOLLS],favoredEnemyLanguages:["Orc"]});
  assert.deepEqual(resolved.favoredEnemies,[ORCS_GNOLLS]);
  assert.deepEqual(resolved.favoredEnemyLanguages,["Orc"]);
});

test("2014 Ranger can take distinct humanoid pairs as later Favored Enemies",()=>{
  const resolved=resolveRangerClassSelections("2014",6,"hunter",{favoredEnemies:[ORCS_GNOLLS,GOBLINS_KOBOLDS],favoredEnemyLanguages:["Gnoll","Draconic"]});
  assert.deepEqual(resolved.favoredEnemies,[ORCS_GNOLLS,GOBLINS_KOBOLDS]);
  assert.deepEqual(resolved.favoredEnemyLanguages,["Gnoll","Draconic"]);
});

test("generated 2014 Ranger preserves a fixed humanoid Favored Enemy and learned language",()=>{
  const state=createInitialState();
  state.ruleset="2014";
  state.constraints.level="1";
  state.constraints.class="ranger";
  state.constraints.species="human";
  state.constraints.background="acolyte";
  state.classSelections={favoredEnemies:[ORCS_GNOLLS],favoredEnemyLanguages:["Orc"]};
  const character=generateCharacter(state);
  assert.deepEqual(character.rangerSelections.favoredEnemies,[ORCS_GNOLLS]);
  assert.ok(character.languages.includes("Orc"));
  assert.equal(character.validation.valid,true);
});
