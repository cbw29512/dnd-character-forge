import test from "node:test";
import assert from "node:assert/strict";
import { ROGUE_TABLES, rogueExpertiseCount, rogueExtraSaveProficiencies, rogueFeatures, rogueProgression, rogueResources } from "../src/rules/rogue.js";

const SNEAK=["1d6","1d6","2d6","2d6","3d6","3d6","4d6","4d6","5d6","5d6","6d6","6d6","7d6","7d6","8d6","8d6","9d6","9d6","10d6","10d6"];

test("Rogue progression covers levels 1-20 in both editions with exact Sneak Attack scaling",()=>{
  for(const ruleset of ["2014","2024"]){assert.equal(Object.keys(ROGUE_TABLES[ruleset]).length,20);for(let level=1;level<=20;level++)assert.equal(rogueProgression(ruleset,level).sneakAttack,SNEAK[level-1]);}
});

test("Rogue Expertise count increases from two to four at level 6",()=>{assert.equal(rogueExpertiseCount(1),2);assert.equal(rogueExpertiseCount(5),2);assert.equal(rogueExpertiseCount(6),4);assert.equal(rogueExpertiseCount(20),4);});

test("Reliable Talent timing remains edition-isolated",()=>{assert.ok(!rogueFeatures("2014",7).includes("Reliable Talent"));assert.ok(rogueFeatures("2014",11).includes("Reliable Talent"));assert.ok(rogueFeatures("2024",7).includes("Reliable Talent"));});

test("Slippery Mind grants different saving throw proficiencies by edition",()=>{assert.deepEqual(rogueExtraSaveProficiencies("2014",14),[]);assert.deepEqual(rogueExtraSaveProficiencies("2014",15),["wis"]);assert.deepEqual(rogueExtraSaveProficiencies("2024",15),["wis","cha"]);});

test("Thief feature acquisition levels are explicit in both editions",()=>{
  for(const ruleset of ["2014","2024"]){const three=rogueFeatures(ruleset,3,"thief"),nine=rogueFeatures(ruleset,9,"thief"),thirteen=rogueFeatures(ruleset,13,"thief"),seventeen=rogueFeatures(ruleset,17,"thief");assert.ok(three.includes("Fast Hands"));assert.ok(three.includes("Second-Story Work"));assert.ok(!three.includes("Supreme Sneak"));assert.ok(nine.includes("Supreme Sneak"));assert.ok(thirteen.includes("Use Magic Device"));assert.ok(seventeen.includes("Thief's Reflexes"));}
});

test("2024 Rogue resources add Cunning Strike at level 5 without altering Sneak Attack pool",()=>{const four=Object.fromEntries(rogueResources("2024",4).map(item=>[item.id,item.value])),five=Object.fromEntries(rogueResources("2024",5).map(item=>[item.id,item.value]));assert.equal(four["sneak-attack"],"2d6");assert.equal(four["cunning-strike"],undefined);assert.equal(five["sneak-attack"],"3d6");assert.equal(five["cunning-strike"],"3d6 pool");});

test("invalid Rogue levels and rulesets fail closed",()=>{assert.throws(()=>rogueProgression("2024",0),/1 to 20/i);assert.throws(()=>rogueProgression("2024",21),/1 to 20/i);assert.throws(()=>rogueProgression("2099",1),/Unsupported Rogue ruleset/i);assert.throws(()=>rogueFeatures("2024",3,"assassin"),/Unsupported Rogue subclass/i);});
