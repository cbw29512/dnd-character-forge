import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { SOURCE } from "../src/schema.js";
import { generateCharacter } from "../src/rules/generator.js";
import { advancementChoicesForState } from "../src/rules/advancement-feats.js";
import { FORGE_2024 } from "../src/data/forge-data.js";
import { savePregen } from "../src/library/local-library.js";

function stateFor({classId="fighter",subclass="champion",background="soldier",advancements=[],sourceMode=SOURCE.RAW}={}){
  const state=createInitialState();
  state.sourceMode=sourceMode;
  state.ruleset="2024";
  state.constraints.level="7";
  state.constraints.class=classId;
  state.constraints.subclass=subclass;
  state.constraints.species="human";
  state.constraints.background=background;
  state.classSelections.advancements=[...advancements];
  return state;
}

test("RAW mode fails closed on a fixed Forge Original background",()=>{
  assert.throws(()=>generateCharacter(stateFor({background:"grave-warden"})),/RAW mode cannot include Character Forge Original mechanics/i);
});

test("RAW mode fails closed on a fixed Forge Original subclass",()=>{
  assert.throws(()=>generateCharacter(stateFor({classId:"paladin",subclass:"oath-beacon"})),/RAW mode cannot include Character Forge Original mechanics/i);
});

test("RAW mode fails closed on a fixed Forge Original advancement feat",()=>{
  assert.throws(()=>generateCharacter(stateFor({advancements:["fleet-vanguard"]})),/RAW mode cannot include Character Forge Original mechanics/i);
});

test("explicit compatible mode can still exercise Original content without claiming RAW integrity",()=>{
  const character=generateCharacter(stateFor({classId:"paladin",subclass:"oath-beacon",background:"grave-warden",sourceMode:SOURCE.HOMEBREW}));
  assert.equal(character.sourceMode,SOURCE.HOMEBREW);
  assert.equal(character.validation.valid,true);
  assert.equal(character.audit.status,"PASS");
  assert.equal(character.audit.rawIntegrity,false);
  assert.equal(character.background.contentKind,"forge-original");
  assert.equal(character.subclass.contentKind,"forge-original");
});

test("RAW advancement UI choices exclude every Forge Original feat",()=>{
  const fighter=FORGE_2024.classes.find(item=>item.id==="fighter");
  const raw=advancementChoicesForState("2024",fighter,20,SOURCE.RAW).flatMap(slot=>slot.options);
  const compatible=advancementChoicesForState("2024",fighter,20,SOURCE.HOMEBREW).flatMap(slot=>slot.options);
  assert.equal(raw.some(option=>option.contentKind==="forge-original"),false);
  assert.equal(compatible.some(option=>option.contentKind==="forge-original"),true);
});

test("My Pregens rejects compatible content even if a caller attempts to save it",async()=>{
  const previous=globalThis.localStorage;
  globalThis.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
  try{
    const character=generateCharacter(stateFor({background:"grave-warden",sourceMode:SOURCE.HOMEBREW}));
    await assert.rejects(savePregen(character),/RAW-certified Character Forge characters only/i);
  }finally{
    if(previous===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous;
  }
});
