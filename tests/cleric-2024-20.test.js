import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { clericProgressionFor, lifeDomainAlwaysPrepared, validateClericClassSelections } from "../src/rules/cleric.js";
import { CLERIC_SPELLS_2014, CLERIC_SPELLS_2024 } from "../src/data/cleric-spells.js";
import { buildQuickReference } from "../src/rules/reference.js";
import { pregenFingerprintPayload } from "../src/library/fingerprint.js";
import { renderCharacter } from "../src/ui/render.js";

const PREPARED={1:4,2:5,3:6,4:7,5:9,6:10,7:11,8:12,9:14,10:15,11:16,12:16,13:17,14:17,15:18,16:18,17:19,18:20,19:21,20:22};
const CANTRIPS={1:3,2:3,3:3,4:4,5:4,6:4,7:4,8:4,9:4,10:5,11:5,12:5,13:5,14:5,15:5,16:5,17:5,18:5,19:5,20:5};
const SLOTS={1:{1:2},2:{1:3},3:{1:4,2:2},4:{1:4,2:3},5:{1:4,2:3,3:2},6:{1:4,2:3,3:3},7:{1:4,2:3,3:3,4:1},8:{1:4,2:3,3:3,4:2},9:{1:4,2:3,3:3,4:3,5:1},10:{1:4,2:3,3:3,4:3,5:2},11:{1:4,2:3,3:3,4:3,5:2,6:1},12:{1:4,2:3,3:3,4:3,5:2,6:1},13:{1:4,2:3,3:3,4:3,5:2,6:1,7:1},14:{1:4,2:3,3:3,4:3,5:2,6:1,7:1},15:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},16:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},17:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1,9:1},18:{1:4,2:3,3:3,4:3,5:3,6:1,7:1,8:1,9:1},19:{1:4,2:3,3:3,4:3,5:3,6:2,7:1,8:1,9:1},20:{1:4,2:3,3:3,4:3,5:3,6:2,7:2,8:1,9:1}};
const HIGH_SPELLS={
  4:["Aura of Life","Banishment","Control Water","Death Ward","Divination","Freedom of Movement","Guardian of Faith","Locate Creature","Stone Shape"],
  5:["Commune","Contagion","Dispel Evil and Good","Flame Strike","Geas","Greater Restoration","Hallow","Insect Plague","Legend Lore","Mass Cure Wounds","Planar Binding","Raise Dead","Scrying"],
  6:["Blade Barrier","Create Undead","Find the Path","Forbiddance","Harm","Heal","Heroes’ Feast","Planar Ally","Sunbeam","True Seeing","Word of Recall"],
  7:["Conjure Celestial","Divine Word","Etherealness","Fire Storm","Plane Shift","Regenerate","Resurrection","Symbol"],
  8:["Antimagic Field","Control Weather","Earthquake","Holy Aura","Sunburst"],
  9:["Astral Projection","Gate","Mass Heal","Power Word Heal","True Resurrection"]
};
function clericAt(level,{divineOrder="thaumaturge",blessedStrikes=level>=7?"divine-strike":null,spellSelections={}}={}){
  try{const state=createInitialState();state.ruleset="2024";state.constraints.level=String(level);state.constraints.class="cleric";state.constraints.subclass=level>=3?"life-domain":"random";state.constraints.species="dwarf";state.constraints.background="criminal";state.classSelections={divineOrder,...(blessedStrikes?{blessedStrikes}:{})};state.spellSelections={...state.spellSelections,...spellSelections};return generateCharacter(state);}catch(error){console.error(`[test] 2024 Cleric level ${level}`,error);throw error;}
}

test("2024 Life Cleric generates and validates at every level 1 through 20",()=>{
  for(let level=1;level<=20;level++){const c=clericAt(level);assert.equal(c.level,level);assert.equal(c.class.id,"cleric");assert.equal(c.validation.valid,true);assert.equal(c.divineOrder,"thaumaturge");if(level>=3)assert.equal(c.subclass.id,"life-domain");else assert.equal(c.subclass,null);if(level>=7)assert.equal(c.blessedStrikes,"divine-strike");else assert.equal(c.blessedStrikes,null);}
});

