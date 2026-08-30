import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { abilityMod } from "../src/rules/math.js";
import { buildQuickReference } from "../src/rules/reference.js";

function duelingFighter(){
  const state=createInitialState();
  state.ruleset="2014";
  state.constraints.level="1";
  state.constraints.class="fighter";
  state.constraints.species="human";
  state.constraints.background="acolyte";
  state.classSelections={fightingStyle:"dueling"};
  return generateCharacter(state);
}

test("2014 Dueling adds +2 only to the qualifying one-handed melee attack",()=>{
  const character=duelingFighter();
  assert.equal(character.fightingStyle.id,"dueling");
  assert.equal(character.equipment.shield,true);
  const longsword=character.attacks.find(attack=>attack.id==="longsword"),crossbow=character.attacks.find(attack=>attack.id==="light-crossbow");
  assert.ok(longsword);assert.ok(crossbow);
  assert.equal(longsword.damageBonus,abilityMod(character.abilities.str)+2);
  assert.equal(crossbow.damageBonus,abilityMod(character.abilities.dex));
});

test("2014 Dueling quick reference remains sourced to SRD 5.1 page 24",()=>{
  const item=buildQuickReference(duelingFighter()).find(ref=>ref.name==="Dueling");
  assert.ok(item);
  assert.match(item.text,/one hand and no other weapons/i);
  assert.equal(item.source.version,"SRD 5.1");
  assert.equal(item.source.page,"24");
});
