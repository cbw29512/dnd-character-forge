import test from "node:test";
import assert from "node:assert/strict";
import { RAW_2014 } from "../src/data/raw-2014.js";
import { RAW_2024 } from "../src/data/raw-2024.js";
import { applyRogueAdvancement, ROGUE_ADVANCEMENT } from "../src/rules/rogue-advancement.js";
import { rogueExpertiseCount, rogueExtraSaveProficiencies, rogueProgression } from "../src/rules/rogue.js";

function rogue(ruleset,level){return{ruleset,level,class:{id:"rogue"},abilities:{str:10,dex:17,con:14,int:13,wis:12,cha:8},abilityMaximums:{str:20,dex:20,con:20,int:20,wis:20,cha:20},feats:[],advancementChoices:[]};}

test("Rogue ASI levels remain edition correct",()=>{try{assert.deepEqual(ROGUE_ADVANCEMENT.levels2014,[4,8,10,12,16,19]);assert.deepEqual(ROGUE_ADVANCEMENT.levels2024,[4,8,10,12,16]);}catch(error){console.error("[test] Rogue advancement levels",error);throw error;}});

test("Sneak Attack scales exactly from 1d6 to 10d6",()=>{try{for(const ruleset of ["2014","2024"]){assert.equal(rogueProgression(ruleset,1).sneakAttack,"1d6");assert.equal(rogueProgression(ruleset,5).sneakAttack,"3d6");assert.equal(rogueProgression(ruleset,11).sneakAttack,"6d6");assert.equal(rogueProgression(ruleset,20).sneakAttack,"10d6");}}catch(error){console.error("[test] Rogue Sneak Attack",error);throw error;}});

test("Expertise and Slippery Mind preserve edition-specific counts",()=>{try{assert.equal(rogueExpertiseCount(1),2);assert.equal(rogueExpertiseCount(6),4);assert.deepEqual(rogueExtraSaveProficiencies("2014",15),["wis"]);assert.deepEqual(rogueExtraSaveProficiencies("2024",15),["wis","cha"]);}catch(error){console.error("[test] Rogue expertise and saves",error);throw error;}});

test("2014 level 20 Rogue applies all six ASI opportunities without exceeding 20",()=>{try{const result=applyRogueAdvancement(rogue("2014",20),RAW_2014);assert.equal(result.advancementChoices.length,6);assert.ok(Object.values(result.abilities).every(score=>score<=20));assert.equal(result.abilities.dex,20);}catch(error){console.error("[test] 2014 Rogue advancement",error);throw error;}});

test("2024 level 20 Rogue has five normal advancement choices plus one Epic Boon",()=>{try{for(let i=0;i<100;i++){const result=applyRogueAdvancement(rogue("2024",20),RAW_2024),epic=result.advancementChoices.filter(choice=>choice.type==="epic-boon");assert.equal(result.advancementChoices.length,6);assert.equal(epic.length,1);assert.ok(ROGUE_ADVANCEMENT.epicBoons.includes(epic[0].id));assert.equal(result.abilityMaximums[Object.keys(epic[0].increases)[0]],30);}}catch(error){console.error("[test] 2024 Rogue advancement",error);throw error;}});

test("invalid Rogue progression fails closed",()=>{try{assert.throws(()=>rogueProgression("2024",0),/1 to 20/i);assert.throws(()=>rogueProgression("2099",1),/Unsupported Rogue ruleset/i);}catch(error){console.error("[test] Rogue fail closed",error);throw error;}});
