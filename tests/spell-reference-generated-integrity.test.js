import test from "node:test";
import assert from "node:assert/strict";
import { SPELL_REFERENCE_2024_GENERATED } from "../src/data/spell-reference-2024-generated.js";
import { SPELL_REFERENCE_2024_BY_ID } from "../src/data/spell-reference-2024.js";

const SCHOOLS=new Set(["Abjuration","Conjuration","Divination","Enchantment","Evocation","Illusion","Necromancy","Transmutation"]);

test("generated SRD 5.2.1 spell baseline is complete, unique, and provenance-safe",()=>{
  assert.equal(SPELL_REFERENCE_2024_GENERATED.length,339,"unexpected generated SRD spell count");
  const ids=new Set();
  for(const spell of SPELL_REFERENCE_2024_GENERATED){
    assert.ok(spell&&typeof spell==="object","generated spell record missing");
    assert.ok(typeof spell.id==="string"&&spell.id.trim(),"generated spell id missing");
    assert.equal(ids.has(spell.id),false,`duplicate generated spell id: ${spell.id}`);
    ids.add(spell.id);
    assert.ok(typeof spell.name==="string"&&spell.name.trim(),`${spell.id}: name missing`);
    assert.ok(Number.isInteger(spell.level)&&spell.level>=0&&spell.level<=9,`${spell.id}: invalid level`);
    assert.ok(SCHOOLS.has(spell.school),`${spell.id}: invalid school ${spell.school}`);
    for(const field of ["castingTime","range","components","duration","effect"]){
      assert.ok(typeof spell[field]==="string"&&spell[field].trim(),`${spell.id}: ${field} missing`);
    }
    assert.equal(spell.source,"SRD 5.2.1",`${spell.id}: source drift`);
    assert.ok(Number.isInteger(spell.srdPage)&&spell.srdPage>0,`${spell.id}: invalid SRD page`);
    assert.equal(
      spell.resolution,
      `See SRD 5.2.1 page ${spell.srdPage} for spell resolution.`,
      `${spell.id}: generated resolution must fail closed to the official SRD page`
    );
  }
});

test("generated baseline does not infer attack or saving-throw resolution from prose",()=>{
  for(const spell of SPELL_REFERENCE_2024_GENERATED){
    assert.doesNotMatch(spell.resolution,/spell attack|saving throw|automatic or utility/i,`${spell.id}: inferred resolution leaked into generated baseline`);
  }
  assert.equal(
    SPELL_REFERENCE_2024_GENERATED.find(spell=>spell.id==="antipathy-sympathy")?.resolution,
    "See SRD 5.2.1 page 109 for spell resolution.",
    "Antipathy/Sympathy must not be mislabeled from incidental prose"
  );
});

test("curated references still override generated fail-closed pointers with verified quick-reference mechanics",()=>{
  assert.equal(SPELL_REFERENCE_2024_BY_ID["acid-splash"].resolution,"DEX save");
  assert.equal(SPELL_REFERENCE_2024_BY_ID["eldritch-blast"].resolution,"Ranged spell attack");
  assert.equal(SPELL_REFERENCE_2024_BY_ID["sacred-flame"].resolution,"DEX save");
});
