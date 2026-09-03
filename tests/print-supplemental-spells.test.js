import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildPremiumPrintModel } from "../src/print/model.js";

function druid({ruleset,species,speciesSelections}){
  const state=createInitialState();
  state.ruleset=ruleset;
  state.constraints.level="5";
  state.constraints.class="druid";
  state.constraints.subclass="circle-land";
  state.constraints.species=species;
  state.constraints.background="acolyte";
  state.speciesSelections={...speciesSelections};
  return generateCharacter(state);
}

test("2014 premium Druid print resolves a High Elf Wizard cantrip outside the Druid class list",()=>{
  const character=druid({ruleset:"2014",species:"elf",speciesSelections:{cantrip:"prestidigitation",extraLanguage:"Dwarvish"}});
  assert.equal(character.validation.valid,true);
  assert.ok(character.spells.cantrips.all.includes("prestidigitation"));
  const model=buildPremiumPrintModel(character),entry=model.spellPage.entries.find(spell=>spell.id==="prestidigitation");
  assert.equal(entry?.name,"Prestidigitation");
  assert.equal(entry?.level,0);
});

test("2024 premium Druid print resolves Rock Gnome Prestidigitation outside the Druid class list",()=>{
  const character=druid({ruleset:"2024",species:"gnome",speciesSelections:{lineage:"rock",spellcastingAbility:"wis"}});
  assert.equal(character.validation.valid,true);
  assert.ok(character.spells.cantrips.all.includes("prestidigitation"));
  const model=buildPremiumPrintModel(character),entry=model.spellPage.entries.find(spell=>spell.id==="prestidigitation");
  assert.equal(entry?.name,"Prestidigitation");
  assert.equal(entry?.level,0);
});
