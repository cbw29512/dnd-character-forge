import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { loadPregens, savePregen } from "../src/library/local-library.js";

const SAMPLE_A="data:image/jpeg;base64,/9j/AA==",SAMPLE_B="data:image/jpeg;base64,/9j/BB==";
function memoryStorage(){const values=new Map();return{getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key),clear:()=>values.clear()};}
function fighter(){const state=createInitialState();state.ruleset="2024";state.constraints.class="fighter";state.constraints.level="5";state.constraints.subclass="champion";state.constraints.name="Portrait Test";return generateCharacter(state);}

test("same saved pregen can update presentation without creating a mechanical duplicate",async()=>{
  globalThis.localStorage=memoryStorage();const c=fighter(),first=await savePregen(c);assert.equal(first.presentationUpdated,undefined);c.presentation={portraitDataUrl:SAMPLE_A};const update=await savePregen(c),items=loadPregens();assert.equal(update.presentationUpdated,true);assert.equal(items.length,1);assert.equal(items[0].character.presentation.portraitDataUrl,SAMPLE_A);assert.ok(items[0].updatedAt);
});
test("portrait can be replaced or removed while rename-only duplicates stay blocked",async()=>{
  globalThis.localStorage=memoryStorage();const c=fighter();c.presentation={portraitDataUrl:SAMPLE_A};await savePregen(c);c.presentation={portraitDataUrl:SAMPLE_B};await savePregen(c);assert.equal(loadPregens()[0].character.presentation.portraitDataUrl,SAMPLE_B);delete c.presentation;await savePregen(c);assert.equal(loadPregens()[0].character.presentation,undefined);const renamed=structuredClone(c);renamed.name="Same Mechanics New Name";await assert.rejects(()=>savePregen(renamed),/mechanically identical/i);
});
