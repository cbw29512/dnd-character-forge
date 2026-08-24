import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildPremiumPrintModel } from "../src/print/model.js";

function generated(ruleset){
  try{
    const state=createInitialState();state.ruleset=ruleset;state.constraints.level="20";state.constraints.class="sorcerer";state.constraints.species="human";state.constraints.background=ruleset==="2014"?"acolyte":"sage";state.constraints.subclass=ruleset==="2014"?"draconic-bloodline":"draconic-sorcery";state.classSelections=ruleset==="2014"?{draconicAncestry:"red",metamagic:["quickened-spell","subtle-spell"]}:{elementalAffinity:"Fire",metamagic:["quickened-spell","subtle-spell"]};return generateCharacter(state);
  }catch(error){console.error(`[sorcerer-print-model-test] ${ruleset} generation failed`,error);throw error;}
}

test("2014 Sorcerer premium model is a sourced two-page caster packet",()=>{
  try{
    const character=generated("2014"),model=buildPremiumPrintModel(character),printed=new Set(model.spellPage.entries.map(spell=>spell.id));
    assert.equal(model.profile.caster,true);assert.equal(model.packet.totalPages,2);assert.equal(model.theme.id,"sorcerer-aether");assert.equal(model.classUtility.kind,"sorcerer");assert.equal(model.classUtility.title,"Innate Arcane");assert.equal(model.classUtility.stats.find(item=>item.label==="Sorcery Points").value,20);assert.equal(model.classUtility.stats.find(item=>item.label==="Metamagic").value,4);assert.match(model.classUtility.note,/Red ancestry/);assert.match(model.spellPage.source,/Sorcerer spell list pp\.109–110/);
    for(const id of [...character.spells.cantrips.all,...character.spells.known.all])assert.ok(printed.has(id),`Missing 2014 printed Sorcerer spell ${id}`);
    assert.equal(model.spellPage.entries.some(spell=>spell.tags.includes("A")),false);
  }catch(error){console.error("[sorcerer-print-model-test] 2014 model gate failed",error);throw error;}
});

test("2024 Sorcerer premium model includes Draconic spells outside the base class list",()=>{
  try{
    const character=generated("2024"),model=buildPremiumPrintModel(character),byId=new Map(model.spellPage.entries.map(spell=>[spell.id,spell]));
    assert.equal(model.profile.caster,true);assert.equal(model.packet.totalPages,2);assert.equal(model.theme.id,"sorcerer-aether");assert.equal(model.classUtility.kind,"sorcerer");assert.equal(model.classUtility.stats.find(item=>item.label==="Sorcery Points").value,20);assert.equal(model.classUtility.stats.find(item=>item.label==="Metamagic").value,6);assert.match(model.classUtility.note,/2 Innate Sorcery\/LR/);assert.match(model.classUtility.note,/Arcane Apotheosis/);assert.match(model.spellPage.source,/Sorcerer spell list pp\.67–69/);assert.match(model.spellPage.source,/Draconic Spells pp\.69–70/);
    for(const id of [...character.spells.cantrips.all,...character.spells.prepared.all,...character.spells.alwaysPrepared])assert.ok(byId.has(id),`Missing 2024 printed Sorcerer spell ${id}`);
    for(const id of ["command","arcane-eye","legend-lore","summon-dragon"]){assert.equal(byId.get(id)?.tags.includes("A"),true,`${id} should print as always prepared`);}
  }catch(error){console.error("[sorcerer-print-model-test] 2024 model gate failed",error);throw error;}
});
