import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference-router.js";
import { buildPremiumPrintModel } from "../src/print/model.js";

function bard(ruleset,{spellSelections={},classSelections={}}={}){
  const state=createInitialState();state.ruleset=ruleset;state.constraints.level="20";state.constraints.class="bard";state.constraints.subclass="college-lore";state.constraints.species="human";state.constraints.background=ruleset==="2014"?"acolyte":"sage";state.classSelections={instruments:["Lute"],...classSelections};state.spellSelections={...state.spellSelections,...spellSelections};return generateCharacter(state);
}

test("both Bard editions carry complete sourced play references",()=>{
  for(const ruleset of ["2014","2024"]){const character=bard(ruleset),refs=buildQuickReference(character);assert.ok(refs.length>15);for(const item of refs){assert.ok(item.source?.version,`${ruleset} ${item.name} missing source version`);assert.ok(item.source?.page,`${ruleset} ${item.name} missing printed page`);assert.match(item.source.pdfUrl,/\.pdf$/);}assert.equal(character.audit.status,"PASS");assert.equal(character.audit.rawIntegrity,true);const counter=refs.find(item=>item.name==="Countercharm");assert.equal(counter.timing,ruleset==="2014"?"Action":"Reaction");}
});

test("2014 Lore Bard preserves any-class Magical Secrets in print",()=>{
  const character=bard("2014",{spellSelections:{magicalSecrets:["eldritch-blast","hellish-rebuke"]}}),model=buildPremiumPrintModel(character),refs=buildQuickReference(character);assert.equal(model.profile.caster,true);assert.equal(model.packet.totalPages,2);assert.equal(model.theme.id,"bard-legend");assert.equal(model.classUtility.title,"Living Legend");assert.equal(character.spells.cantrips.all.length,4);assert.equal(character.spells.known.all.length,24);assert.equal(character.spells.magicalSecrets.length,6);assert.ok(character.spells.magicalSecrets.includes("eldritch-blast"));assert.ok(character.spells.magicalSecrets.includes("hellish-rebuke"));assert.equal(model.spellPage.entries.length,28);assert.ok(model.spellPage.entries.some(entry=>entry.id==="eldritch-blast"&&entry.name==="Eldritch Blast"&&entry.tags.includes("K")));assert.ok(model.spellPage.entries.some(entry=>entry.id==="hellish-rebuke"&&entry.name==="Hellish Rebuke"&&entry.tags.includes("K")));assert.equal(refs.find(item=>item.name==="Peerless Skill").source.page,"14");assert.match(character.audit.checks.join(" "),/Song of Rest/i);assert.doesNotMatch(character.audit.checks.join(" "),/Words of Creation|Magical Discoveries|Epic Boon/i);
});

test("2024 Lore discovery can legally overlap level-20 Words of Creation",()=>{
  const character=bard("2024",{spellSelections:{loreDiscoveries:["power-word-heal","guidance"]}}),model=buildPremiumPrintModel(character),refs=buildQuickReference(character);assert.equal(character.validation.valid,true);assert.deepEqual(character.spells.loreDiscoveries.slice().sort(),["guidance","power-word-heal"]);assert.ok(character.spells.alwaysPrepared.includes("power-word-heal"));assert.ok(character.spells.alwaysPrepared.includes("power-word-kill"));assert.ok(character.spells.alwaysPrepared.includes("guidance"));assert.equal(character.spells.alwaysPrepared.length,3);assert.equal(new Set(character.spells.alwaysPrepared).size,3);assert.equal(character.spells.prepared.all.length,22);assert.equal(model.spellPage.entries.length,29);assert.equal(model.spellPage.entries.filter(entry=>entry.id==="power-word-heal").length,1);assert.ok(model.spellPage.entries.find(entry=>entry.id==="power-word-heal").tags.includes("A"));assert.equal(refs.find(item=>item.name==="Words of Creation").source.page,"33");assert.match(character.audit.checks.join(" "),/Words of Creation/i);assert.doesNotMatch(character.audit.checks.join(" "),/Song of Rest|Additional Magical Secrets/i);
});

test("Bard fixed instrument choices survive constrained random completion",()=>{
  for(const ruleset of ["2014","2024"]){const character=bard(ruleset);assert.equal(character.bardSelections.instruments.length,3);assert.ok(character.bardSelections.instruments.includes("Lute"));assert.equal(new Set(character.bardSelections.instruments).size,3);for(const instrument of character.bardSelections.instruments)assert.ok(character.toolProficiencies.includes(instrument));}
});

test("Bard production surfaces survive repeated random construction",()=>{
  for(const ruleset of ["2014","2024"]){for(let i=0;i<120;i++){const character=bard(ruleset);assert.equal(character.validation.valid,true);const refs=buildQuickReference(character),model=buildPremiumPrintModel(character);assert.ok(refs.length>15);assert.equal(model.packet.totalPages,2);assert.equal(model.classUtility.kind,"bard");assert.ok(model.spellPage.entries.length>20);}}
});
