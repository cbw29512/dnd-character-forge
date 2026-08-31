import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";

test("2024 Pact of the Blade can conjure a weapon from a starting-gold loadout",()=>{
  const state=createInitialState();
  state.ruleset="2024";
  state.constraints.class="warlock";
  state.constraints.level="1";
  state.constraints.species="dwarf";
  state.constraints.background="criminal";
  state.classSelections={equipmentPackage:"starting-gold",eldritchInvocations:["pact-of-the-blade"]};

  const character=generateCharacter(state);
  assert.equal(character.validation.valid,true);
  assert.equal(character.equipment.id,"starting-gold");
  assert.equal(character.equipment.startingGoldOnly,true);
  assert.deepEqual(character.equipment.weapons,[]);

  const pactAttack=character.attacks.find(attack=>attack.pactWeapon);
  assert.ok(pactAttack,"Pact of the Blade should produce a conjured melee attack even when no weapon was purchased");
  assert.equal(pactAttack.id,"sickle");
  assert.equal(pactAttack.ability,"cha");
  assert.equal(pactAttack.conjuredPactWeapon,true);
  assert.equal(character.inventory.some(item=>item.name==="Sickle"),false,"A conjured pact weapon must not appear as purchased starting inventory");
});
