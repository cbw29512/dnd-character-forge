import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";

function make(ruleset,level,{subclass="random",style=null}={}){
  try{
    const state=createInitialState();state.ruleset=ruleset;state.constraints.level=String(level);state.constraints.class="ranger";state.constraints.subclass=subclass;state.constraints.species="human";state.constraints.background=ruleset==="2014"?"acolyte":"soldier";if(style)state.classSelections={fightingStyle:style};return generateCharacter(state);
  }catch(error){console.error(`[test] ${ruleset} Ranger level ${level}`,error);throw error;}
}

test("2014 Ranger level 1 has exploration features but no class spellcasting or Fighting Style",()=>{
  const c=make("2014",1);assert.equal(c.validation.valid,true);assert.equal(c.spells,null);assert.equal(c.fightingStyles.length,0);assert.equal(c.masteryIds.length,0);assert.equal(c.rangerSelections.favoredEnemies.length,1);assert.equal(c.rangerSelections.naturalExplorerTerrains.length,1);assert.ok(c.features.includes("Favored Enemy"));assert.ok(c.features.includes("Natural Explorer"));
});

test("2014 Ranger level 2 uses spells known and gains one Fighting Style",()=>{
  const c=make("2014",2,{style:"archery"});assert.equal(c.spells.known.all.length,2);assert.equal(c.spells.prepared.all.length,0);assert.deepEqual(c.spells.slots,{1:2});assert.equal(c.fightingStyle.id,"archery");assert.equal(c.spells.alwaysPrepared.length,0);assert.equal(c.spells.cantrips.all.length,0);
});

test("2014 level-20 Hunter reaches exact legacy spell, exploration, subclass, and Foe Slayer state",()=>{
  const c=make("2014",20,{subclass:"hunter",style:"two-weapon"});assert.equal(c.spells.known.all.length,11);assert.deepEqual(c.spells.slots,{1:4,2:3,3:3,4:3,5:2});assert.equal(c.rangerSelections.favoredEnemies.length,3);assert.equal(c.rangerSelections.naturalExplorerTerrains.length,3);assert.ok(c.rangerSelections.huntersPrey);assert.ok(c.rangerSelections.defensiveTactics);assert.ok(c.rangerSelections.multiattack);assert.ok(c.rangerSelections.superiorDefense);assert.ok(c.features.includes("Feral Senses"));assert.ok(c.features.includes("Foe Slayer"));assert.equal(c.features.includes("Weapon Mastery — Ranger"),false);assert.equal(c.feats.some(feat=>feat.category==="Epic Boon"),false);
});

test("2024 Ranger level 1 starts with prepared spells, Hunter's Mark, and two masteries",()=>{
  const c=make("2024",1);assert.equal(c.spells.prepared.all.length,2);assert.equal(c.spells.known.all.length,0);assert.deepEqual(c.spells.alwaysPrepared,["hunters-mark"]);assert.equal(c.spells.hunterMarkFreeCasts,2);assert.equal(c.spells.hunterMarkDie,"d6");assert.equal(c.masteryIds.length,2);assert.equal(c.fightingStyles.length,0);assert.equal(c.expertise.length,0);
});

test("2024 Druidic Warrior grants two legal Druid cantrips plus Deft Explorer expertise and languages",()=>{
  const c=make("2024",2,{style:"druidic-warrior"});assert.equal(c.fightingStyle.id,"druidic-warrior");assert.equal(c.spells.cantrips.all.length,2);assert.equal(c.spells.prepared.all.length,3);assert.deepEqual(c.spells.alwaysPrepared,["hunters-mark"]);assert.equal(c.expertise.length,1);assert.equal(c.languages.length,5);assert.ok(c.features.includes("Deft Explorer"));
});

test("2024 level-20 Hunter reaches d10 Hunter's Mark, three Expertise choices, Roving, Blindsight, and Epic Boon",()=>{
  const c=make("2024",20,{subclass:"hunter",style:"archery"});assert.equal(c.spells.prepared.all.length,15);assert.equal(c.spells.hunterMarkFreeCasts,6);assert.equal(c.spells.hunterMarkDie,"d10");assert.deepEqual(c.spells.slots,{1:4,2:3,3:3,4:3,5:2});assert.equal(c.masteryIds.length,2);assert.equal(c.expertise.length,3);assert.equal(c.speed,40);assert.equal(c.ranger.blindsightRange,30);assert.ok(c.features.includes("Superior Hunter's Prey"));assert.ok(c.features.includes("Superior Hunter's Defense"));assert.ok(c.features.includes("Foe Slayer"));assert.ok(c.feats.some(feat=>feat.id==="boon-dimensional-travel"));
});
