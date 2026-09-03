import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { characterActiveSpellReferences } from "../src/rules/spell-reference.js";
import { buildPremiumPrintModel } from "../src/print/model.js";
import { buildPartyQuickReference } from "../src/ui/party-print-summary.js";

function characterAt({ruleset,classId,subclass,species,background,speciesSelections={}}){
  const state=createInitialState();
  state.ruleset=ruleset;
  state.constraints.level="5";
  state.constraints.class=classId;
  state.constraints.subclass=subclass;
  state.constraints.species=species;
  state.constraints.background=background;
  state.speciesSelections={...speciesSelections};
  return generateCharacter(state);
}

test("2014 High Elf supplemental Wizard cantrip resolves through canonical active spell references",()=>{
  const character=characterAt({ruleset:"2014",classId:"druid",subclass:"circle-land",species:"elf",background:"acolyte",speciesSelections:{cantrip:"prestidigitation",extraLanguage:"Dwarvish"}});
  assert.equal(character.validation.valid,true);
  assert.deepEqual(character.speciesMagic.cantrips,["Prestidigitation"]);
  const active=characterActiveSpellReferences(character),reference=active.find(spell=>spell.id==="prestidigitation");
  assert.equal(reference?.name,"Prestidigitation");
  assert.equal(reference?.preparation,"Species Cantrip");
  assert.doesNotThrow(()=>buildPremiumPrintModel(character));
});

test("2024 Rock Gnome supplemental cantrips resolve without being misclassified as Druid class cantrips",()=>{
  const character=characterAt({ruleset:"2024",classId:"druid",subclass:"circle-land",species:"gnome",background:"soldier",speciesSelections:{lineage:"rock",spellcastingAbility:"wis"}});
  assert.equal(character.validation.valid,true);
  assert.deepEqual(character.speciesMagic.cantrips,["Mending","Prestidigitation"]);
  assert.equal(character.spells.cantrips.all.includes("prestidigitation"),false);
  const active=characterActiveSpellReferences(character),reference=active.find(spell=>spell.id==="prestidigitation");
  assert.equal(reference?.name,"Prestidigitation");
  assert.equal(reference?.preparation,"Species Cantrip");
  assert.doesNotThrow(()=>buildPremiumPrintModel(character));
});

test("DM Party Quick Reference handles a 2024 Warlock without using the generic Warlock print path",()=>{
  const warlock=characterAt({ruleset:"2024",classId:"warlock",subclass:"fiend-patron",species:"human",background:"soldier"});
  const fighter=characterAt({ruleset:"2024",classId:"fighter",subclass:"champion",species:"dwarf",background:"criminal"});
  assert.equal(warlock.validation.valid,true);
  assert.ok(warlock.spells.cantrips.all.length>0);
  const summary=buildPartyQuickReference([warlock,fighter]);
  assert.equal(summary.size,2);
  assert.equal(summary.rows[0].name,warlock.name);
  assert.match(summary.rows[0].build,/Warlock/);
  assert.match(summary.rows[0].spell,/Spell DC/);
});
