import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference.js";
import { validateWizardSelections, wizardPickerLimits, wizardProgressionFor } from "../src/rules/wizard.js";
import { WIZARD_SPELLS_2024, WIZARD_SPELL_MASTERY_ACTION_IDS_2024 } from "../src/data/wizard-spells.js";

const SAVANT_LEVELS=[5,7,9,11,13,15,17];
const byId=new Map(WIZARD_SPELLS_2024.map(spell=>[spell.id,spell]));
function wizardAt(level,selections={}){
  try{
    const state=createInitialState();state.ruleset="2024";state.constraints.level=String(level);state.constraints.class="wizard";state.constraints.subclass=level>=3?"evoker":"random";state.constraints.species="dwarf";state.constraints.background="criminal";state.spellSelections={cantrips:[],spellbook:[],prepared:[],masteryLevel1:null,masteryLevel2:null,signatureSpells:[],...selections};return generateCharacter(state);
  }catch(error){console.error(`[test] 2024 Wizard level ${level}`,error);throw error;}
}
const evokerBookCount=level=>6+2*(level-1)+(level>=3?2:0)+SAVANT_LEVELS.filter(value=>level>=value).length;

test("2024 Evoker generates and validates at every Wizard level 1 through 20",()=>{
  for(let level=1;level<=20;level++){const c=wizardAt(level);assert.equal(c.level,level);assert.equal(c.class.id,"wizard");assert.equal(c.validation.valid,true);if(level>=3)assert.equal(c.subclass.id,"evoker");assert.equal(c.spells.spellbook.all.length,evokerBookCount(level));}
});

test("2024 Wizard class table cantrips, prepared spells, and slots match every level",()=>{
  for(let level=1;level<=20;level++){const c=wizardAt(level),expected=wizardProgressionFor(level);assert.equal(c.spells.cantrips.all.length,expected.cantrips,`level ${level} cantrips`);assert.equal(c.spells.prepared.all.length,expected.prepared,`level ${level} prepared`);assert.deepEqual(c.spells.slots,expected.slots,`level ${level} slots`);}
});

test("Evocation Savant grants its exact historical spellbook additions through 9th-level slots",()=>{
  const c=wizardAt(20),acquisition=c.spells.spellbook.acquisition;
  assert.equal(acquisition.length,53);
  assert.equal(acquisition.filter(item=>item.label==="Evocation Savant").length,2);
  for(const [level,spellLevel] of [[5,3],[7,4],[9,5],[11,6],[13,7],[15,8],[17,9]]){
    const item=acquisition.find(entry=>entry.label===`Evocation Savant — new slot level ${spellLevel}`);assert.ok(item,`missing Savant acquisition at Wizard ${level}`);const spell=byId.get(item.spellId);assert.equal(spell.school,"Evocation",`${spell.name} is not Evocation`);assert.ok(spell.level<=spellLevel,`${spell.name} exceeds slot level ${spellLevel}`);
  }
});

test("Evoker high-level feature breakpoints are exact",()=>{
  const level5=wizardAt(5),level6=wizardAt(6),level10=wizardAt(10),level14=wizardAt(14),level18=wizardAt(18),level19=wizardAt(19),level20=wizardAt(20);
  assert.ok(!level5.features.includes("Sculpt Spells"));assert.ok(level6.features.includes("Sculpt Spells"));
  assert.ok(level10.features.includes("Empowered Evocation"));assert.ok(level14.features.includes("Overchannel"));assert.ok(level18.features.includes("Spell Mastery"));assert.ok(level19.features.includes("Epic Boon"));assert.ok(level20.features.includes("Signature Spells"));
});

test("Spell Mastery uses one eligible Action spell of level 1 and one of level 2 from the spellbook",()=>{
  const eligible=new Set(WIZARD_SPELL_MASTERY_ACTION_IDS_2024),c=wizardAt(18),mastery=c.spells.spellMastery,book=new Set(c.spells.spellbook.all);
  assert.ok(mastery);assert.equal(byId.get(mastery.level1).level,1);assert.equal(byId.get(mastery.level2).level,2);assert.ok(eligible.has(mastery.level1));assert.ok(eligible.has(mastery.level2));assert.ok(book.has(mastery.level1));assert.ok(book.has(mastery.level2));assert.deepEqual(new Set(c.spells.alwaysPrepared),new Set([mastery.level1,mastery.level2]));assert.equal(c.spells.prepared.all.length,23);for(const id of c.spells.alwaysPrepared)assert.ok(!c.spells.prepared.all.includes(id));
});

test("fixed legal Spell Mastery selections are preserved and illegal casting times fail closed",()=>{
  const c=wizardAt(18,{masteryLevel1:"magic-missile",masteryLevel2:"scorching-ray"});assert.equal(c.spells.spellMastery.level1,"magic-missile");assert.equal(c.spells.spellMastery.level2,"scorching-ray");
  assert.throws(()=>validateWizardSelections({ruleset:"2024",level:18,subclassId:"evoker",selections:{masteryLevel1:"shield"}}),/not an eligible Spell Mastery level-1/i);
  assert.throws(()=>validateWizardSelections({ruleset:"2024",level:18,subclassId:"evoker",selections:{masteryLevel2:"misty-step"}}),/not an eligible Spell Mastery level-2/i);
});