test("2024 Cleric class table matches all 20 levels",()=>{
  for(let level=1;level<=20;level++){const expected=clericProgressionFor(level),c=clericAt(level);assert.equal(expected.cantrips,CANTRIPS[level],`level ${level} cantrips`);assert.equal(expected.prepared,PREPARED[level],`level ${level} prepared`);assert.deepEqual(expected.slots,SLOTS[level],`level ${level} slots`);assert.equal(c.spells.cantrips.all.length,CANTRIPS[level]+1,`level ${level} Thaumaturge cantrips`);assert.equal(c.spells.prepared.all.length,PREPARED[level],`level ${level} normal prepared`);assert.deepEqual(c.spells.slots,SLOTS[level],`level ${level} generated slots`);assert.equal(c.cleric.channelDivinityUses,level<2?0:level<6?2:level<18?3:4);assert.equal(c.cleric.divineSparkDice,level<2?0:level<7?1:level<13?2:level<18?3:4);}
});

test("Life Domain always-prepared progression is exact through level 20",()=>{
  const expected={1:[],2:[],3:["aid","bless","cure-wounds","lesser-restoration"],5:["aid","bless","cure-wounds","lesser-restoration","mass-healing-word","revivify"],7:["aid","bless","cure-wounds","lesser-restoration","mass-healing-word","revivify","aura-of-life","death-ward"],9:["aid","bless","cure-wounds","lesser-restoration","mass-healing-word","revivify","aura-of-life","death-ward","greater-restoration","mass-cure-wounds"]};
  for(const [level,ids] of Object.entries(expected)){assert.deepEqual(lifeDomainAlwaysPrepared("2024",Number(level)),ids);const c=clericAt(Number(level));assert.deepEqual(c.spells.alwaysPrepared,ids);for(const id of ids)assert.ok(!c.spells.prepared.all.includes(id));}
  assert.deepEqual(clericAt(20).spells.alwaysPrepared,expected[9]);
});

test("high-level Cleric and Life Domain feature breakpoints are exact",()=>{
  const at=level=>clericAt(level).features;
  assert.ok(!at(5).includes("Blessed Healer"));assert.ok(at(6).includes("Blessed Healer"));assert.ok(at(7).includes("Blessed Strikes"));assert.ok(at(10).includes("Divine Intervention"));assert.ok(at(14).includes("Improved Blessed Strikes"));assert.ok(at(17).includes("Supreme Healing"));assert.ok(at(19).includes("Epic Boon"));assert.ok(at(20).includes("Greater Divine Intervention"));
});

test("Divine Order and Blessed Strikes fixed choices stay fixed and illegal timing fails closed",()=>{
  const protector=clericAt(10,{divineOrder:"protector",blessedStrikes:"potent-spellcasting"});assert.equal(protector.divineOrder,"protector");assert.equal(protector.blessedStrikes,"potent-spellcasting");assert.equal(protector.spells.cantrips.all.length,5);
  assert.throws(()=>validateClericClassSelections({ruleset:"2024",level:6,selections:{blessedStrikes:"divine-strike"}}),/unavailable before Cleric level 7/i);
  assert.throws(()=>validateClericClassSelections({ruleset:"2024",level:10,selections:{divineOrder:"protector"},spellSelections:{cantrips:["guidance","light","mending","resistance","sacred-flame","spare-the-dying"]}}),/Protector cannot support the extra Thaumaturge cantrip/i);
});

test("Boon of Fate appears at level 19 with legal ability adjustment and exact provenance",()=>{
  assert.ok(!clericAt(18).feats.some(feat=>feat.id==="boon-fate"));const c=clericAt(19),boon=c.feats.find(feat=>feat.id==="boon-fate");assert.ok(boon);assert.ok(c.epicBoonAbility);assert.equal(c.abilityMaximums[c.epicBoonAbility],30);const refs=buildQuickReference(c),boonRef=refs.find(item=>item.name==="Boon of Fate"),epicRef=refs.find(item=>item.name==="Epic Boon");assert.equal(boonRef.source.page,"88");assert.equal(epicRef.source.page,"38");assert.match(boonRef.text,/2d4/);assert.match(boonRef.text,/60 ft/);
});

