import test from "node:test";
import assert from "node:assert/strict";
import { RAW_2014 } from "../src/data/raw-2014.js";
import { RAW_2024 } from "../src/data/raw-2024.js";
import { applyMonkAdvancement } from "../src/rules/monk-advancement.js";

function monk(ruleset,level,abilities={str:10,dex:16,con:14,int:8,wis:16,cha:10}){return{ruleset,level,class:{id:"monk"},abilities:{...abilities},abilityMaximums:{str:20,dex:20,con:20,int:20,wis:20,cha:20},feats:[],advancementChoices:[]};}

test("2014 Monk uses five ASI-or-Grappler advancement levels",()=>{
  const result=applyMonkAdvancement(monk("2014",20),RAW_2014,{});assert.deepEqual(result.advancementChoices.map(item=>item.level),[4,8,12,16,19]);assert.equal(result.advancementChoices.length,5);
});

test("2024 Monk uses four General feat levels plus one Epic Boon",()=>{
  const result=applyMonkAdvancement(monk("2024",20),RAW_2024,{});assert.deepEqual(result.advancementChoices.map(item=>item.level),[4,8,12,16,19]);assert.equal(result.advancementChoices.at(-1).type,"epic-boon");
});

test("locked Monk Grappler is reserved before earlier Random advancement",()=>{
  for(let i=0;i<100;i++){
    const result=applyMonkAdvancement(monk("2024",12),RAW_2024,{8:"grappler"});
    assert.notEqual(result.advancementChoices.find(item=>item.level===4)?.id,"grappler");
    const locked=result.advancementChoices.find(item=>item.level===8);assert.equal(locked.id,"grappler");assert.equal(locked.locked,true);
  }
});

test("locked 2024 Monk Grappler stays legal when STR and DEX are already 20",()=>{
  const result=applyMonkAdvancement(monk("2024",4,{str:20,dex:20,con:14,int:8,wis:16,cha:10}),RAW_2024,{4:"grappler"}),choice=result.advancementChoices[0];
  assert.equal(choice.id,"grappler");assert.deepEqual(choice.increases,{});assert.equal(result.abilities.str,20);assert.equal(result.abilities.dex,20);
});

test("duplicate locked Monk Grappler selections fail closed",()=>{assert.throws(()=>applyMonkAdvancement(monk("2024",12),RAW_2024,{4:"grappler",8:"grappler"}),/cannot be selected more than once/i);});

test("Monk advancement rejects edition-ineligible choices",()=>{
  assert.throws(()=>applyMonkAdvancement(monk("2014",8,{str:14,dex:16,con:14,int:8,wis:16,cha:10}),RAW_2014,{4:"ability-score-improvement"}),/Illegal 2014 Monk advancement/i);
  assert.throws(()=>applyMonkAdvancement(monk("2024",8),RAW_2024,{4:"boon-fate"}),/Illegal 2024 Monk General feat/i);
  assert.throws(()=>applyMonkAdvancement(monk("2024",20),RAW_2024,{19:"boon-spell-recall"}),/Illegal Monk Epic Boon/i);
});
