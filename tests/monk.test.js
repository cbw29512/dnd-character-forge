import test from "node:test";
import assert from "node:assert/strict";
import { monkFeatures, monkProgression, monkResources, monkSaveDC } from "../src/rules/monk.js";

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

test("Monk resources expose Martial Arts, Ki or Focus, and movement",()=>{
  const oldResources=monkResources("2014",10),newResources=monkResources("2024",10);
  assert.deepEqual(oldResources.map(item=>item.name),["Martial Arts","Ki Points","Unarmored Movement"]);
  assert.deepEqual(newResources.map(item=>item.name),["Martial Arts","Focus Points","Unarmored Movement"]);
  assert.equal(oldResources[0].value,"1d6");assert.equal(newResources[0].value,"1d8");
});

test("Monk save DC uses 8 + Wisdom modifier + proficiency",()=>{assert.equal(monkSaveDC(4,3),15);assert.equal(monkSaveDC(5,6),19);});

test("invalid Monk levels, rulesets, and subclasses fail closed",()=>{
  assert.throws(()=>monkProgression("2014",0),/integer from 1 to 20/i);assert.throws(()=>monkProgression("2024",21),/integer from 1 to 20/i);assert.throws(()=>monkProgression("2099",5),/Unsupported Monk ruleset/i);assert.throws(()=>monkFeatures("2024",5,"shadow"),/Unsupported Monk subclass/i);
});