test("Boon of Spell Recall appears exactly at level 19 with legal ability increase and provenance",()=>{
  assert.ok(!wizardAt(18).feats.some(feat=>feat.id==="boon-spell-recall"));const c=wizardAt(19),boon=c.feats.find(feat=>feat.id==="boon-spell-recall");assert.ok(boon);assert.ok(["int","wis","cha"].includes(c.epicBoonAbility));assert.equal(c.abilityMaximums[c.epicBoonAbility],30);const refs=buildQuickReference(c),featRef=refs.find(item=>item.name==="Boon of Spell Recall"),featureRef=refs.find(item=>item.name==="Epic Boon");assert.equal(featRef.source.page,"88");assert.equal(featureRef.source.page,"79");assert.match(featRef.text,/roll 1d4/i);
});

test("level 20 Signature Spells are two distinct level-3 book spells and stay outside normal prepared count",()=>{
  const c=wizardAt(20,{masteryLevel1:"magic-missile",masteryLevel2:"scorching-ray",signatureSpells:["fireball","counterspell"]}),book=new Set(c.spells.spellbook.all),always=new Set(c.spells.alwaysPrepared);
  assert.deepEqual(c.spells.signatureSpells,["fireball","counterspell"]);for(const id of c.spells.signatureSpells){assert.equal(byId.get(id).level,3);assert.ok(book.has(id));assert.ok(always.has(id));assert.ok(!c.spells.prepared.all.includes(id));}
  assert.equal(c.spells.prepared.all.length,25);assert.equal(c.spells.alwaysPrepared.length,4);assert.equal(c.spells.spellbook.all.length,53);assert.deepEqual(c.spells.slots,{1:4,2:3,3:3,4:3,5:3,6:2,7:2,8:1,9:1});
  const refs=buildQuickReference(c),masteryRef=refs.find(item=>item.name==="Spell Mastery"),signatureRef=refs.find(item=>item.name==="Signature Spells");assert.match(masteryRef.text,/Magic Missile/);assert.match(masteryRef.text,/Scorching Ray/);assert.match(signatureRef.text,/Fireball/);assert.match(signatureRef.text,/Counterspell/);assert.equal(masteryRef.source.page,"79");assert.equal(signatureRef.source.page,"79");
});

test("Signature Spell selection rejects non-level-3 spells and duplicates",()=>{
  assert.throws(()=>validateWizardSelections({ruleset:"2024",level:20,subclassId:"evoker",selections:{signatureSpells:["wall-of-fire"]}}),/not an eligible level-3 Signature Spell/i);
  assert.throws(()=>validateWizardSelections({ruleset:"2024",level:20,subclassId:"evoker",selections:{signatureSpells:["fireball","fireball"]}}),/Duplicate Signature Spells/i);
});

test("2024 Wizard spell catalog reaches every spell level 0 through 9 without duplicates",()=>{
  assert.equal(new Set(WIZARD_SPELLS_2024.map(spell=>spell.id)).size,WIZARD_SPELLS_2024.length);for(let level=0;level<=9;level++)assert.ok(WIZARD_SPELLS_2024.some(spell=>spell.level===level),`missing Wizard spell level ${level}`);for(const id of ["wish","meteor-swarm","time-stop","true-polymorph","power-word-kill"])assert.equal(byId.get(id)?.level,9);
});

test("spell-picker limits include the full Evoker spellbook at level 20 while subclassless math remains explicit",()=>{
  assert.deepEqual(wizardPickerLimits({ruleset:"2024",level:20,subclassId:"evoker"}),{cantrips:5,spellbook:53,prepared:25});assert.deepEqual(wizardPickerLimits({ruleset:"2024",level:20,subclassId:null}),{cantrips:5,spellbook:44,prepared:25});
  const picker=fs.readFileSync(new URL("../src/ui/spell-picker.js",import.meta.url),"utf8"),app=fs.readFileSync(new URL("../src/app.js",import.meta.url),"utf8");assert.match(picker,/options\.length===1\?options\[0\]\.id:null/);assert.match(picker,/Spell Mastery/);assert.match(picker,/Signature Spells/);assert.match(app,/masteryLevel1:character\.spells\.spellMastery\?\.level1/);assert.match(app,/signatureSpells:\[\.\.\.\(character\.spells\.signatureSpells\|\|\[\]\)\]/);
});

test("2024 Wizard remains fully supported after 2014 Cleric expansion",()=>{
  assert.doesNotThrow(()=>wizardAt(6));assert.doesNotThrow(()=>wizardAt(20));
});
