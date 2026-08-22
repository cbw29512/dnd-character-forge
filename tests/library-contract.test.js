import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createInitialState } from "../src/state.js";
import { generateForSystem } from "../src/systems/generate.js";
import { fingerprint, pregenFingerprintPayload } from "../src/library/fingerprint.js";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const libraryUi=fs.readFileSync(new URL("../src/ui/library.js",import.meta.url),"utf8");
const app=fs.readFileSync(new URL("../src/app.js",import.meta.url),"utf8");

function fighter(){const state=createInitialState();state.constraints.level="1";state.constraints.class="fighter";return generateForSystem(state);}

test("saved pregen fingerprint includes system and play-critical choices",async()=>{
  const character=fighter(),payload=pregenFingerprintPayload(character);
  assert.equal(payload.systemId,"dnd");
  for(const field of ["expertise","tools","fightingStyles","classResources","advancementChoices","attacks","features"])assert.ok(Object.hasOwn(payload,field),`fingerprint is missing ${field}`);
  const original=await fingerprint(payload),changed=structuredClone(character);changed.tools=[...(changed.tools||[]),"Imaginary Test Tool"];
  assert.notEqual(await fingerprint(pregenFingerprintPayload(changed)),original);
  const otherSystem=structuredClone(character);otherSystem.systemId="future-system";
  assert.notEqual(await fingerprint(pregenFingerprintPayload(otherSystem)),original);
});

test("library page exposes system edition class level and search filters",()=>{
  for(const id of ["pregenSearch","pregenSystem","pregenRuleset","pregenClass","pregenLevel"])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(libraryUi,/registeredSystems/);
  assert.match(libraryUi,/Open & play/);
});

test("public Forge uses the system dispatcher and restores every advancement slot",()=>{
  assert.match(app,/generateForSystem\(state\)/);
  assert.doesNotMatch(app,/generateCharacter\(state\)/);
  for(const level of [4,6,8,10,12,14,16,19])assert.match(app,new RegExp(`${level}:RANDOM`));
});
