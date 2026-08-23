import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference.js";
import { validateWizardSelections, wizardPickerLimits, wizardProgressionFor } from "../src/rules/wizard.js";
import { WIZARD_SPELLS_2014 } from "../src/data/wizard-spells.js";

const byId=new Map(WIZARD_SPELLS_2014.map(spell=>[spell.id,spell]));
const COUNTS={0:14,1:27,2:31,3:28,4:23,5:23,6:19,7:15,8:12,9:12};
function wizardAt(level,selections={}){
  const state=createInitialState();state.ruleset="2014";state.constraints.level=String(level);state.constraints.class="wizard";state.constraints.subclass=level>=2?"school-evocation":"random";state.constraints.species="human";state.constraints.background="acolyte";state.spellSelections={cantrips:[],spellbook:[],prepared:[],masteryLevel1:null,masteryLevel2:null,signatureSpells:[],...selections};return generateCharacter(state);
}

test("2014 School of Evocation Wizard generates and validates at every level 1 through 20",()=>{
  for(let level=1;level<=20;level++){const c=wizardAt(level);assert.equal(c.level,level);assert.equal(c.class.id,"wizard");assert.equal(c.validation.valid,true);if(level>=2)assert.equal(c.subclass.id,"school-evocation");assert.equal(c.spells.spellbook.all.length,6+2*(level-1),`level ${level} spellbook`);assert.equal(c.spells.prepared.all.length,Math.max(1,level+Math.floor((c.abilities.int-10)/2)),`level ${level} prepared`);}
});

test("2014 Wizard cantrip and slot table matches all 20 SRD levels",()=>{
  for(let level=1;level<=20;level++){const c=wizardAt(level),expected=wizardProgressionFor(level,"2014");assert.equal(expected.prepared,null);assert.equal(c.spells.cantrips.all.length,expected.cantrips,`level ${level} cantrips`);assert.deepEqual(c.spells.slots,expected.slots,`level ${level} slots`);}
  assert.deepEqual(wizardAt(20).spells.slots,{1:4,2:3,3:3,4:3,5:3,6:2,7:2,8:1,9:1});
});

test("2014 Wizard spell catalog exactly spans SRD levels 0 through 9",()=>{
  assert.equal(WIZARD_SPELLS_2014.length,204);assert.equal(new Set(WIZARD_SPELLS_2014.map(spell=>spell.id)).size,204);for(let level=0;level<=9;level++)assert.equal(WIZARD_SPELLS_2014.filter(spell=>spell.level===level).length,COUNTS[level],`spell level ${level}`);
  for(const [id,level] of [["floating-disk",1],["hideous-laughter",1],["acid-arrow",2],["arcanists-magic-aura",2],["tiny-hut",3],["wall-of-fire",4],["telepathic-bond",5],["disintegrate",6],["forcecage",7],["feeblemind",8],["wish",9]])assert.equal(byId.get(id)?.level,level,`${id} level`);
  assert.equal(byId.has("elementalism"),false);assert.equal(byId.has("befuddlement"),false);assert.equal(byId.has("summon-dragon"),false);assert.equal(byId.has("vitriolic-sphere"),false);
});

test("2014 Evocation Savant never grants free spellbook spells",()=>{
  const c=wizardAt(20);assert.equal(c.spells.spellbook.all.length,44);assert.equal(c.spells.spellbook.acquisition.length,44);assert.equal(c.spells.spellbook.acquisition.filter(item=>item.label.includes("Evocation Savant")).length,0);assert.deepEqual(wizardPickerLimits({ruleset:"2014",level:20,subclassId:"school-evocation"}),{cantrips:5,spellbook:44,prepared:null});
});

test("2014 School of Evocation feature breakpoints are exact",()=>{
  assert.deepEqual(wizardAt(1).features,["Spellcasting","Arcane Recovery"]);const l2=wizardAt(2),l6=wizardAt(6),l10=wizardAt(10),l14=wizardAt(14),l18=wizardAt(18),l20=wizardAt(20);assert.ok(l2.features.includes("Evocation Savant"));assert.ok(l2.features.includes("Sculpt Spells"));assert.ok(!wizardAt(5).features.includes("Potent Cantrip"));assert.ok(l6.features.includes("Potent Cantrip"));assert.ok(l10.features.includes("Empowered Evocation"));assert.ok(l14.features.includes("Overchannel"));assert.ok(l18.features.includes("Spell Mastery"));assert.ok(l20.features.includes("Signature Spells"));assert.equal(l20.features.includes("Epic Boon"),false);
});

