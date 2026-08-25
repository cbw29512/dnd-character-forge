import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState, MAGIC_MODES } from "../src/state.js";
import { generateStartingMagic } from "../src/rules/magic-starting.js";

test("all top-level generation constraints default to Random",()=>{
  const state=createInitialState();
  assert.equal(state.constraints.level,"random");
  assert.equal(state.constraints.species,"random");
  assert.equal(state.constraints.class,"random");
  assert.equal(state.constraints.subclass,"random");
  assert.equal(state.constraints.background,"random");
  assert.equal(state.constraints.name,"");
  assert.equal(state.magicMode,MAGIC_MODES.RANDOM_MAGIC);
});

test("explicit generation constraints persist until deliberately changed or cleared",()=>{
  const state=createInitialState();
  state.constraints.level="10";
  state.constraints.species="dwarf";
  state.constraints.class="cleric";
  state.constraints.subclass="random";
  state.constraints.background="soldier";
  state.classSelections={divineOrder:"protector"};
  state.spellSelections={...state.spellSelections,masteryLevel1:"locked-spell"};
  assert.deepEqual(state.constraints,{level:"10",species:"dwarf",class:"cleric",subclass:"random",background:"soldier",name:""});
  assert.equal(state.classSelections.divineOrder,"protector");
  assert.equal(state.spellSelections.masteryLevel1,"locked-spell");
  state.constraints.species="random";
  assert.equal(state.constraints.species,"random");
  assert.equal(state.constraints.class,"cleric");
  assert.equal(state.classSelections.divineOrder,"protector");
});

test("Random starting magic resolves to a legal campaign mode",()=>{
  const modes=new Set();
  for(let i=0;i<40;i++){
    const plan=generateStartingMagic({ruleset:"2024",level:10,mode:MAGIC_MODES.RANDOM_MAGIC,classId:"fighter"});
    modes.add(plan.mode);
    assert.ok([MAGIC_MODES.NO_MAGIC,MAGIC_MODES.LOW_MAGIC,MAGIC_MODES.NORMAL_MAGIC,MAGIC_MODES.HIGH_MAGIC].includes(plan.mode));
    assert.equal(plan.requestedMode,MAGIC_MODES.RANDOM_MAGIC);
  }
  assert.ok(modes.size>=2,"Random magic should actually vary across repeated Forges.");
});

test("Explicit magic mode remains locked instead of being randomized",()=>{
  const plan=generateStartingMagic({ruleset:"2024",level:10,mode:MAGIC_MODES.NO_MAGIC,classId:"wizard"});
  assert.equal(plan.mode,MAGIC_MODES.NO_MAGIC);
  assert.equal(plan.requestedMode,MAGIC_MODES.NO_MAGIC);
  assert.deepEqual(plan.items,[]);
});
