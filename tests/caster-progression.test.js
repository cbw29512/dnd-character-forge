import test from "node:test";
import assert from "node:assert/strict";
import { wizardProgression, wizardFeaturesThrough } from "../src/rules/wizard-progression.js";
import { clericProgression, clericFeaturesThrough } from "../src/rules/cleric-progression.js";

test("Wizard progression covers 1 through 20 in both editions",()=>{
  for(const ruleset of ["2014","2024"])for(let level=1;level<=20;level++){const row=wizardProgression(ruleset,level);assert.equal(row.level,level);assert.ok(row.cantrips>=3);assert.ok(Object.keys(row.slots).length>=1);}
});

test("2024 Wizard prepared-spell progression preserves high-level jumps",()=>{
  const expected={1:4,5:9,10:15,13:17,14:18,16:21,18:23,20:25};
  for(const [level,count] of Object.entries(expected))assert.equal(wizardProgression("2024",Number(level)).prepared,count);
  assert.equal(wizardProgression("2014",20).prepared,null);
});

test("Wizard capstone and edition-specific features stay isolated",()=>{
  const old=wizardFeaturesThrough("2014",20),modern=wizardFeaturesThrough("2024",20);
  assert.ok(old.includes("Arcane Tradition"));assert.ok(!old.includes("Ritual Adept"));
  assert.ok(modern.includes("Ritual Adept"));assert.ok(modern.includes("Scholar"));assert.ok(modern.includes("Epic Boon"));
  assert.ok(old.includes("Spell Mastery"));assert.ok(old.includes("Signature Spells"));assert.ok(modern.includes("Signature Spells"));
});

test("Cleric progression covers 1 through 20 in both editions",()=>{
  for(const ruleset of ["2014","2024"])for(let level=1;level<=20;level++){const row=clericProgression(ruleset,level);assert.equal(row.level,level);assert.ok(row.cantrips>=3);assert.ok(Object.keys(row.slots).length>=1);}
});

test("2024 Cleric prepared and Channel Divinity counts match progression",()=>{
  const prepared={1:4,5:9,10:15,14:17,18:20,20:22};for(const [level,count] of Object.entries(prepared))assert.equal(clericProgression("2024",Number(level)).prepared,count);
  assert.equal(clericProgression("2024",1).channelDivinity,0);assert.equal(clericProgression("2024",2).channelDivinity,2);assert.equal(clericProgression("2024",6).channelDivinity,3);assert.equal(clericProgression("2024",18).channelDivinity,4);
  assert.equal(clericProgression("2014",2).channelDivinity,1);assert.equal(clericProgression("2014",6).channelDivinity,2);assert.equal(clericProgression("2014",18).channelDivinity,3);
});

test("Cleric high-level features remain edition-isolated",()=>{
  const old=clericFeaturesThrough("2014",20),modern=clericFeaturesThrough("2024",20);
  assert.ok(old.includes("Destroy Undead (CR 4)"));assert.ok(old.includes("Divine Intervention improvement"));
  assert.ok(modern.includes("Blessed Strikes"));assert.ok(modern.includes("Greater Divine Intervention"));assert.ok(!modern.includes("Destroy Undead (CR 4)"));
});

test("invalid caster progression requests fail closed",()=>{
  assert.throws(()=>wizardProgression("2099",1),/Unsupported Wizard ruleset/i);assert.throws(()=>clericProgression("2099",1),/Unsupported Cleric ruleset/i);assert.throws(()=>wizardProgression("2024",21),/1 to 20/i);assert.throws(()=>clericProgression("2014",0),/1 to 20/i);
});
