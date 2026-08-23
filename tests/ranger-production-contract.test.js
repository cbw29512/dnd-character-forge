import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference-router.js";
import { buildPremiumPrintModel } from "../src/print/model.js";

function ranger(ruleset){
  try{
    const state=createInitialState();state.ruleset=ruleset;state.constraints.level="20";state.constraints.class="ranger";state.constraints.subclass="hunter";state.constraints.species="human";state.constraints.background=ruleset==="2014"?"acolyte":"criminal";
    state.classSelections=ruleset==="2014"?{fightingStyle:"archery",favoredEnemies:["dragons","giants","fiends"],favoredEnemyLanguages:["Draconic","Giant","Infernal"],naturalExplorerTerrains:["forest","mountain","underdark"],huntersPrey:"colossus-slayer",defensiveTactics:"multiattack-defense",multiattack:"volley",superiorDefense:"evasion"}:{fightingStyle:"archery",huntersPrey:"colossus-slayer",defensiveTactics:"multiattack-defense"};
    return generateCharacter(state);
  }catch(error){console.error(`[test] ${ruleset} Ranger fixture failed`,error);throw error;}
}

test("both Ranger editions carry complete sourced play references",()=>{
  for(const ruleset of ["2014","2024"]){const character=ranger(ruleset),refs=buildQuickReference(character);assert.ok(refs.length>15);for(const item of refs){assert.ok(item.source?.version,`${ruleset} ${item.name} missing source version`);assert.ok(item.source?.page,`${ruleset} ${item.name} missing printed page`);assert.match(item.source.pdfUrl,/\.pdf$/);}assert.equal(character.audit.status,"PASS");assert.equal(character.audit.rawIntegrity,true);}
});

test("2014 Ranger print preserves known spells and Favored Enemy languages",()=>{
  const character=ranger("2014"),model=buildPremiumPrintModel(character);assert.equal(model.profile.caster,true);assert.equal(model.packet.totalPages,2);assert.equal(model.theme.id,"ranger-warden");assert.equal(model.classUtility.title,"Warden's Mark");assert.equal(model.rangerSupport.ruleset,"2014");assert.deepEqual(character.rangerSelections.favoredEnemyLanguages,["Draconic","Giant","Infernal"]);for(const language of character.rangerSelections.favoredEnemyLanguages)assert.ok(character.languages.includes(language));assert.equal(character.spells.known.all.length,11);assert.equal(character.spells.prepared.all.length,0);assert.equal(model.spellPage.entries.length,11);assert.ok(model.spellPage.entries.every(entry=>entry.tags==="K"));assert.equal(model.spellcasting.known.length,11);assert.equal(model.spellcasting.prepared.length,0);assert.deepEqual(model.rangerSupport.favoredEnemies,["Dragons","Giants","Fiends"]);assert.deepEqual(model.rangerSupport.terrains,["Forest","Mountain","Underdark"]);
});

test("2024 Ranger print preserves Hunter's Mark and legal masteries",()=>{
  const character=ranger("2024"),model=buildPremiumPrintModel(character);assert.equal(model.profile.caster,true);assert.equal(model.packet.totalPages,2);assert.equal(model.theme.id,"ranger-warden");assert.equal(model.classUtility.title,"Warden's Mark");assert.equal(model.rangerSupport.ruleset,"2024");assert.equal(character.spells.prepared.all.length,15);assert.deepEqual(character.spells.alwaysPrepared,["hunters-mark"]);assert.equal(model.spellPage.entries.length,16);assert.ok(model.spellPage.entries.some(entry=>entry.id==="hunters-mark"&&entry.tags.includes("A")));assert.equal(character.masteryIds.length,2);assert.equal(model.proficiencies.masteries.length,2);for(const label of model.proficiencies.masteries)assert.match(label,/ — (Cleave|Graze|Nick|Push|Sap|Slow|Topple|Vex)$/);assert.equal(model.rangerSupport.hunterMarkFreeCasts,6);assert.equal(model.rangerSupport.hunterMarkDie,"d10");assert.equal(model.rangerSupport.expertiseCount,3);
});

test("Ranger audit text remains edition-pure",()=>{
  const oldText=ranger("2014").audit.checks.join(" "),newText=ranger("2024").audit.checks.join(" ");assert.match(oldText,/Favored Enemy/i);assert.match(oldText,/Natural Explorer/i);assert.doesNotMatch(oldText,/Weapon Mastery|Deft Explorer|Nature's Veil|Epic Boon/i);assert.match(newText,/Weapon Mastery/i);assert.match(newText,/Hunter's Mark/i);assert.doesNotMatch(newText,/Natural Explorer|Primeval Awareness|Hide in Plain Sight|Vanish/i);
});
