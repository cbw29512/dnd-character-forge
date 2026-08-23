import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { clericPickerLimits, validateClericSelections } from "../src/rules/cleric.js";

function clericState(ruleset,level){const state=createInitialState();state.ruleset=ruleset;state.constraints.class="cleric";state.constraints.level=String(level);if(ruleset==="2014")state.constraints.species="human";return state;}
test("2014 Life Cleric levels 1-5 use WIS-based prepared counts and domain spells",()=>{
  try{const prepared={1:4,2:5,3:6,4:8,5:9},cantrips={1:3,2:3,3:3,4:4,5:4},always={1:2,2:2,3:4,4:4,5:6};for(let level=1;level<=5;level++){const c=generateCharacter(clericState("2014",level));assert.equal(c.species.id,"human");assert.equal(c.subclass.id,"life-domain");assert.equal(c.spells.prepared.all.length,prepared[level]);assert.equal(c.spells.cantrips.all.length,cantrips[level]);assert.equal(c.spells.alwaysPrepared.length,always[level]);assert.equal(c.ac,18);}}
  catch(error){console.error("[test] 2014 Cleric progression",error);throw error;}
});
test("2024 Cleric levels 1-5 use fixed prepared-spell table and Life Domain timing",()=>{
  try{const prepared={1:4,2:5,3:6,4:7,5:9},baseCantrips={1:3,2:3,3:3,4:4,5:4},always={1:0,2:0,3:4,4:4,5:6};for(let level=1;level<=5;level++){const c=generateCharacter(clericState("2024",level));assert.equal(c.spells.prepared.all.length,prepared[level]);assert.equal(c.spells.cantrips.all.length,baseCantrips[level]+(c.divineOrder==="thaumaturge"?1:0));assert.equal(c.spells.alwaysPrepared.length,always[level]);if(level<3)assert.equal(c.subclass,null);else assert.equal(c.subclass.id,"life-domain");}}
  catch(error){console.error("[test] 2024 Cleric progression",error);throw error;}
});
test("four fixed 2024 Cleric cantrips constrain Divine Order to Thaumaturge",()=>{
  try{const state=clericState("2024",1);state.spellSelections.cantrips=["guidance","light","mending","resistance"];const c=generateCharacter(state);assert.equal(c.divineOrder,"thaumaturge");for(const id of state.spellSelections.cantrips)assert.ok(c.spells.cantrips.all.includes(id));}
  catch(error){console.error("[test] Cleric Thaumaturge constraint",error);throw error;}
});
test("Thaumaturge adds Wisdom modifier to Arcana and Religion checks",()=>{
  try{const state=clericState("2024",2);state.spellSelections.cantrips=["guidance","light","mending","resistance"];const c=generateCharacter(state),wis=Math.max(1,Math.floor((c.abilities.wis-10)/2));for(const skill of ["arcana","religion"]){const ability="int",base=Math.floor((c.abilities[ability]-10)/2)+(c.skills.includes(skill)?c.proficiency:0);assert.equal(c.skillBonuses[skill],base+wis);}}
  catch(error){console.error("[test] Thaumaturge checks",error);throw error;}
});
test("Life Domain spells are always prepared without consuming normal prepared slots",()=>{
  try{const c=generateCharacter(clericState("2024",5)),normal=new Set(c.spells.prepared.all);for(const id of ["aid","bless","cure-wounds","lesser-restoration","mass-healing-word","revivify"]){assert.ok(c.spells.alwaysPrepared.includes(id));assert.equal(normal.has(id),false);}}
  catch(error){console.error("[test] Life Domain prepared spells",error);throw error;}
});
test("picker blocks selecting a spell already always prepared by Life Domain",()=>{
  try{assert.throws(()=>validateClericSelections({ruleset:"2024",level:3,selections:{cantrips:[],prepared:["bless"]}}),/always prepared/);}
  catch(error){console.error("[test] Life Domain picker block",error);throw error;}
});
test("Cleric spell DC and attack bonus use Wisdom",()=>{
  try{const c=generateCharacter(clericState("2024",5)),wis=Math.floor((c.abilities.wis-10)/2);assert.equal(c.spells.saveDc,8+c.proficiency+wis);assert.equal(c.spells.attackBonus,c.proficiency+wis);}
  catch(error){console.error("[test] Cleric spell math",error);throw error;}
});
test("2024 Cleric chain shirt uses capped medium-armor Dexterity",()=>{
  try{const c=generateCharacter(clericState("2024",1)),dex=Math.floor((c.abilities.dex-10)/2);assert.equal(c.ac,13+Math.min(dex,2)+2);}
  catch(error){console.error("[test] Cleric medium armor",error);throw error;}
});
test("2024 Cleric picker exposes the legal Thaumaturge cantrip ceiling",()=>{try{assert.deepEqual(clericPickerLimits({ruleset:"2024",level:1}),{cantrips:4,prepared:4});}catch(error){console.error("[test] Cleric picker limits",error);throw error;}});
