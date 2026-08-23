import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildPremiumPrintModel } from "../src/print/model.js";

function barbarian(ruleset){
  try{
    const state=createInitialState();
    state.ruleset=ruleset;
    state.constraints.level="20";
    state.constraints.class="barbarian";
    state.constraints.subclass="berserker";
    state.constraints.species="human";
    state.constraints.background=ruleset==="2014"?"acolyte":"soldier";
    return generateCharacter(state);
  }catch(error){console.error(`[test] ${ruleset} Barbarian print fixture failed`,error);throw error;}
}

test("2014 Primal Fury strip uses a print-safe critical-dice label",()=>{
  const model=buildPremiumPrintModel(barbarian("2014")),crit=model.classUtility.stats.find(item=>item.label==="Crit Dice");
  assert.ok(crit);assert.equal(crit.value,"+3");assert.equal(crit.unit,"weapon dice");assert.equal(model.classUtility.stats.some(item=>item.label==="Brutal Critical"),false);
});

test("2024 print model exposes human-readable mastery names and properties",()=>{
  const model=buildPremiumPrintModel(barbarian("2024"));
  assert.equal(model.proficiencies.masteries.length,4);for(const label of model.proficiencies.masteries){assert.match(label,/^[A-Z].+ — (Cleave|Graze|Nick|Push|Sap|Slow|Topple|Vex)$/);assert.doesNotMatch(label,/^(greataxe|handaxe|javelin|longbow|shortbow)$/);}
  assert.ok(model.proficiencies.masteries.includes("Greataxe — Cleave"));
});
