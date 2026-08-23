import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { validateCharacter } from "../src/rules/validation.js";
import { renderCharacter } from "../src/ui/render.js";
import { buildPremiumPrintModel } from "../src/print/model.js";
import { pregenFingerprintPayload } from "../src/library/fingerprint.js";

function rogue(ruleset="2014",level=6){
  const state=createInitialState();
  state.ruleset=ruleset;
  state.constraints.level=String(level);
  state.constraints.class="rogue";
  state.constraints.subclass="thief";
  state.constraints.species="human";
  state.constraints.background=ruleset==="2014"?"acolyte":"criminal";
  return generateCharacter(state);
}

function deterministicToolExpertiseRogue(){
  const original=Math.random;
  let seed=0x5eed1234;
  try{
    Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/0x100000000;};
    for(let attempt=0;attempt<200;attempt++){
      const character=rogue("2014",6);
      if(character.expertise.includes("Thieves' Tools"))return character;
    }
    throw new Error("Deterministic generation never produced Thieves' Tools Expertise.");
  }finally{Math.random=original;}
}

test("2014 Rogue generation can legally choose Thieves' Tools for Expertise",()=>{
  const character=deterministicToolExpertiseRogue();
  assert.equal(character.validation.valid,true);
  assert.equal(character.expertise.length,4);
  assert.equal(character.expertise.includes("Thieves' Tools"),true);
  assert.equal(character.expertise.filter(entry=>character.skills.includes(entry)).length,3);
  assert.equal(character.toolProficiencies.includes("Thieves' Tools"),true);
});

test("2014 browser and premium PDF models disclose the exact tool Expertise allocation",()=>{
  const character=deterministicToolExpertiseRogue(),target={innerHTML:""};
  renderCharacter(character,target);
  assert.match(target.innerHTML,/3 skills \+ Thieves’ Tools/);
  const model=buildPremiumPrintModel(character);
  assert.equal(model.rogueResources.expertise,"3 skills + Thieves’ Tools");
});

test("Expertise allocation participates in mechanical fingerprints",()=>{
  const character=deterministicToolExpertiseRogue(),toolPayload=pregenFingerprintPayload(character),skillOnly=structuredClone(character),replacement=character.skills.find(skill=>!character.expertise.includes(skill));
  assert.ok(replacement);
  skillOnly.expertise=character.expertise.filter(entry=>entry!=="Thieves' Tools").concat(replacement);
  const skillPayload=pregenFingerprintPayload(skillOnly);
  assert.ok(toolPayload.expertise.includes("Thieves' Tools"));
  assert.notDeepEqual(toolPayload.expertise,skillPayload.expertise);
});

test("2024 Rogue remains skill-only and rejects injected tool Expertise",()=>{
  const character=rogue("2024",6);
  assert.equal(character.expertise.includes("Thieves' Tools"),false);
  const tampered=structuredClone(character),replacementIndex=0;tampered.expertise[replacementIndex]="Thieves' Tools";
  const validation=validateCharacter(tampered,tampered.sourceMode);
  assert.equal(validation.valid,false);
  assert.ok(validation.errors.some(error=>/Expertise|Thieves' Tools/.test(error)));
});
