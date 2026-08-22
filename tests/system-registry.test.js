import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { DND_SYSTEM, DND_SYSTEM_ID } from "../src/systems/dnd.js";
import { generateForSystem } from "../src/systems/generate.js";
import { registeredSystems, systemFor } from "../src/systems/registry.js";

test("D&D is the first registered game system with isolated editions",()=>{
  assert.equal(DND_SYSTEM.id,DND_SYSTEM_ID);
  assert.deepEqual(DND_SYSTEM.editions.map(item=>item.id),["2014","2024"]);
  assert.deepEqual(registeredSystems().map(item=>item.id),[DND_SYSTEM_ID]);
  assert.equal(systemFor(DND_SYSTEM_ID).name,"Dungeons & Dragons");
});

test("initial Forge state carries explicit game-system identity",()=>{
  const state=createInitialState();
  assert.equal(state.systemId,DND_SYSTEM_ID);
  assert.equal(state.ruleset,"2024");
});

test("system dispatcher preserves D&D generation while stamping system identity",()=>{
  const state=createInitialState();state.constraints.level="1";state.constraints.class="fighter";
  const character=generateForSystem(state);
  assert.equal(character.systemId,DND_SYSTEM_ID);
  assert.equal(character.class.id,"fighter");
  assert.equal(character.validation.valid,true);
});

test("unsupported systems fail closed before generation",()=>{
  const state=createInitialState();state.systemId="pathfinder";
  assert.throws(()=>generateForSystem(state),/Unsupported game system/i);
});
