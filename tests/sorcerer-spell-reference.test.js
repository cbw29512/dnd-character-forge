import test from "node:test";
import assert from "node:assert/strict";
import { SORCERER_SPELLS_2024 } from "../src/data/sorcerer-spells.js";
import { SPELL_REFERENCE_2024_BY_ID } from "../src/data/spell-reference-2024.js";
import { getSpellReference, resolveCantripReference } from "../src/rules/spell-reference.js";

test("every supported 2024 Sorcerer cantrip has a verified SRD 5.2.1 reference",()=>{
  try{
    const cantrips=SORCERER_SPELLS_2024.filter(spell=>spell.level===0);
    const missing=cantrips.filter(spell=>!SPELL_REFERENCE_2024_BY_ID[spell.id]).map(spell=>spell.id);
    assert.deepEqual(missing,[]);
    for(const spell of cantrips){const ref=getSpellReference("2024",spell.id);assert.equal(ref.id,spell.id);assert.equal(ref.level,0);assert.equal(ref.source,"SRD 5.2.1");assert.ok(Number.isInteger(ref.srdPage)&&ref.srdPage>0);}
  }catch(error){console.error("[sorcerer-spell-reference-test] coverage failed",error);throw error;}
});

test("Sorcerous Burst reference preserves its SRD 5.2.1 attack, damage choice, exploding die, and scaling",()=>{
  try{
    const ref=getSpellReference("2024","sorcerous-burst");
    assert.equal(ref.name,"Sorcerous Burst");assert.equal(ref.school,"Evocation");assert.equal(ref.castingTime,"Action");assert.equal(ref.range,"120 ft");assert.equal(ref.components,"V, S");assert.equal(ref.duration,"Instantaneous");assert.equal(ref.resolution,"Ranged spell attack");assert.equal(ref.srdPage,163);assert.equal(ref.damage.die,8);assert.equal(ref.damage.scales,true);assert.equal(ref.explodingDie,8);assert.match(ref.effect,/Acid, Cold, Fire, Lightning, Poison, Psychic, or Thunder/);assert.match(ref.effect,/spellcasting ability modifier/);
    const tier17=resolveCantripReference({ruleset:"2024",level:17},"sorcerous-burst");assert.match(tier17.currentEffect,/4d8/);assert.match(tier17.currentEffect,/choose one/);
  }catch(error){console.error("[sorcerer-spell-reference-test] Sorcerous Burst mechanics failed",error);throw error;}
});
