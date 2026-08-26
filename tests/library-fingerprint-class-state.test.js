import test from "node:test";
import assert from "node:assert/strict";
import { fingerprint, pregenFingerprintPayload } from "../src/library/fingerprint.js";

function baseCharacter(overrides={}) {
  return {
    ruleset:"2024",sourceMode:"srd",level:5,species:{id:"human"},size:"medium",class:{id:"warlock"},subclass:{id:"fiend"},background:{id:"sage"},
    abilities:{str:8,dex:14,con:14,int:12,wis:10,cha:17},skills:["arcana","deception"],expertise:[],saves:["wis","cha"],languages:["common"],feats:[],fightingStyles:[],masteryIds:[],inventory:[{name:"Dagger",quantity:2}],spells:{cantrips:["eldritch-blast"],prepared:["hex"]},...overrides
  };
}

test("pregen fingerprint distinguishes resolved Warlock mechanics", async()=>{
  const blade=baseCharacter({warlockSelections:{pactBoon:"pact-of-the-blade",invocations:["agonizing-blast","pact-of-the-blade"]}}),tome=baseCharacter({warlockSelections:{pactBoon:"pact-of-the-tome",invocations:["agonizing-blast","pact-of-the-tome"]}});
  assert.notEqual(await fingerprint(pregenFingerprintPayload(blade)),await fingerprint(pregenFingerprintPayload(tome)));
});

test("UI-only selected/randomized metadata does not create a false mechanical difference", async()=>{
  const a=baseCharacter({warlockSelections:{pactBoon:"pact-of-the-tome",invocations:["agonizing-blast","pact-of-the-tome"],selected:true,tome:{cantrips:["guidance"],selected:true,randomized:false}}}),b=baseCharacter({warlockSelections:{pactBoon:"pact-of-the-tome",invocations:["agonizing-blast","pact-of-the-tome"],selected:false,tome:{cantrips:["guidance"],selected:false,randomized:true}}});
  assert.equal(await fingerprint(pregenFingerprintPayload(a)),await fingerprint(pregenFingerprintPayload(b)));
});

test("pregen fingerprint distinguishes starting gold and magic-item packages", async()=>{
  const low=baseCharacter({startingMagic:{gold:500,items:[{id:"item-a",rarity:"uncommon",attunement:false}]}}),high=baseCharacter({startingMagic:{gold:1500,items:[{id:"item-b",rarity:"rare",attunement:true}]}});
  assert.notEqual(await fingerprint(pregenFingerprintPayload(low)),await fingerprint(pregenFingerprintPayload(high)));
});

test("class-specific resolved mechanics participate in saved-pregen identity beyond Warlock", async()=>{
  const bardA=baseCharacter({class:{id:"bard"},subclass:{id:"lore"},warlockSelections:null,bardSelections:{expertise:["arcana"]}}),bardB=baseCharacter({class:{id:"bard"},subclass:{id:"lore"},warlockSelections:null,bardSelections:{expertise:["deception"]}});
  assert.notEqual(await fingerprint(pregenFingerprintPayload(bardA)),await fingerprint(pregenFingerprintPayload(bardB)));
});