test("2014 Wizard ASI schedule is exactly levels 4, 8, 12, 16, and 19",()=>{
  assert.deepEqual(wizardAt(20).class.asiLevels,[4,8,12,16,19]);const before=wizardAt(3),after=wizardAt(4);assert.ok(after.abilities.int>=before.abilities.int);assert.ok(after.abilities.int<=20);
});

test("2014 Spell Mastery accepts non-Action spells and keeps them normally prepared",()=>{
  const c=wizardAt(18,{masteryLevel1:"shield",masteryLevel2:"misty-step"}),mastery=c.spells.spellMastery;assert.equal(mastery.level1,"shield");assert.equal(mastery.level2,"misty-step");assert.equal(mastery.requiresPrepared,true);assert.equal(mastery.reset,"8 hours of study");assert.ok(c.spells.prepared.all.includes("shield"));assert.ok(c.spells.prepared.all.includes("misty-step"));assert.equal(c.spells.alwaysPrepared.includes("shield"),false);assert.equal(c.spells.alwaysPrepared.includes("misty-step"),false);
  assert.doesNotThrow(()=>validateWizardSelections({ruleset:"2014",level:18,subclassId:"school-evocation",selections:{masteryLevel1:"shield",masteryLevel2:"misty-step"}}));
  assert.throws(()=>validateWizardSelections({ruleset:"2014",level:17,subclassId:"school-evocation",selections:{masteryLevel1:"shield"}}),/unavailable before Wizard level 18/i);
});

test("2014 Signature Spells are two distinct level-3 book spells and always prepared outside normal count",()=>{
  const c=wizardAt(20,{masteryLevel1:"shield",masteryLevel2:"misty-step",signatureSpells:["fireball","counterspell"]}),book=new Set(c.spells.spellbook.all);assert.deepEqual(c.spells.signatureSpells,["fireball","counterspell"]);assert.deepEqual(new Set(c.spells.alwaysPrepared),new Set(["fireball","counterspell"]));for(const id of c.spells.signatureSpells){assert.equal(byId.get(id).level,3);assert.ok(book.has(id));assert.equal(c.spells.prepared.all.includes(id),false);}assert.equal(c.spells.prepared.all.length,20+Math.floor((c.abilities.int-10)/2));assert.equal(c.spells.spellbook.all.length,44);
  assert.throws(()=>validateWizardSelections({ruleset:"2014",level:20,subclassId:"school-evocation",selections:{signatureSpells:["wall-of-fire"]}}),/not an eligible level-3 Signature Spell/i);
});

test("2014 high-level Wizard references stay edition-correct and fully sourced",()=>{
  const c=wizardAt(20,{masteryLevel1:"shield",masteryLevel2:"misty-step",signatureSpells:["fireball","counterspell"]}),refs=buildQuickReference(c),get=name=>refs.find(item=>item.name===name);for(const [name,page] of [["Spellcasting","52–53"],["Arcane Recovery","53"],["Ability Score Improvement","53"],["Evocation Savant","54"],["Sculpt Spells","54"],["Potent Cantrip","54"],["Empowered Evocation","54"],["Overchannel","54"],["Spell Mastery","53"],["Signature Spells","54"]]){const ref=get(name);assert.ok(ref,`missing ${name}`);assert.equal(ref.source.version,"SRD 5.1");assert.equal(ref.source.page,page,`${name} page`);}
  assert.match(get("Spell Mastery").text,/count against the normal prepared-spell total/i);assert.match(get("Spell Mastery").text,/8 hours of study/i);assert.doesNotMatch(get("Spell Mastery").text,/always prepared/i);assert.match(get("Potent Cantrip").text,/succeeds on a saving throw/i);assert.doesNotMatch(get("Potent Cantrip").text,/attack misses/i);assert.match(get("Signature Spells").text,/Short or Long Rest/i);assert.match(get("Arcane Recovery").text,/Once per day/i);
});

test("2014 Wizard level 20 has no 2024-only state",()=>{
  const c=wizardAt(20);assert.equal(c.epicBoonAbility,null);assert.equal(c.feats.some(feat=>feat.category==="Epic Boon"),false);assert.equal(c.features.includes("Ritual Adept"),false);assert.equal(c.features.includes("Scholar"),false);assert.equal(c.features.includes("Memorize Spell"),false);assert.equal(c.expertise.length,0);assert.equal(c.masteryIds.length,0);
});

test("2014 Wizard remains fully supported after Cleric expansion",()=>{
  assert.doesNotThrow(()=>wizardAt(6));assert.doesNotThrow(()=>wizardAt(20));
});
