import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { characterActiveSpellReferences } from "../src/rules/spell-reference.js";

const CASTERS=["wizard","cleric","bard","druid","paladin","ranger","sorcerer","warlock"];

const fixture=overrides=>({
  ruleset:"2024",
  level:20,
  class:{id:"wizard"},
  spells:{
    cantrips:{all:[]},
    known:{all:[]},
    prepared:{all:[]},
    alwaysPrepared:[],
    spellbook:{all:[]},
    tome:{cantrips:[],rituals:[]},
    invocationSpells:[],
    mysticArcanum:{},
    ...overrides
  }
});

const byId=refs=>new Map(refs.map(ref=>[ref.id,ref]));
const activeIds=spells=>[...new Set([
  ...(spells?.cantrips?.all||[]),
  ...(spells?.tome?.cantrips||[]),
  ...(spells?.alwaysPrepared||[]),
  ...(spells?.prepared?.all||[]),
  ...(spells?.known?.all||[]),
  ...(spells?.tome?.rituals||[]),
  ...(spells?.invocationSpells||[]),
  ...Object.values(spells?.mysticArcanum||{}).filter(Boolean)
])];

function generatedCaster(classId){
  const state=createInitialState();
  state.ruleset="2024";
  state.constraints={level:"20",species:"human",class:classId,subclass:"random",background:"sage",name:`${classId} active reference audit`};
  return generateCharacter(state);
}

test("active 2024 spell references expose every supported active spell bucket with deterministic labels",()=>{
  const character=fixture({
    cantrips:{all:["fire-bolt"]},
    alwaysPrepared:["shield"],
    prepared:{all:["magic-missile","shield"]},
    known:{all:["fireball","shield"]},
    spellbook:{all:["delayed-blast-fireball"]},
    tome:{cantrips:["guidance"],rituals:["find-familiar"]},
    invocationSpells:["detect-magic"],
    mysticArcanum:{7:"delayed-blast-fireball"}
  });
  const refs=characterActiveSpellReferences(character),lookup=byId(refs);
  assert.deepEqual(refs.map(ref=>ref.id),[
    "fire-bolt","guidance","shield","magic-missile","fireball","find-familiar","detect-magic","delayed-blast-fireball"
  ]);
  assert.equal(lookup.get("fire-bolt").preparation,"Cantrip");
  assert.equal(lookup.get("guidance").preparation,"Pact Tome Cantrip");
  assert.equal(lookup.get("shield").preparation,"Always Prepared","always-prepared must win duplicate priority");
  assert.equal(lookup.get("magic-missile").preparation,"Prepared");
  assert.equal(lookup.get("fireball").preparation,"Known");
  assert.equal(lookup.get("find-familiar").preparation,"Pact Tome Ritual");
  assert.equal(lookup.get("detect-magic").preparation,"Invocation");
  assert.equal(lookup.get("delayed-blast-fireball").preparation,"Mystic Arcanum");
  assert.equal(new Set(refs.map(ref=>ref.id)).size,refs.length,"active references must not duplicate spell ids");
});

test("every generated 2024 caster exposes exactly its active spell buckets in Spell Reference",()=>{
  for(const classId of CASTERS){
    const character=generatedCaster(classId),expected=activeIds(character.spells),refs=characterActiveSpellReferences(character);
    assert.ok(expected.length>0,`${classId}: expected active magic at level 20`);
    assert.deepEqual(new Set(refs.map(ref=>ref.id)),new Set(expected),`${classId}: active Spell Reference coverage drift`);
    assert.equal(new Set(refs.map(ref=>ref.id)).size,refs.length,`${classId}: duplicate active Spell Reference id`);
    assert.ok(refs.every(ref=>ref.source==="SRD 5.2.1"),`${classId}: non-SRD reference leaked into active panel`);
  }
});

test("Wizard spellbook-only spells are not treated as active references",()=>{
  const refs=characterActiveSpellReferences(fixture({
    prepared:{all:["magic-missile"]},
    spellbook:{all:["magic-missile","shield","fireball"]}
  }));
  assert.deepEqual(refs.map(ref=>ref.id),["magic-missile"]);
});

test("generated leveled references stay fail-closed to their verified SRD page",()=>{
  const ref=characterActiveSpellReferences(fixture({known:{all:["fireball"]}}))[0];
  assert.equal(ref.id,"fireball");
  assert.equal(ref.preparation,"Known");
  assert.equal(ref.resolution,`See SRD 5.2.1 page ${ref.srdPage} for spell resolution.`);
  assert.equal(ref.source,"SRD 5.2.1");
});

test("2014 characters never expose 2024 spell references",()=>{
  const character=fixture({known:{all:["fireball"]}});character.ruleset="2014";
  assert.deepEqual(characterActiveSpellReferences(character),[]);
});

test("unknown active spell ids fail closed instead of inventing reference data",()=>{
  assert.throws(()=>characterActiveSpellReferences(fixture({prepared:{all:["definitely-not-an-srd-spell"]}})),/Missing SRD 5\.2\.1 spell reference/);
});
