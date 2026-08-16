import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { RAW_2024 } from "../src/data/raw-2024.js";
import { MASTERY_REFERENCE } from "../src/data/quick-reference.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference, masteryEntries } from "../src/rules/reference.js";

function make(ruleset,classId,level){const state=createInitialState();state.ruleset=ruleset;state.constraints.class=classId;state.constraints.level=String(level);return generateCharacter(state);}
test("every active feature in the verified slice builds a complete quick reference",()=>{
  try{for(const ruleset of ["2014","2024"])for(const classId of ["fighter","wizard","cleric"])for(let level=1;level<=5;level++){const c=make(ruleset,classId,level),refs=buildQuickReference(c);assert.ok(refs.length>0);assert.equal(new Set(refs.map(item=>item.id)).size,refs.length);for(const item of refs){assert.ok(item.name);assert.ok(item.category);assert.ok(item.timing);assert.ok(item.text.length>=20);}}}
  catch(error){console.error("[test] complete quick reference",error);throw error;}
});
test("2014 caster references preserve class-specific ritual rules",()=>{
  try{const wizard=buildQuickReference(make("2014","wizard",3)).find(ref=>ref.name==="Spellcasting"),cleric=buildQuickReference(make("2014","cleric",3)).find(ref=>ref.name==="Spellcasting");assert.match(wizard.text,/spellbook.*Ritual/i);assert.match(wizard.text,/without being prepared/i);assert.match(cleric.text,/prepared Cleric spell.*Ritual/i);}
  catch(error){console.error("[test] 2014 ritual references",error);throw error;}
});
test("2024 Fighter Second Wind reference uses level-specific healing and uses",()=>{try{const refs=buildQuickReference(make("2024","fighter",4)),item=refs.find(ref=>ref.name==="Second Wind");assert.match(item.text,/1d10 \+ 4 HP/);assert.match(item.text,/3 uses/);}catch(error){console.error("[test] Second Wind reference",error);throw error;}});
test("level 5 Wizard Arcane Recovery reference exposes three slot levels",()=>{try{for(const ruleset of ["2014","2024"]){const item=buildQuickReference(make(ruleset,"wizard",5)).find(ref=>ref.name==="Arcane Recovery");assert.match(item.text,/up to 3 total spell-slot levels/);}}catch(error){console.error("[test] Arcane Recovery reference",error);throw error;}});
test("level 5 Life Cleric reference calculates Preserve Life and Sear Undead",()=>{
  try{const c=make("2024","cleric",5),refs=buildQuickReference(c),preserve=refs.find(ref=>ref.name==="Preserve Life"),sear=refs.find(ref=>ref.name==="Sear Undead"),dice=Math.max(1,Math.floor((c.abilities.wis-10)/2));assert.match(preserve.text,/25 HP/);assert.match(sear.text,new RegExp(`${dice}d8`));}
  catch(error){console.error("[test] Cleric dynamic reference",error);throw error;}
});
test("every 2024 weapon record has a known mastery property",()=>{
  try{for(const [id,weapon] of Object.entries(RAW_2024.weapons)){assert.ok(weapon.mastery,`${id} missing mastery`);assert.ok(MASTERY_REFERENCE[weapon.mastery],`${weapon.mastery} missing reference`);}}
  catch(error){console.error("[test] mastery data completeness",error);throw error;}
});
test("generated Fighter mastery choices all resolve to friendly weapon/property entries",()=>{
  try{for(let i=0;i<250;i++){const c=make("2024","fighter",5),entries=masteryEntries(c);assert.equal(entries.length,c.masteryIds.length);for(const entry of entries){assert.ok(entry.weaponName);assert.ok(entry.property);}}}
  catch(error){console.error("[test] generated mastery references",error);throw error;}
});
