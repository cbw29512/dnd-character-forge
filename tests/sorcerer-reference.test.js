import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference-router.js";

function generated(ruleset,level,classSelections={}){
  try{
    const state=createInitialState();state.ruleset=ruleset;state.constraints.level=String(level);state.constraints.class="sorcerer";state.constraints.species="human";state.constraints.background=ruleset==="2014"?"acolyte":"sage";state.constraints.subclass=ruleset==="2014"||level>=3?(ruleset==="2014"?"draconic-bloodline":"draconic-sorcery"):"random";state.classSelections={...classSelections};return generateCharacter(state);
  }catch(error){console.error(`[sorcerer-reference-test] ${ruleset} level ${level} generation failed`,error);throw error;}
}
function byId(items,id){const found=items.find(item=>item.id===id);assert.ok(found,`Missing quick-reference entry ${id}`);return found;}
function assertSourced(item,version){assert.equal(item.source?.version,version);assert.ok(item.source?.page,`${item.name} is missing a source page`);assert.ok(item.text,`${item.name} is missing playable text`);}

test("low-level Sorcerers build sourced references without evaluating future features",()=>{
  try{
    const legacy=generated("2014",1,{draconicAncestry:"red"}),legacyRefs=buildQuickReference(legacy);for(const name of legacy.features)assertSourced(byId(legacyRefs,`feature:${name}`),"SRD 5.1");assert.equal(byId(legacyRefs,"feature:Spellcasting").source.page,"43");assert.equal(byId(legacyRefs,"feature:Dragon Ancestor").source.page,"44");assert.equal(byId(legacyRefs,"feature:Draconic Resilience").source.page,"45");assert.equal(legacyRefs.some(item=>item.id==="feature:Elemental Affinity"),false);
    const revised=generated("2024",1),revisedRefs=buildQuickReference(revised);for(const name of revised.features)assertSourced(byId(revisedRefs,`feature:${name}`),"SRD 5.2.1");assert.equal(byId(revisedRefs,"feature:Spellcasting").source.page,"64–65");assert.equal(revisedRefs.some(item=>item.id==="feature:Draconic Resilience"),false);assert.equal(revisedRefs.some(item=>item.id==="feature:Elemental Affinity"),false);
  }catch(error){console.error("[sorcerer-reference-test] low-level source gate failed",error);throw error;}
});

test("level-20 Sorcerer references cover every active feature, Metamagic choice, and Epic Boon",()=>{
  try{
    const legacy=generated("2014",20,{draconicAncestry:"red",metamagic:["quickened-spell","subtle-spell"]}),legacyRefs=buildQuickReference(legacy);for(const name of legacy.features)assertSourced(byId(legacyRefs,`feature:${name}`),"SRD 5.1");for(const id of legacy.sorcererSelections.metamagic.all)assertSourced(byId(legacyRefs,`metamagic:${id}`),"SRD 5.1");assert.equal(byId(legacyRefs,"feature:Draconic Presence").source.page,"45");assert.equal(legacyRefs.some(item=>item.name==="Arcane Apotheosis"),false);
    const revised=generated("2024",20,{elementalAffinity:"Fire",metamagic:["quickened-spell","subtle-spell"]}),revisedRefs=buildQuickReference(revised);for(const name of revised.features)assertSourced(byId(revisedRefs,`feature:${name}`),"SRD 5.2.1");for(const id of revised.sorcererSelections.metamagic.all)assertSourced(byId(revisedRefs,`metamagic:${id}`),"SRD 5.2.1");assert.equal(byId(revisedRefs,"feature:Draconic Resilience").source.page,"69");assert.equal(byId(revisedRefs,"feature:Dragon Companion").source.page,"70");assert.equal(byId(revisedRefs,"feat:boon-dimensional-travel").source.page,"88");assert.match(byId(revisedRefs,"metamagic:quickened-spell").text,/already cast a level 1\+ spell/);assert.match(byId(revisedRefs,"metamagic:quickened-spell").text,/can't cast a level 1\+ spell later/);assert.equal(revisedRefs.some(item=>item.name==="Dragon Ancestor"),false);
  }catch(error){console.error("[sorcerer-reference-test] level-20 source gate failed",error);throw error;}
});

test("Sorcerer rules audit carries class and subclass provenance in both editions",()=>{
  try{
    const legacy=generated("2014",20,{draconicAncestry:"red"}),revised=generated("2024",20,{elementalAffinity:"Fire"});for(const [character,version,classPage,subclassPage] of [[legacy,"SRD 5.1","42–44","44–45"],[revised,"SRD 5.2.1","64–67","69–70"]]){assert.equal(character.audit.status,"PASS");const classEntry=character.audit.mechanics.find(item=>item.label==="Class"),subclassEntry=character.audit.mechanics.find(item=>item.label==="Subclass"),spellEntry=character.audit.mechanics.find(item=>item.label==="Spellcasting");assert.equal(classEntry.source.version,version);assert.equal(classEntry.source.page,classPage);assert.equal(subclassEntry.source.page,subclassPage);assert.equal(spellEntry.source.version,version);assert.ok(spellEntry.source.page);}
  }catch(error){console.error("[sorcerer-reference-test] audit provenance gate failed",error);throw error;}
});
