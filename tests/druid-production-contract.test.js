import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference-router.js";
import { buildPremiumPrintModel } from "../src/print/model.js";
import { buildQuickTurn } from "../src/print/quick-turn.js";

function druid(ruleset){
  try{
    const state=createInitialState();state.ruleset=ruleset;state.constraints.level="20";state.constraints.class="druid";state.constraints.subclass="circle-land";state.constraints.species="human";state.constraints.background=ruleset==="2014"?"acolyte":"sage";
    state.classSelections=ruleset==="2014"?{circleLand:"underdark",fieldForms:["giant-eagle","brown-bear","giant-spider","reef-shark"]}:{primalOrder:"magician",circleLand:"temperate",elementalFury:"potent-spellcasting",knownForms:["rat","riding-horse","spider","wolf","black-bear","reef-shark","brown-bear","pteranodon"]};
    return generateCharacter(state);
  }catch(error){console.error(`[test] ${ruleset} Druid production fixture failed`,error);throw error;}
}

test("both Druid editions carry complete sourced play references",()=>{
  for(const ruleset of ["2014","2024"]){const character=druid(ruleset),refs=buildQuickReference(character);assert.ok(refs.length>20);for(const item of refs){assert.ok(item.source?.version,`${ruleset} ${item.name} missing source version`);assert.ok(item.source?.page,`${ruleset} ${item.name} missing printed page`);assert.match(item.source.pdfUrl,/\.pdf$/);}assert.equal(character.audit.status,"PASS");assert.equal(character.audit.rawIntegrity,true);}
});

test("2014 Druid print preserves full casting and non-exhaustive field forms",()=>{
  const character=druid("2014"),model=buildPremiumPrintModel(character),turn=buildQuickTurn(character).join(" ");
  assert.equal(model.profile.caster,true);assert.equal(model.packet.totalPages,2);assert.equal(model.theme.id,"druid-wild");assert.equal(model.classUtility.title,"The Old Wild");assert.equal(model.druidSupport.ruleset,"2014");assert.equal(model.druidSupport.fieldFormsAreExamples,true);assert.equal(model.druidSupport.forms.length,4);assert.ok(model.druidSupport.forms.some(form=>form.id==="giant-eagle"));assert.equal(character.spells.cantrips.all.length,5);assert.equal(character.spells.prepared.all.length,25);assert.equal(character.spells.alwaysPrepared.length,8);assert.equal(model.spellPage.entries.length,38);assert.ok(model.spellPage.entries.some(entry=>entry.id==="web"&&entry.tags.includes("A")));assert.ok(model.spellPage.entries.some(entry=>entry.id==="cloudkill"&&entry.tags.includes("A")));assert.match(turn,/examples, not your complete RAW option list/i);assert.match(turn,/Natural Recovery/i);
});

test("2024 Druid print preserves exact known forms and revised Wild Shape state",()=>{
  const character=druid("2024"),model=buildPremiumPrintModel(character),turn=buildQuickTurn(character).join(" ");
  assert.equal(model.profile.caster,true);assert.equal(model.packet.totalPages,2);assert.equal(model.theme.id,"druid-wild");assert.equal(model.classUtility.title,"The Old Wild");assert.equal(model.druidSupport.ruleset,"2024");assert.equal(model.druidSupport.fieldFormsAreExamples,false);assert.equal(model.druidSupport.forms.length,8);assert.ok(model.druidSupport.forms.some(form=>form.id==="pteranodon"));assert.equal(model.druidSupport.forms.some(form=>form.id==="giant-eagle"),false);assert.equal(model.druidSupport.wildShapeUses,4);assert.equal(model.druidSupport.wildShapeTempHp,20);assert.equal(character.spells.cantrips.all.length,5);assert.equal(character.spells.prepared.all.length,22);assert.equal(character.spells.alwaysPrepared.length,7);assert.equal(model.spellPage.entries.length,34);assert.ok(model.spellPage.entries.some(entry=>entry.id==="speak-with-animals"&&entry.tags.includes("A")));assert.ok(model.spellPage.entries.some(entry=>entry.id==="shocking-grasp"&&entry.tags.includes("A")));assert.match(turn,/8 known Wild Shape forms/i);assert.match(turn,/20 Temporary HP/i);assert.match(turn,/Wild Resurgence/i);
});

test("Druid audit text remains edition-pure",()=>{
  const oldText=druid("2014").audit.checks.join(" "),newText=druid("2024").audit.checks.join(" ");assert.match(oldText,/Wild Shape/i);assert.match(oldText,/Natural Recovery/i);assert.doesNotMatch(oldText,/Primal Order|Wild Companion|Wild Resurgence|Elemental Fury|Epic Boon/i);assert.match(newText,/Primal Order/i);assert.match(newText,/Wild Shape/i);assert.doesNotMatch(newText,/Timeless Body|Land's Stride/i);
});
