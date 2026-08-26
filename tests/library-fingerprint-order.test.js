import test from "node:test";
import assert from "node:assert/strict";
import { fingerprint, pregenFingerprintPayload } from "../src/library/fingerprint.js";

function character(invocations,inventory){
  return {
    ruleset:"2024",sourceMode:"RAW",level:5,
    species:{id:"human"},size:"medium",
    class:{id:"warlock"},subclass:{id:"fiend-patron"},background:{id:"sage"},
    abilities:{str:8,dex:14,con:14,int:12,wis:10,cha:17},
    skills:["deception","arcana"],expertise:[],saves:["cha","wis"],languages:["common","draconic"],
    feats:[],fightingStyles:[],masteryIds:[],
    warlockSelections:{eldritchInvocations:invocations,pactBoon:"tome"},
    inventory,
    startingMagic:{gold:"500 gp",items:[{id:"item-b",rarity:"uncommon"},{id:"item-a",rarity:"common"}]},
    spells:{cantrips:["mage-hand","eldritch-blast"],prepared:["hex","charm-person"]}
  };
}

test("saved-pregen fingerprint is insensitive to unordered mechanical array order",async()=>{
  const a=character(
    ["agonizing-blast","pact-of-the-tome","devils-sight"],
    [{name:"Dagger",quantity:2},{name:"Leather Armor",quantity:1}]
  );
  const b=character(
    ["devils-sight","agonizing-blast","pact-of-the-tome"],
    [{name:"Leather Armor",quantity:1},{name:"Dagger",quantity:2}]
  );
  b.skills.reverse();b.saves.reverse();b.languages.reverse();b.spells.cantrips.reverse();b.spells.prepared.reverse();b.startingMagic.items.reverse();
  assert.equal(await fingerprint(pregenFingerprintPayload(a)),await fingerprint(pregenFingerprintPayload(b)));
});
