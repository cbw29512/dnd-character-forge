import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { SOURCE } from "../src/schema.js";
import { generateCharacter } from "../src/rules/generator.js";
import { createAbilityFeat } from "../src/rules/homebrew.js";

test("RAW generation never contains homebrew",()=>{
  try { const s=createInitialState(),c=generateCharacter(s); assert.equal(c.sourceMode,SOURCE.RAW); assert.equal(c.homebrew.length,0); assert.equal(c.validation.valid,true); }
  catch(error){ console.error("[test] RAW generation",error); throw error; }
});
test("user selections remain fixed while Random fields are generated",()=>{
  try { const s=createInitialState(); s.constraints.level="3"; s.constraints.class="fighter"; const c=generateCharacter(s); assert.equal(c.level,3); assert.equal(c.class.id,"fighter"); assert.equal(c.subclass.id,"champion"); }
  catch(error){ console.error("[test] constraints",error); throw error; }
});
test("fixed subclass constrains a Random level to legal levels",()=>{
  try { const s=createInitialState(); s.constraints.class="wizard"; s.constraints.subclass="evoker"; const c=generateCharacter(s); assert.equal(c.subclass.id,"evoker"); assert.ok(c.level>=3); }
  catch(error){ console.error("[test] subclass level constraint",error); throw error; }
});
test("homebrew mode may extend RAW and recalculates derived stats",()=>{
  try { const s=createInitialState(); s.sourceMode=SOURCE.HOMEBREW; s.constraints.level="1"; const feat=createAbilityFeat({name:"Titan Spark",ability:"dex",amount:2}); s.homebrew.push(feat); const c=generateCharacter(s); assert.equal(c.homebrew.length,1); assert.equal(c.validation.valid,true); }
  catch(error){ console.error("[test] homebrew",error); throw error; }
});
test("1000 generated characters all pass validation",()=>{
  try { for(let i=0;i<1000;i+=1){ const c=generateCharacter(createInitialState()); assert.equal(c.validation.valid,true); } }
  catch(error){ console.error("[test] torture generation",error); throw error; }
});
test("2014 Fighter Defense style modifies AC when selected",()=>{
  try { const s=createInitialState(); s.ruleset="2014"; s.constraints.level="1"; s.constraints.class="fighter"; let found=null; for(let i=0;i<100;i+=1){ const c=generateCharacter(s); if(c.fightingStyle?.name==="Defense"){found=c;break;} } assert.ok(found); assert.equal(found.ac,16+1+(found.equipment.shield?2:0)); }
  catch(error){ console.error("[test] 2014 Defense",error); throw error; }
});
test("2024 Alert adds proficiency bonus to initiative",()=>{
  try { const s=createInitialState(); s.constraints.level="1"; s.constraints.background="criminal"; const c=generateCharacter(s); assert.ok(c.feats.some(f=>f.id==="alert")); const dex=Math.floor((c.abilities.dex-10)/2); assert.equal(c.initiative,dex+c.proficiency); }
  catch(error){ console.error("[test] Alert",error); throw error; }
});
test("2024 Human Skillful and Skilled grant distinct skill proficiencies",()=>{
  try { const s=createInitialState(); s.constraints.level="1"; let skilled=null; for(let i=0;i<100;i+=1){ const c=generateCharacter(s); if(c.feats.some(f=>f.id==="skilled")){skilled=c;break;} } assert.ok(skilled); assert.equal(new Set(skilled.skills).size,skilled.skills.length); assert.ok(skilled.skills.length>=8); }
  catch(error){ console.error("[test] Human skills",error); throw error; }
});
test("generated characters include complete save, skill, language, and background equipment data",()=>{
  try { const c=generateCharacter(createInitialState()); assert.equal(Object.keys(c.saveBonuses).length,6); assert.equal(Object.keys(c.skillBonuses).length,18); assert.equal(c.languages.length,3); assert.ok(c.background.equipment.length>0); assert.ok(Number.isInteger(c.passivePerception)); }
  catch(error){ console.error("[test] playable derived data",error); throw error; }
});
test("generated rules choices contain no duplicates",()=>{
  try { for(let i=0;i<500;i+=1){ const c=generateCharacter(createInitialState()); assert.equal(new Set(c.skills).size,c.skills.length); assert.equal(new Set(c.languages.map(v=>v.toLowerCase())).size,c.languages.length); assert.equal(new Set(c.feats.map(v=>v.id)).size,c.feats.length); assert.equal(new Set(c.masteryIds).size,c.masteryIds.length); assert.equal(new Set(c.attacks.map(v=>v.name.toLowerCase())).size,c.attacks.length); if(c.spells){assert.equal(new Set(c.spells.cantrips.all).size,c.spells.cantrips.all.length); assert.equal(new Set(c.spells.spellbook.all).size,c.spells.spellbook.all.length); assert.equal(new Set(c.spells.prepared.all).size,c.spells.prepared.all.length);} } }
  catch(error){ console.error("[test] duplicates",error); throw error; }
});
test("inventory consolidates repeated equipment into quantities",()=>{
  try { const s=createInitialState(); s.constraints.background="soldier"; s.constraints.class="fighter"; let c=null; for(let i=0;i<100;i+=1){ const candidate=generateCharacter(s); if(candidate.equipment.weapons.includes("javelin")){c=candidate;break;} } assert.ok(c); const javelins=c.inventory.filter(item=>item.name.toLowerCase().startsWith("javelin")); assert.equal(javelins.length,1); assert.ok(javelins[0].quantity>=9); }
  catch(error){ console.error("[test] inventory consolidation",error); throw error; }
});
