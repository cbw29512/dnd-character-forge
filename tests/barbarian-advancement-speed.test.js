import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";

function stateFor(ruleset){
  const state=createInitialState();
  state.ruleset=ruleset;
  state.constraints.level="8";
  state.constraints.class="barbarian";
  state.constraints.subclass="berserker";
  state.constraints.species="human";
  state.constraints.background=ruleset==="2014"?"acolyte":"soldier";
  state.classSelections.advancements=["fleet-vanguard","asi"];
  return state;
}

for(const ruleset of ["2014","2024"]){
  test(`${ruleset} Barbarian accepts legal advancement Speed with Fast Movement`,()=>{
    const character=generateCharacter(stateFor(ruleset));
    assert.equal(character.advancementSpeedBonus,5);
    assert.equal(character.barbarian.speedBonus,10);
    assert.equal(character.speed,45);
    assert.ok(character.feats.some(feat=>feat.id==="fleet-vanguard"));
    assert.equal(character.validation.valid,true,character.validation.errors?.join(" | "));
    assert.equal(character.audit.status,"PASS");
  });
}
