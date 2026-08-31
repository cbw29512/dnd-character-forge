import test from "node:test";
import assert from "node:assert/strict";
import { SPELL_REFERENCE_2024_GENERATED } from "../src/data/spell-reference-2024-generated.js";
import { SPELL_REFERENCE_2024, SPELL_REFERENCE_2024_BY_ID } from "../src/data/spell-reference-2024.js";

const SCHOOLS=new Set(["Abjuration","Conjuration","Divination","Enchantment","Evocation","Illusion","Necromancy","Transmutation"]);
const normalizeApostropheTypography=name=>String(name).replace(/’/g,"'");

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
    // Generated records must never turn incidental prose into invented mechanics.
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

test("curated overrides preserve generated SRD identity, level, source, and page provenance",()=>{
  const generatedById=new Map(SPELL_REFERENCE_2024_GENERATED.map(spell=>[spell.id,spell]));
  for(const reference of SPELL_REFERENCE_2024){
    const generated=generatedById.get(reference.id);
    assert.ok(generated,`${reference.id}: merged reference missing generated SRD baseline`);
    assert.equal(normalizeApostropheTypography(reference.name),normalizeApostropheTypography(generated.name),`${reference.id}: curated name drift`);
    assert.equal(reference.level,generated.level,`${reference.id}: curated level drift`);
    assert.equal(reference.source,generated.source,`${reference.id}: curated source drift`);
    assert.equal(reference.srdPage,generated.srdPage,`${reference.id}: curated SRD page drift`);
  }
});

test("published spell references are recursively immutable",()=>{
  assert.ok(Object.isFrozen(SPELL_REFERENCE_2024),"spell reference array must be frozen");
  assert.ok(Object.isFrozen(SPELL_REFERENCE_2024_BY_ID),"spell reference lookup must be frozen");
  for(const spell of SPELL_REFERENCE_2024){
    assert.ok(Object.isFrozen(spell),`${spell.id}: spell record must be frozen`);
    for(const value of Object.values(spell)){
      if(value&&typeof value==="object")assert.ok(Object.isFrozen(value),`${spell.id}: nested spell metadata must be frozen`);
    }
  }
  assert.throws(()=>{SPELL_REFERENCE_2024_BY_ID["acid-splash"].resolution="Automatic";},TypeError);
  assert.equal(SPELL_REFERENCE_2024_BY_ID["acid-splash"].resolution,"DEX save");
});
