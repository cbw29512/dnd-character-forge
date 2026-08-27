import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildNarrativeDossier } from "../src/print/dossier.js";
import { exportProfileFor } from "../src/print/profile.js";
import { renderPremiumPrintSheet } from "../src/ui/premium-print.js";

function make(classId,{level="7",packetMode="deluxe",ruleset="2024"}={}){
  try{
    const state=createInitialState();state.ruleset=ruleset;state.constraints.level=level;state.constraints.class=classId;state.constraints.subclass="random";state.constraints.species="human";state.constraints.background=classId==="paladin"?"soldier":"criminal";
    const character=generateCharacter(state);character.presentation={...(character.presentation||{}),sheetCustomization:{packetMode}};return character;
  }catch(error){console.error(`[production-print-v3] fixture ${ruleset}/${classId}`,error);throw error;}
}

test("export profiles preserve compact packets and add one deluxe dossier page",()=>{
  try{
    assert.deepEqual(exportProfileFor(make("fighter"),"table"),{id:"martial-one-page",maxPages:1,tablePages:1,dossierPages:0,caster:false,packetMode:"table"});
    assert.deepEqual(exportProfileFor(make("fighter"),"deluxe"),{id:"martial-deluxe-two-page",maxPages:2,tablePages:1,dossierPages:1,caster:false,packetMode:"deluxe"});
    assert.equal(exportProfileFor(make("paladin"),"table").id,"caster-two-page");assert.equal(exportProfileFor(make("paladin"),"table").maxPages,2);assert.equal(exportProfileFor(make("paladin"),"deluxe").id,"caster-deluxe-three-page");assert.equal(exportProfileFor(make("paladin"),"deluxe").maxPages,3);
  }catch(error){console.error("[production-print-v3] profile contract failed",error);throw error;}
});

test("deluxe martial packet renders class sheet plus complete dossier",()=>{
  try{
    const character=make("barbarian"),target={innerHTML:""},model=renderPremiumPrintSheet(character,target);
    assert.equal(model.packet.totalPages,2);assert.equal(model.profile.packetMode,"deluxe");assert.ok(model.dossier);assert.equal(model.dossier.backstory.length,4);assert.ok(model.dossier.hooks.length>=4);assert.match(target.innerHTML,/ps-dossier-page/);assert.match(target.innerHTML,/Campaign Chronicle/);assert.match(target.innerHTML,/Milestones · Allies · Debts · Revelations · Session Notes/);assert.equal((target.innerHTML.match(/ps-dossier-chronicle-lines/g)||[]).length,1);assert.match(target.innerHTML,/Page 1\/2/);assert.match(target.innerHTML,/Page 2\/2/);assert.doesNotMatch(target.innerHTML,/ps-caster-page/);assert.match(target.innerHTML,/ps-class-ornaments/);
  }catch(error){console.error("[production-print-v3] martial deluxe render failed",error);throw error;}
});

test("deluxe caster and half-caster packets render class, spell, and dossier pages",()=>{
  try{
    for(const classId of ["paladin","wizard"]){const target={innerHTML:""},model=renderPremiumPrintSheet(make(classId),target);assert.equal(model.packet.totalPages,3,`${classId} page count`);assert.match(target.innerHTML,/ps-caster-page/);assert.match(target.innerHTML,/ps-dossier-page/);assert.match(target.innerHTML,/Campaign Chronicle/);assert.match(target.innerHTML,/Page 1\/3/);assert.match(target.innerHTML,/Page 2\/3/);assert.match(target.innerHTML,/Page 3\/3/);}
  }catch(error){console.error("[production-print-v3] caster deluxe render failed",error);throw error;}
});

test("table packet mode retains the established one and two page contracts",()=>{
  try{
    const fighterTarget={innerHTML:""},fighter=renderPremiumPrintSheet(make("fighter",{packetMode:"table"}),fighterTarget);assert.equal(fighter.profile.id,"martial-one-page");assert.equal(fighter.packet.totalPages,1);assert.doesNotMatch(fighterTarget.innerHTML,/ps-dossier-page/);assert.doesNotMatch(fighterTarget.innerHTML,/Campaign Chronicle/);
    const wizardTarget={innerHTML:""},wizard=renderPremiumPrintSheet(make("wizard",{packetMode:"table"}),wizardTarget);assert.equal(wizard.profile.id,"caster-two-page");assert.equal(wizard.packet.totalPages,2);assert.match(wizardTarget.innerHTML,/Page 2\/2/);assert.doesNotMatch(wizardTarget.innerHTML,/ps-dossier-page/);assert.doesNotMatch(wizardTarget.innerHTML,/Campaign Chronicle/);
  }catch(error){console.error("[production-print-v3] table compatibility failed",error);throw error;}
});

test("narrative dossier is deterministic and cannot mutate rules state",()=>{
  try{
    const character=make("paladin"),before={ac:character.ac,hp:character.hp,abilities:structuredClone(character.abilities),attacks:structuredClone(character.attacks),validation:structuredClone(character.validation)},one=buildNarrativeDossier(character),two=buildNarrativeDossier(character);
    assert.deepEqual(one,two);assert.match(one.disclaimer,/does not add or change game rules/i);assert.equal(character.ac,before.ac);assert.equal(character.hp,before.hp);assert.deepEqual(character.abilities,before.abilities);assert.deepEqual(character.attacks,before.attacks);assert.deepEqual(character.validation,before.validation);
  }catch(error){console.error("[production-print-v3] dossier immutability failed",error);throw error;}
});
