import test from "node:test";
import assert from "node:assert/strict";
import { SPELL_REFERENCE_2024_LEVEL5_CLERIC } from "../src/data/spell-reference-2024-level5-cleric.js";
import { getSpellReference, missingActiveSpellReferenceIds, characterActiveSpellReferences } from "../src/rules/spell-reference.js";

const EXPECTED=["commune","contagion","dispel-evil-and-good","flame-strike","geas","greater-restoration","hallow","insect-plague","legend-lore","mass-cure-wounds","planar-binding","raise-dead","scrying"];

test("2024 Cleric level 5 reference set covers the complete SRD class list",()=>{
  const ids=SPELL_REFERENCE_2024_LEVEL5_CLERIC.map(spell=>spell.id).sort();
  assert.deepEqual(ids,[...EXPECTED].sort());assert.equal(new Set(ids).size,13);
});

test("level 5 references preserve critical casting metadata",()=>{
  assert.equal(getSpellReference("2024","commune").ritual,true);
  assert.equal(getSpellReference("2024","contagion").resolution,"CON save");
  assert.equal(getSpellReference("2024","dispel-evil-and-good").concentration,true);
  assert.equal(getSpellReference("2024","flame-strike").resolution,"DEX save");
  assert.equal(getSpellReference("2024","geas").duration,"30 days");
  assert.match(getSpellReference("2024","greater-restoration").components,/100\+ GP/);
  assert.equal(getSpellReference("2024","hallow").castingTime,"24 hours");
  assert.equal(getSpellReference("2024","insect-plague").concentration,true);
  assert.equal(getSpellReference("2024","legend-lore").castingTime,"10 minutes");
  assert.match(getSpellReference("2024","mass-cure-wounds").effect,/5d8/);
  assert.equal(getSpellReference("2024","planar-binding").resolution,"CHA save");
  assert.match(getSpellReference("2024","raise-dead").effect,/−4 penalty/);
  assert.equal(getSpellReference("2024","scrying").concentration,true);
});

test("a level 5 Cleric reference payload has no missing reference ids",()=>{
  const character={ruleset:"2024",class:{id:"cleric"},spells:{cantrips:{all:[]},prepared:{all:[...EXPECTED]},alwaysPrepared:[]}};
  assert.deepEqual(missingActiveSpellReferenceIds(character),[]);
  assert.equal(characterActiveSpellReferences(character).length,EXPECTED.length);
});

test("every level 5 play reference is concise and printable",()=>{
  for(const spell of SPELL_REFERENCE_2024_LEVEL5_CLERIC){assert.equal(spell.level,5);assert.equal(spell.source,"SRD 5.2.1");assert.ok(Number.isInteger(spell.srdPage));assert.ok(spell.effect.length>20);assert.ok(spell.effect.length<900);}
});
