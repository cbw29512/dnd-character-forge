import test from "node:test";
import assert from "node:assert/strict";
import { applyMonkAbilityProgression, monkAttackCount, monkExtraSaveProficiencies, monkFeatures, monkFlurryStrikes, monkProgression, monkResources, monkSaveDC, monkSpeed, monkUnarmoredAc } from "../src/rules/monk.js";

test("Monk progression covers every level 1-20 in both editions",()=>{
  for(const ruleset of ["2014","2024"])for(let level=1;level<=20;level++){
    const row=monkProgression(ruleset,level);assert.equal(row.level,level);assert.ok(row.martialArts);assert.ok(Array.isArray(row.features));
  }
});

test("Martial Arts die scaling remains edition-correct",()=>{
  assert.equal(monkProgression("2014",1).martialArts,"1d4");assert.equal(monkProgression("2014",5).martialArts,"1d6");assert.equal(monkProgression("2014",11).martialArts,"1d8");assert.equal(monkProgression("2014",17).martialArts,"1d10");
  assert.equal(monkProgression("2024",1).martialArts,"1d6");assert.equal(monkProgression("2024",5).martialArts,"1d8");assert.equal(monkProgression("2024",11).martialArts,"1d10");assert.equal(monkProgression("2024",17).martialArts,"1d12");
});

test("Ki and Focus points equal Monk level from level 2 onward",()=>{
  for(const ruleset of ["2014","2024"]){assert.equal(monkProgression(ruleset,1).focusPoints,0);for(let level=2;level<=20;level++)assert.equal(monkProgression(ruleset,level).focusPoints,level);}
});

test("Unarmored Movement scales at the exact Monk thresholds",()=>{
  for(const ruleset of ["2014","2024"]){assert.equal(monkProgression(ruleset,1).unarmoredMovement,0);assert.equal(monkProgression(ruleset,2).unarmoredMovement,10);assert.equal(monkProgression(ruleset,6).unarmoredMovement,15);assert.equal(monkProgression(ruleset,10).unarmoredMovement,20);assert.equal(monkProgression(ruleset,14).unarmoredMovement,25);assert.equal(monkProgression(ruleset,18).unarmoredMovement,30);}
});

test("Open Hand subclass timing preserves the edition difference at level 11",()=>{
  const oldFeatures=monkFeatures("2014",11,"open-hand"),newFeatures=monkFeatures("2024",11,"open-hand");
  assert.ok(oldFeatures.includes("Open Hand Technique"));assert.ok(oldFeatures.includes("Wholeness of Body"));assert.ok(oldFeatures.includes("Tranquility"));assert.ok(!oldFeatures.includes("Fleet Step"));
  assert.ok(newFeatures.includes("Open Hand Technique"));assert.ok(newFeatures.includes("Wholeness of Body"));assert.ok(newFeatures.includes("Fleet Step"));assert.ok(!newFeatures.includes("Tranquility"));
});

test("high-level Monk features remain edition-isolated",()=>{
  const oldFeatures=monkFeatures("2014",20,"open-hand"),newFeatures=monkFeatures("2024",20,"open-hand");
  for(const name of ["Diamond Soul","Empty Body","Perfect Self"])assert.ok(oldFeatures.includes(name));
  for(const name of ["Disciplined Survivor","Superior Defense","Body and Mind"])assert.ok(newFeatures.includes(name));
  assert.ok(!oldFeatures.includes("Body and Mind"));assert.ok(!newFeatures.includes("Perfect Self"));
});

test("Monk resources expose Martial Arts, Ki or Focus, movement, and Flurry count",()=>{
  const oldResources=monkResources("2014",10),newResources=monkResources("2024",10);
  assert.deepEqual(oldResources.map(item=>item.name),["Martial Arts","Ki Points","Unarmored Movement","Flurry of Blows"]);
  assert.deepEqual(newResources.map(item=>item.name),["Martial Arts","Focus Points","Unarmored Movement","Flurry of Blows"]);
  assert.equal(oldResources[0].value,"1d6");assert.equal(newResources[0].value,"1d8");assert.equal(oldResources.at(-1).value,"2 strikes");assert.equal(newResources.at(-1).value,"3 strikes");
});

test("Monk combat math derives AC, speed, attacks, and save DC",()=>{
  const abilities={str:10,dex:18,con:14,int:8,wis:16,cha:10};assert.equal(monkUnarmoredAc(abilities),17);assert.equal(monkSpeed(30,"2024",10),50);assert.equal(monkSpeed(30,"2024",10,{armored:true}),30);assert.equal(monkAttackCount(4),1);assert.equal(monkAttackCount(5),2);assert.equal(monkSaveDC(3,4),15);
});

test("all-save proficiency begins at level 14 in both editions",()=>{assert.deepEqual(monkExtraSaveProficiencies(13),[]);assert.deepEqual(monkExtraSaveProficiencies(14),["str","dex","con","int","wis","cha"]);});

test("2024 Heightened Focus increases Flurry to three strikes at level 10",()=>{assert.equal(monkFlurryStrikes("2024",9),2);assert.equal(monkFlurryStrikes("2024",10),3);assert.equal(monkFlurryStrikes("2014",20),2);});

test("2024 Body and Mind raises Dexterity and Wisdom by four to a maximum of 25",()=>{
  assert.deepEqual(applyMonkAbilityProgression({str:10,dex:20,con:14,int:8,wis:19,cha:10},"2024",20),{str:10,dex:24,con:14,int:8,wis:23,cha:10});
  assert.deepEqual(applyMonkAbilityProgression({str:10,dex:23,con:14,int:8,wis:24,cha:10},"2024",20),{str:10,dex:25,con:14,int:8,wis:25,cha:10});
  assert.equal(applyMonkAbilityProgression({str:10,dex:20,con:14,int:8,wis:20,cha:10},"2014",20).dex,20);
});

test("invalid Monk levels, rulesets, and subclasses fail closed",()=>{
  assert.throws(()=>monkProgression("2014",0),/integer from 1 to 20/i);assert.throws(()=>monkProgression("2024",21),/integer from 1 to 20/i);assert.throws(()=>monkProgression("2099",5),/Unsupported Monk ruleset/i);assert.throws(()=>monkFeatures("2024",5,"shadow"),/Unsupported Monk subclass/i);
});
