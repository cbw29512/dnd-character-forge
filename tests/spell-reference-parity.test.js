import test from "node:test";
import assert from "node:assert/strict";
import { SPELL_REFERENCE_2014_GENERATED } from "../src/data/spell-reference-2014-generated.js";
import { SPELL_REFERENCE_2014, SPELL_REFERENCE_2014_BY_ID } from "../src/data/spell-reference-2014.js";
import { SPELL_REFERENCE_2024_GENERATED } from "../src/data/spell-reference-2024-generated.js";
import { SPELL_REFERENCE_2024, SPELL_REFERENCE_2024_BY_ID } from "../src/data/spell-reference-2024.js";
import { getSpellReference, characterActiveSpellReferences } from "../src/rules/spell-reference.js";
import { spellDisplayRecords } from "../src/ui/spell-display-catalog.js";

const CASTERS=["wizard","cleric","bard","druid","paladin","ranger","sorcerer","warlock"];
const SUBCLASS={"2014":{druid:"circle-land",warlock:"fiend"},"2024":{druid:"circle-land",sorcerer:"draconic-sorcery",warlock:"fiend-patron"}};
const LOOKUP={"2014":SPELL_REFERENCE_2014_BY_ID,"2024":SPELL_REFERENCE_2024_BY_ID};
const SOURCE={"2014":"SRD 5.1","2024":"SRD 5.2.1"};
const normalizeApostrophe=name=>String(name).replace(/’/g,"'");

function supportedSpells(ruleset){
  const byId=new Map();
  for(const classId of CASTERS){
    const character={ruleset,level:20,class:{id:classId},subclass:{id:SUBCLASS[ruleset][classId]||"supported"}};
    for(const spell of spellDisplayRecords(character)){
      const current=byId.get(spell.id);
      if(current){
        assert.equal(normalizeApostrophe(current.name),normalizeApostrophe(spell.name),`${ruleset}: conflicting supported name for ${spell.id}`);
        assert.equal(current.level,spell.level,`${ruleset}: conflicting supported level for ${spell.id}`);
      }else byId.set(spell.id,spell);
    }
  }
  return [...byId.values()];
}

function fixture(ruleset){
  return {
    ruleset,level:20,class:{id:"warlock"},species:{id:"human"},speciesChoices:{},magicInitiates:[],
    spells:{
      cantrips:{all:["fire-bolt"]},
      alwaysPrepared:["shield"],
      prepared:{all:["magic-missile","shield"]},
      known:{all:["fireball","shield"]},
      tome:{cantrips:["guidance"],rituals:["find-familiar"]},
      invocationSpells:["detect-magic"],
      mysticArcanum:{7:"plane-shift"}
    }
  };
}

test("generated spell baselines have exact SRD counts and immutable published maps",()=>{
  assert.equal(SPELL_REFERENCE_2014_GENERATED.length,319);
  assert.equal(SPELL_REFERENCE_2024_GENERATED.length,339);
  assert.equal(SPELL_REFERENCE_2014.length,319);
  assert.equal(SPELL_REFERENCE_2024.length,339);
  for(const [ruleset,catalog,lookup] of [["2014",SPELL_REFERENCE_2014,SPELL_REFERENCE_2014_BY_ID],["2024",SPELL_REFERENCE_2024,SPELL_REFERENCE_2024_BY_ID]]){
    assert.ok(Object.isFrozen(catalog),`${ruleset}: catalog must be frozen`);
    assert.ok(Object.isFrozen(lookup),`${ruleset}: lookup must be frozen`);
    assert.equal(new Set(catalog.map(spell=>spell.id)).size,catalog.length,`${ruleset}: duplicate spell ids`);
    for(const spell of catalog){
      assert.ok(Object.isFrozen(spell),`${ruleset} ${spell.id}: record must be frozen`);
      assert.equal(spell.source,SOURCE[ruleset],`${ruleset} ${spell.id}: source drift`);
      assert.ok(Number.isInteger(spell.srdPage)&&spell.srdPage>0,`${ruleset} ${spell.id}: missing SRD page`);
      for(const field of ["name","school","castingTime","range","components","duration","resolution","effect"]){
        assert.ok(typeof spell[field]==="string"&&spell[field].trim(),`${ruleset} ${spell.id}: ${field} missing`);
      }
    }
  }
});

test("every spell Character Forge can display has an edition-correct verified SRD reference",()=>{
  for(const ruleset of ["2014","2024"]){
    const supported=supportedSpells(ruleset),lookup=LOOKUP[ruleset],missing=supported.filter(spell=>!lookup[spell.id]);
    assert.equal(missing.length,0,`${ruleset}: missing ${missing.length} references:\n${missing.map(spell=>`L${spell.level} ${spell.id} (${spell.name})`).join("\n")}`);
    for(const spell of supported){
      const reference=lookup[spell.id];
      assert.equal(normalizeApostrophe(reference.name),normalizeApostrophe(spell.name),`${ruleset} ${spell.id}: reference name drift`);
      assert.equal(reference.level,spell.level,`${ruleset} ${spell.id}: reference level drift`);
      assert.equal(reference.source,SOURCE[ruleset],`${ruleset} ${spell.id}: reference source drift`);
    }
  }
});

test("active spell buckets resolve identically in both editions without cross-edition leakage",()=>{
  const expected=["fire-bolt","guidance","shield","magic-missile","fireball","find-familiar","detect-magic","plane-shift"];
  for(const ruleset of ["2014","2024"]){
    const refs=characterActiveSpellReferences(fixture(ruleset));
    assert.deepEqual(refs.map(ref=>ref.id),expected,`${ruleset}: active spell ordering/coverage drift`);
    assert.equal(new Set(refs.map(ref=>ref.id)).size,refs.length,`${ruleset}: duplicate active reference`);
    assert.ok(refs.every(ref=>ref.source===SOURCE[ruleset]),`${ruleset}: cross-edition source leaked into active references`);
    assert.equal(refs.find(ref=>ref.id==="shield").preparation,"Always Prepared",`${ruleset}: active-source priority drift`);
  }
  assert.equal(getSpellReference("2014","fire-bolt").source,"SRD 5.1");
  assert.equal(getSpellReference("2024","fire-bolt").source,"SRD 5.2.1");
  assert.throws(()=>getSpellReference("2014","sorcerous-burst"),/Missing SRD 5\.1 spell reference/);
});

test("2014 Tiefling racial casting-level label resolves to the underlying SRD spell identity",()=>{
  const character={ruleset:"2014",level:5,class:{id:"fighter"},species:{id:"tiefling"},speciesChoices:{},magicInitiates:[],spells:null};
  const refs=characterActiveSpellReferences(character);
  assert.deepEqual(refs.map(ref=>ref.id),["thaumaturgy","hellish-rebuke","darkness"]);
  const rebuke=refs.find(ref=>ref.id==="hellish-rebuke");
  assert.equal(rebuke.grantLabel,"Hellish Rebuke (2nd-level)");
  assert.equal(rebuke.source,"SRD 5.1");
  assert.equal(rebuke.preparation,"Species Magic");
});

test("unknown active spell ids fail closed in both editions",()=>{
  for(const ruleset of ["2014","2024"]){
    const character=fixture(ruleset);character.spells.prepared.all=["definitely-not-an-srd-spell"];
    assert.throws(()=>characterActiveSpellReferences(character),new RegExp(`Missing ${ruleset==="2014"?"SRD 5\\.1":"SRD 5\\.2\\.1"} spell reference`));
  }
});