test("level 20 Cleric quick references expose current scaled resources and capstones",()=>{
  const c=clericAt(20,{blessedStrikes:"potent-spellcasting"}),refs=buildQuickReference(c),byName=new Map(refs.map(item=>[item.name,item]));
  assert.match(byName.get("Channel Divinity").text,/4 uses/);assert.match(byName.get("Divine Spark").text,/4d8/);assert.match(byName.get("Blessed Strikes").text,/Potent Spellcasting/);assert.match(byName.get("Improved Blessed Strikes").text,/Temporary Hit Points/);assert.match(byName.get("Divine Intervention").text,/level 5 or lower/);assert.match(byName.get("Greater Divine Intervention").text,/Wish/);assert.match(byName.get("Greater Divine Intervention").text,/2d4 Long Rests/);assert.match(byName.get("Supreme Healing").text,/highest possible result/);for(const name of ["Channel Divinity","Divine Spark","Blessed Healer","Blessed Strikes","Divine Intervention","Improved Blessed Strikes","Supreme Healing","Greater Divine Intervention"]){assert.equal(byName.get(name).source.version,"SRD 5.2.1");assert.ok(byName.get(name).source.page);}
});

test("2024 Cleric spell catalog has exact verified level 4 through 9 lists while 2014 stays unexpanded",()=>{
  for(const [level,names] of Object.entries(HIGH_SPELLS)){const actual=CLERIC_SPELLS_2024.filter(spell=>spell.level===Number(level)).map(spell=>spell.name);assert.deepEqual(actual,names,`Cleric level ${level}`);}
  assert.equal(new Set(CLERIC_SPELLS_2024.map(spell=>spell.id)).size,CLERIC_SPELLS_2024.length);for(let level=0;level<=9;level++)assert.ok(CLERIC_SPELLS_2024.some(spell=>spell.level===level),`missing Cleric spell level ${level}`);assert.equal(Math.max(...CLERIC_SPELLS_2014.map(spell=>spell.level)),3);
});

test("level 20 Cleric sheet renders class resources and grouped spell levels",()=>{
  const c=clericAt(20),target={innerHTML:""};renderCharacter(c,target);assert.match(target.innerHTML,/Cleric Resources/);assert.match(target.innerHTML,/Channel Divinity/);assert.match(target.innerHTML,/4 uses/);assert.match(target.innerHTML,/Always Prepared/);assert.match(target.innerHTML,/Level 9/);assert.match(target.innerHTML,/Greater Divine Intervention/);assert.match(target.innerHTML,/Rules Audit/);
});

test("Cleric class choices survive fingerprints and the saved-pregen UI contract",()=>{
  const divine=clericAt(10,{blessedStrikes:"divine-strike"}),potent=clericAt(10,{blessedStrikes:"potent-spellcasting"}),a=pregenFingerprintPayload(divine),b=pregenFingerprintPayload(potent);assert.equal(a.classChoices.divineOrder,"thaumaturge");assert.equal(a.classChoices.blessedStrikes,"divine-strike");assert.equal(b.classChoices.blessedStrikes,"potent-spellcasting");assert.notDeepEqual(a.classChoices,b.classChoices);
  const app=fs.readFileSync(new URL("../src/app.js",import.meta.url),"utf8"),ui=fs.readFileSync(new URL("../src/ui/class-options.js",import.meta.url),"utf8"),index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");assert.match(app,/classSelections/);assert.match(app,/blessedStrikes:character\.blessedStrikes/);assert.match(ui,/Divine Order/);assert.match(ui,/Blessed Strikes/);assert.match(index,/classChoicePanel/);
});

test("2014 Cleric remains fail-closed at level 6",()=>{
  const state=createInitialState();state.ruleset="2014";state.constraints.level="6";state.constraints.class="cleric";assert.throws(()=>generateCharacter(state),/currently supports levels/i);
});
