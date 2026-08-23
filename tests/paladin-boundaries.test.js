import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";

function paladin(ruleset,level,classSelections={},spellSelections={}){
  try{const state=createInitialState();state.ruleset=ruleset;state.constraints.level=String(level);state.constraints.class="paladin";state.constraints.species="human";state.constraints.background=ruleset==="2014"?"acolyte":"soldier";state.classSelections=classSelections;state.spellSelections=spellSelections;return generateCharacter(state);}
  catch(error){console.error(`[test] ${ruleset} Paladin level ${level} generation failed`,error);throw error;}
}

test("2014 Paladin starts spellcasting and Divine Smite at level 2, not level 1",()=>{
  const one=paladin("2014",1),two=paladin("2014",2);
  assert.equal(one.spells,null);assert.equal(one.features.includes("Spellcasting"),false);assert.equal(one.features.includes("Divine Smite"),false);assert.equal(one.fightingStyles.length,0);assert.equal(one.masteryIds.length,0);assert.equal(one.paladin.layOnHandsPool,5);
  assert.ok(two.spells);assert.deepEqual(two.spells.slots,{1:2});assert.ok(two.features.includes("Spellcasting"));assert.ok(two.features.includes("Divine Smite"));assert.equal(two.fightingStyles.length,1);assert.equal(two.masteryIds.length,0);assert.equal(two.validation.valid,true);
});

test("2024 Paladin has level-1 spellcasting and mastery, then Paladin's Smite at level 2",()=>{
  const one=paladin("2024",1),two=paladin("2024",2);
  assert.ok(one.spells);assert.deepEqual(one.spells.slots,{1:2});assert.equal(one.spells.prepared.all.length,2);assert.equal(one.masteryIds.length,2);assert.ok(one.features.includes("Weapon Mastery — Paladin"));assert.equal(one.features.includes("Paladin’s Smite"),false);assert.equal(one.fightingStyles.length,0);
  assert.ok(two.features.includes("Paladin’s Smite"));assert.equal(two.fightingStyles.length,1);assert.ok(two.spells.alwaysPrepared.includes("divine-smite"));assert.equal(two.validation.valid,true);
});

test("2024 Blessed Warrior grants exactly two legal Cleric cantrips using constrained selections",()=>{
  const c=paladin("2024",2,{fightingStyle:"blessed-warrior"},{cantrips:["guidance","light"]});
  assert.equal(c.fightingStyle.id,"blessed-warrior");assert.deepEqual(c.spells.cantrips.all,["guidance","light"]);assert.equal(c.spells.cantrips.all.length,2);assert.throws(()=>paladin("2024",2,{fightingStyle:"defense"},{cantrips:["guidance"]}),/require Blessed Warrior/i);
});
