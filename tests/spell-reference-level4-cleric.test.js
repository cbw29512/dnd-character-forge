import test from "node:test";
import assert from "node:assert/strict";
import { SPELL_REFERENCE_2024_LEVEL4_CLERIC } from "../src/data/spell-reference-2024-level4-cleric.js";
import { getSpellReference, activeSpellIds, missingActiveSpellReferenceIds, characterActiveSpellReferences } from "../src/rules/spell-reference.js";

test("2024 Cleric level 4 reference set covers the complete SRD class list",()=>{
  const ids=SPELL_REFERENCE_2024_LEVEL4_CLERIC.map(spell=>spell.id).sort();
  assert.deepEqual(ids,["aura-of-life","banishment","control-water","death-ward","divination","freedom-of-movement","guardian-of-faith","locate-creature","stone-shape"].sort());
  assert.equal(new Set(ids).size,9);
});

test("level 4 reference metadata preserves concentration ritual and key resolution",()=>{
  assert.equal(getSpellReference("2024","aura-of-life").concentration,true);
  assert.equal(getSpellReference("2024","banishment").resolution,"CHA save");
  assert.equal(getSpellReference("2024","control-water").range,"300 ft");
  assert.equal(getSpellReference("2024","death-ward").duration,"8 hours");
  assert.equal(getSpellReference("2024","divination").ritual,true);
  assert.equal(getSpellReference("2024","freedom-of-movement").concentration,false);
  assert.equal(getSpellReference("2024","guardian-of-faith").resolution,"DEX save");
  assert.equal(getSpellReference("2024","locate-creature").concentration,true);
  assert.equal(getSpellReference("2024","stone-shape").range,"Touch");
});

test("general active reference engine includes Wizard and Cleric leveled spells when present",()=>{
  const cleric={ruleset:"2024",class:{id:"cleric"},spells:{cantrips:{all:[]},prepared:{all:["banishment","stone-shape"]},alwaysPrepared:["aura-of-life","death-ward"]}};
  assert.deepEqual(activeSpellIds(cleric).sort(),["aura-of-life","banishment","death-ward","stone-shape"].sort());
  assert.deepEqual(missingActiveSpellReferenceIds(cleric),[]);
  assert.equal(characterActiveSpellReferences(cleric).length,4);
  const wizard={ruleset:"2024",class:{id:"wizard"},spells:{cantrips:{all:[]},prepared:{all:["banishment"]},spellbook:{all:["banishment","divination"]}}};
  assert.ok(activeSpellIds(wizard).includes("banishment"));assert.ok(activeSpellIds(wizard).includes("divination"));
  assert.deepEqual(missingActiveSpellReferenceIds(wizard),[]);
});

test("missing active spell references are reported explicitly rather than invented",()=>{
  const character={ruleset:"2024",class:{id:"cleric"},spells:{cantrips:{all:[]},prepared:{all:["nonexistent-spell"]},alwaysPrepared:[]}};
  assert.deepEqual(missingActiveSpellReferenceIds(character),["nonexistent-spell"]);
});
