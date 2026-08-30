import test from "node:test";
import assert from "node:assert/strict";
import { SPELL_REFERENCE_2024_BY_ID } from "../src/data/spell-reference-2024.js";
import { spellDisplayRecords } from "../src/ui/spell-display-catalog.js";

const CASTERS=["wizard","cleric","bard","druid","paladin","ranger","sorcerer","warlock"];
const SUBCLASS={druid:"circle-land",sorcerer:"draconic-sorcery",warlock:"fiend-patron"};

function supported2024Spells(){
  const byId=new Map();
  for(const classId of CASTERS){
    const character={ruleset:"2024",level:20,class:{id:classId},subclass:{id:SUBCLASS[classId]||"supported"}};
    for(const spell of spellDisplayRecords(character)){
      const current=byId.get(spell.id);
      if(current){
        assert.equal(current.name,spell.name,`conflicting supported name for ${spell.id}`);
        assert.equal(current.level,spell.level,`conflicting supported level for ${spell.id}`);
      }else byId.set(spell.id,spell);
    }
  }
  return [...byId.values()].sort((a,b)=>a.level-b.level||a.name.localeCompare(b.name));
}

test("every supported 2024 spell has a verified SRD reference",()=>{
  const supported=supported2024Spells(),missing=supported.filter(spell=>!SPELL_REFERENCE_2024_BY_ID[spell.id]);
  assert.equal(missing.length,0,`missing ${missing.length} verified 2024 spell references:\n${missing.map(spell=>`L${spell.level} ${spell.id} (${spell.name})`).join("\n")}`);
});

test("2024 spell reference identity and level match the supported spell catalog",()=>{
  for(const spell of supported2024Spells()){
    const reference=SPELL_REFERENCE_2024_BY_ID[spell.id];
    assert.ok(reference,`missing reference for ${spell.id}`);
    assert.equal(reference.name,spell.name,`${spell.id}: reference name drift`);
    assert.equal(reference.level,spell.level,`${spell.id}: reference level drift`);
    assert.equal(reference.source,"SRD 5.2.1",`${spell.id}: source drift`);
    assert.ok(Number.isInteger(reference.srdPage)&&reference.srdPage>0,`${spell.id}: missing SRD page`);
    assert.ok(reference.school,`${spell.id}: missing school`);
    assert.ok(reference.castingTime,`${spell.id}: missing casting time`);
    assert.ok(reference.range,`${spell.id}: missing range`);
    assert.ok(reference.components,`${spell.id}: missing components`);
    assert.ok(reference.duration,`${spell.id}: missing duration`);
    assert.ok(reference.resolution,`${spell.id}: missing resolution`);
    assert.ok(reference.effect,`${spell.id}: missing effect`);
  }
});
