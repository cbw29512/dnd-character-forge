import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { spellPickerConfigForState } from "../src/ui/spell-picker.js";
import { classChoiceFieldsForState } from "../src/ui/class-options.js";
import { emptySpellSelections, spellSelectionsFromCharacter } from "../src/ui/spell-selection-state.js";

function stateFor(ruleset,classId,level,subclass="random",classSelections={}){
  const state=createInitialState();state.ruleset=ruleset;state.constraints={...state.constraints,level:String(level),class:classId,subclass,species:"human",background:"acolyte",name:"UI Contract"};state.classSelections={...classSelections};state.spellSelections=emptySpellSelections();return state;
}

test("spell picker exposes every implemented spellcasting class with edition-correct buckets",()=>{
  const cases=[
    ["2014","wizard",20,"school-evocation",["cantrips","spellbook","prepared"]],
    ["2014","cleric",20,"life-domain",["cantrips","prepared"]],
    ["2014","bard",20,"college-lore",["cantrips","known","loreDiscoveries","magicalSecrets"]],
    ["2014","druid",20,"circle-land",["cantrips","prepared"]],
    ["2014","paladin",20,"oath-devotion",["prepared"]],
    ["2014","ranger",20,"hunter",["known"]],
    ["2014","sorcerer",20,"draconic-bloodline",["cantrips","known"]],
    ["2014","warlock",20,"fiend",["cantrips","known","arcanum6","arcanum7","arcanum8","arcanum9"]],
    ["2024","wizard",20,"evoker",["cantrips","spellbook","prepared"]],
    ["2024","cleric",20,"life-domain",["cantrips","prepared"]],
    ["2024","bard",20,"college-lore",["cantrips","prepared","loreDiscoveries"]],
    ["2024","druid",20,"circle-land",["cantrips","prepared"]],
    ["2024","paladin",20,"oath-devotion",["prepared"]],
    ["2024","ranger",20,"hunter",["prepared"]],
    ["2024","sorcerer",20,"draconic-sorcery",["cantrips","prepared"]],
    ["2024","warlock",20,"fiend-patron",["cantrips","prepared","arcanum6","arcanum7","arcanum8","arcanum9"]]
  ];
  for(const [ruleset,classId,level,subclass,buckets] of cases){const config=spellPickerConfigForState(stateFor(ruleset,classId,level,subclass));assert.deepEqual(config.buckets,buckets,`${ruleset} ${classId} picker buckets`);assert.equal(config.available,true);}
});

test("Paladin and Ranger cantrip pickers require their actual cantrip-granting Fighting Style",()=>{
  const paladinRandom=spellPickerConfigForState(stateFor("2024","paladin",20,"oath-devotion"));assert.equal(paladinRandom.buckets.includes("cantrips"),false);
  const paladinBlessed=spellPickerConfigForState(stateFor("2024","paladin",20,"oath-devotion",{fightingStyle:"blessed-warrior"}));assert.equal(paladinBlessed.buckets.includes("cantrips"),true);assert.equal(paladinBlessed.limits.cantrips,2);
  const rangerRandom=spellPickerConfigForState(stateFor("2024","ranger",20,"hunter"));assert.equal(rangerRandom.buckets.includes("cantrips"),false);
  const rangerDruidic=spellPickerConfigForState(stateFor("2024","ranger",20,"hunter",{fightingStyle:"druidic-warrior"}));assert.equal(rangerDruidic.buckets.includes("cantrips"),true);assert.equal(rangerDruidic.limits.cantrips,2);
});

test("Random Circle land reserves spells that any possible land could make automatic",()=>{
  const randomLand=spellPickerConfigForState(stateFor("2024","druid",20,"circle-land",{primalOrder:"warden"})),randomPrepared=new Set(randomLand.poolFor("prepared").map(spell=>spell.id));assert.equal(randomPrepared.has("fog-cloud"),false,"Fog Cloud can become a Polar Circle spell and must not be fixed while land remains Random");
  const arid=spellPickerConfigForState(stateFor("2024","druid",20,"circle-land",{primalOrder:"warden",circleLand:"arid"})),aridPrepared=new Set(arid.poolFor("prepared").map(spell=>spell.id));assert.equal(aridPrepared.has("fog-cloud"),true,"Fog Cloud is a legal normal preparation once Arid is fixed");assert.equal(aridPrepared.has("blight"),false,"Arid makes Blight automatic");
});

test("Class Options exposes spell-dependent Druid, Paladin, and Ranger controls",()=>{
  const druid=classChoiceFieldsForState(stateFor("2024","druid",20,"circle-land"));assert.ok(druid.some(field=>field.key==="primalOrder"));assert.ok(druid.some(field=>field.key==="circleLand"));assert.ok(druid.some(field=>field.key==="elementalFury"));
  const paladin=classChoiceFieldsForState(stateFor("2024","paladin",20,"oath-devotion"));assert.ok(paladin.find(field=>field.key==="fightingStyle")?.options.some(option=>option.id==="blessed-warrior"));
  const ranger=classChoiceFieldsForState(stateFor("2024","ranger",20,"hunter"));assert.ok(ranger.find(field=>field.key==="fightingStyle")?.options.some(option=>option.id==="druidic-warrior"));
});

test("saved Bard spell state restores non-overlapping 2014 source buckets",()=>{
  const restored=spellSelectionsFromCharacter({ruleset:"2014",class:{id:"bard"},spells:{cantrips:{all:["vicious-mockery"]},known:{all:["cure-wounds","eldritch-blast","hellish-rebuke"]},prepared:{all:[]},magicalSecrets:["eldritch-blast"],loreDiscoveries:["hellish-rebuke"]}});assert.deepEqual(restored.known,["cure-wounds"]);assert.deepEqual(restored.magicalSecrets,["eldritch-blast"]);assert.deepEqual(restored.loreDiscoveries,["hellish-rebuke"]);
  assert.deepEqual(Object.keys(emptySpellSelections()).sort(),["cantrips","known","loreDiscoveries","magicalSecrets","arcanum6","arcanum7","arcanum8","arcanum9","masteryLevel1","masteryLevel2","prepared","signatureSpells","spellbook"].sort());
});

test("saved Warlock spell state restores edition-correct Pact Magic and every Mystic Arcanum bucket",()=>{
  const legacy=spellSelectionsFromCharacter({ruleset:"2014",class:{id:"warlock"},spells:{cantrips:{all:["eldritch-blast"]},known:{all:["hex"]},prepared:{all:[]},mysticArcanum:{6:"circle-of-death",7:"finger-of-death",8:"demiplane",9:"true-polymorph"}}});
  assert.deepEqual(legacy.known,["hex"]);assert.deepEqual(legacy.prepared,[]);assert.deepEqual(legacy.arcanum6,["circle-of-death"]);assert.deepEqual(legacy.arcanum7,["finger-of-death"]);assert.deepEqual(legacy.arcanum8,["demiplane"]);assert.deepEqual(legacy.arcanum9,["true-polymorph"]);
  const revised=spellSelectionsFromCharacter({ruleset:"2024",class:{id:"warlock"},spells:{cantrips:{all:["eldritch-blast"]},known:{all:[]},prepared:{all:["hex"]},mysticArcanum:{6:"circle-of-death",7:"finger-of-death",8:"demiplane",9:"true-polymorph"}}});
  assert.deepEqual(revised.known,[]);assert.deepEqual(revised.prepared,["hex"]);assert.deepEqual(revised.arcanum6,["circle-of-death"]);assert.deepEqual(revised.arcanum9,["true-polymorph"]);
});
