import test from "node:test";
import assert from "node:assert/strict";
import { wizardFeatures } from "../src/rules/wizard-features.js";
import { clericFeatures } from "../src/rules/cleric-features.js";

test("2014 Evocation feature timing is exact",()=>{
  assert.ok(wizardFeatures("2014",2,"school-evocation").includes("Sculpt Spells"));
  assert.ok(!wizardFeatures("2014",5,"school-evocation").includes("Potent Cantrip"));
  assert.ok(wizardFeatures("2014",6,"school-evocation").includes("Potent Cantrip"));
  assert.ok(wizardFeatures("2014",10,"school-evocation").includes("Empowered Evocation"));
  assert.ok(wizardFeatures("2014",14,"school-evocation").includes("Overchannel"));
});

test("2024 Evoker feature timing is exact",()=>{
  const three=wizardFeatures("2024",3,"evoker");assert.ok(three.includes("Evocation Savant"));assert.ok(three.includes("Potent Cantrip"));assert.ok(!three.includes("Sculpt Spells"));
  assert.ok(wizardFeatures("2024",6,"evoker").includes("Sculpt Spells"));assert.ok(wizardFeatures("2024",10,"evoker").includes("Empowered Evocation"));assert.ok(wizardFeatures("2024",14,"evoker").includes("Overchannel"));
});

test("2014 Life Domain progression includes all subclass features",()=>{
  const six=clericFeatures("2014",6,"life-domain");assert.ok(six.includes("Blessed Healer"));assert.ok(six.includes("Channel Divinity (2/rest)"));
  const eight=clericFeatures("2014",8,"life-domain");assert.ok(eight.includes("Divine Strike"));
  const seventeen=clericFeatures("2014",17,"life-domain");assert.ok(seventeen.includes("Supreme Healing"));assert.ok(seventeen.includes("Destroy Undead (CR 4)"));
});

test("2024 Life Domain progression stays edition-correct",()=>{
  const six=clericFeatures("2024",6,"life-domain","protector");assert.ok(six.includes("Blessed Healer"));assert.ok(six.includes("Channel Divinity (3 uses)"));assert.ok(!six.includes("Divine Strike"));
  const seventeen=clericFeatures("2024",17,"life-domain","thaumaturge");assert.ok(seventeen.includes("Supreme Healing"));assert.ok(seventeen.includes("Greater Divine Intervention")==false);
  assert.ok(clericFeatures("2024",20,"life-domain","thaumaturge").includes("Greater Divine Intervention"));
});

test("unsupported caster subclasses fail closed",()=>{
  assert.throws(()=>wizardFeatures("2024",3,"illusionist"),/Unsupported 2024 Wizard subclass/i);
  assert.throws(()=>clericFeatures("2014",1,"war-domain"),/Unsupported 2014 Cleric subclass/i);
});
